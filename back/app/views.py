from django.shortcuts import render

# views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Dependiente, Acceso
from .permissions import EsCreadorOAdmin
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Dependiente, Nota, Acceso
from .serializers import NotaSerializer

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        
        # Generar token JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
    
# class RegistroView(APIView):
#     def post(self, request):
#         serializer = RegistroSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(
#                 {"message": "Usuario registrado correctamente"},
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# views.py


@csrf_exempt  # 👈 Esto desactiva CSRF solo para esta vista
@api_view(['POST'])
@permission_classes([AllowAny])  # 👈 Permite el acceso sin token ni login
@authentication_classes([])     # 👈 No requiere autenticación
def register_view(request):
    serializer = RegistroSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Usuario creado exitosamente"}, status=201)
    return Response(serializer.errors, status=400)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_data(request):
    usuario_serializer = UsuarioSerializer(request.user)
    
    dependientes = Dependiente.objects.filter(
        dependiente_acceso__usuario=request.user,
        dependiente_acceso__rol='Admin'
    )
    dependientes_serializer = DependienteSerializer(dependientes, many=True)
    
    return Response({
        'usuario': usuario_serializer.data,
        'dependientes': dependientes_serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_dependiente(request):
    dependiente_serializer = DependienteCreateSerializer(data=request.data)
    if dependiente_serializer.is_valid():
        dependiente = dependiente_serializer.save()

        Acceso.objects.create(
            usuario=request.user,
            dependiente=dependiente,
            rol='Admin'
        )
        
        return Response(dependiente_serializer.data, status=201)
    return Response(dependiente_serializer.errors, status=400)

# Helper para verificar permisos de escritura
def tiene_permiso_escritura(usuario, dependiente):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists()

# Listar todas las notas de un dependiente
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_notas(request, dependiente_id):
    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    notas = Nota.objects.filter(dependiente=dependiente)
    serializer = NotaSerializer(notas, many=True)
    return Response(serializer.data)

# Crear nueva nota (solo Admin/Editor)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_nota(request, dependiente_id):
    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    
    if not tiene_permiso_escritura(request.user, dependiente):
        return Response(
            {"error": "Solo administradores o editores pueden crear notas"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = NotaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(usuario=request.user, dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Ver/Editar/Eliminar nota específica
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detalle_nota(request, dependiente_id, nota_id):
    nota = get_object_or_404(Nota, pk=nota_id, dependiente_id=dependiente_id)
    
    # Verificar permisos para editar/eliminar
    if request.method in ['PUT', 'DELETE']:
        if nota.usuario != request.user and not tiene_permiso_escritura(request.user, nota.dependiente):
            return Response(
                {"error": "No tienes permisos para esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )
    
    if request.method == 'GET':
        serializer = NotaSerializer(nota)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = NotaSerializer(nota, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        nota.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


#perfil abuela
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_dependiente(request, pk):
    # Verificar que el usuario tenga acceso al dependiente
    dependiente = get_object_or_404(
        Dependiente,
        pk=pk,
        dependiente_acceso__usuario=request.user  # Solo si tiene acceso
    )
    
    serializer = DependienteDetailSerializer(dependiente)
    return Response(serializer.data)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_dependiente(request, pk):
    dependiente = get_object_or_404(
        Dependiente,
        pk=pk,
        dependiente_acceso__usuario=request.user,
        dependiente_acceso__rol='Admin'  # Solo Admin puede editar/eliminar
    )
    
    if request.method == 'PUT':
        serializer = DependienteDetailSerializer(dependiente, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        dependiente.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
#eventos

# Helper para verificar permisos
def tiene_permiso_escritura(usuario, dependiente):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists()

# Listar todos los eventos de un dependiente
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_eventos(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user  # Solo si tiene acceso
    )
    eventos = Evento.objects.filter(dependiente=dependiente).order_by('fecha_inicio')
    serializer = EventoSerializer(eventos, many=True)
    return Response(serializer.data)

# Crear evento (solo Admin/Editor)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_evento(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user,
        dependiente_acceso__rol__in=['Admin', 'Editor']  # Solo estos pueden crear
    )
    
    serializer = CrearEventoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Ver/Editar/Eliminar evento específico
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detalle_evento(request, dependiente_id, evento_id):
    evento = get_object_or_404(
        Evento,
        pk=evento_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user  # Solo si tiene acceso
    )
    
    # Solo Admin/Editor puede modificar/eliminar
    if request.method in ['PUT', 'DELETE']:
        if not tiene_permiso_escritura(request.user, evento.dependiente):
            return Response(
                {"error": "No tienes permisos para esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )
    
    if request.method == 'GET':
        serializer = EventoSerializer(evento)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = EventoSerializer(evento, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        evento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
#compras
# Helper para verificar permisos
def tiene_permiso_escritura(usuario, dependiente):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists()

# Listar/comprar items (todos los usuarios con acceso)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_compras(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user  # Solo si tiene acceso
    )
    
    # Filtros opcionales (ej: /api/compras/?comprado=false&producto=pan)
    comprado = request.query_params.get('comprado')
    producto = request.query_params.get('producto')
    
    compras = Compra.objects.filter(dependiente=dependiente)
    
    if comprado:
        compras = compras.filter(comprado=comprado.lower() == 'true')
    if producto:
        compras = compras.filter(producto__icontains=producto)
    
    serializer = CompraSerializer(compras.order_by('-id'), many=True)
    return Response(serializer.data)

# Añadir item (solo Admin/Editor)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_compra(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user,
        dependiente_acceso__rol__in=['Admin', 'Editor']  # Solo estos pueden crear
    )
    
    serializer = CrearCompraSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Marcar como comprado/editar/eliminar (solo Admin/Editor)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_compra(request, dependiente_id, compra_id):
    compra = get_object_or_404(
        Compra,
        pk=compra_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user
    )

    if request.method == 'GET':
        serializer = CompraSerializer(compra)
        return Response(serializer.data)

    if not tiene_permiso_escritura(request.user, compra.dependiente):
        return Response(
            {"error": "Solo administradores o editores pueden modificar compras"},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'PUT':
        serializer = CompraSerializer(compra, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        compra.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    
#turnos
# Helper para verificar permisos de Admin
def es_admin_dependiente(usuario, dependiente_id):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists()

# Listar turnos (todos los usuarios con acceso)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_turnos(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user  # Solo si tiene acceso
    )
    turnos = Turno.objects.filter(dependiente=dependiente).order_by('dias_semana', 'hora_inicio')
    serializer = TurnoSerializer(turnos, many=True)
    return Response(serializer.data)

# Crear turno (solo Admin)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_turno(request, dependiente_id):
    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    
    if not es_admin_dependiente(request.user, dependiente_id):
        return Response(
            {"error": "Solo el administrador puede crear turnos"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = TurnoSerializer(data=request.data, context={'dependiente': dependiente})
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Editar/Eliminar turno (solo Admin)
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_turno(request, dependiente_id, turno_id):
    turno = get_object_or_404(
        Turno,
        pk=turno_id,
        dependiente_id=dependiente_id
    )
    
    if not es_admin_dependiente(request.user, dependiente_id):
        return Response(
            {"error": "Solo el administrador puede modificar turnos"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'PUT':
        serializer = TurnoSerializer(turno, data=request.data, partial=True, context={'dependiente': turno.dependiente})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        turno.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
#medicamentos
# Helper para verificar permisos de Admin
def es_admin_dependiente(usuario, dependiente_id):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists()

# Listar medicamentos (todos los usuarios con acceso)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_medicamentos(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user
    )
    medicamentos = Medicamento.objects.filter(dependiente=dependiente)
    serializer = MedicamentoSerializer(medicamentos, many=True)
    return Response(serializer.data)

# Crear medicamento (solo Admin)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_medicamento(request, dependiente_id):
    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    
    if not es_admin_dependiente(request.user, dependiente_id):
        return Response(
            {"error": "Solo el administrador puede agregar medicamentos"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = MedicamentoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Editar medicamento (solo Admin)
@api_view(['GET', 'PUT'])  # 👈 Añade 'GET' aquí
@permission_classes([IsAuthenticated])
def editar_medicamento(request, dependiente_id, medicamento_id):
    medicamento = get_object_or_404(
        Medicamento,
        pk=medicamento_id,
        dependiente_id=dependiente_id
    )
    
    if request.method == 'GET':
        serializer = MedicamentoSerializer(medicamento)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if not es_admin_dependiente(request.user, dependiente_id):
            return Response({"error": "Solo el administrador puede editar"}, status=403)
        
        serializer = MedicamentoSerializer(medicamento, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
# Marcar como tomado/no tomado (cualquier usuario con acceso)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_tomado(request, dependiente_id, medicamento_id):
    medicamento = get_object_or_404(
        Medicamento,
        pk=medicamento_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user  # Verifica acceso
    )
    
    serializer = MarcarTomadoSerializer(medicamento, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Eliminar medicamento (solo Admin)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_medicamento(request, dependiente_id, medicamento_id):
    medicamento = get_object_or_404(
        Medicamento,
        pk=medicamento_id,
        dependiente_id=dependiente_id
    )
    
    if not es_admin_dependiente(request.user, dependiente_id):
        return Response(
            {"error": "Solo el administrador puede eliminar medicamentos"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    medicamento.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

#comidas
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_comidas(request, dependiente_id):
    # Verifica que el usuario tenga acceso al dependiente
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user
    )
    
    # Filtros opcionales
    tipo_comida = request.query_params.get('tipo_comida')
    dia_semana = request.query_params.get('dia_semana')
    
    comidas = Comida.objects.filter(dependiente=dependiente)
    
    if tipo_comida:
        comidas = comidas.filter(tipo_comida__iexact=tipo_comida)
    if dia_semana:
        comidas = comidas.filter(dias_semana__iexact=dia_semana)
    
    serializer = ComidaSerializer(comidas.order_by('hora'), many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_comida(request, dependiente_id):
    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    
    # Verifica permisos de Admin/Editor
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists():
        return Response(
            {"error": "Solo administradores o editores pueden crear comidas"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = CrearComidaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def gestionar_comida(request, dependiente_id, comida_id):
#     comida = get_object_or_404(
#         Comida,
#         pk=comida_id,
#         dependiente_id=dependiente_id
#     )
    
#     # Verifica permisos para editar/eliminar
#     if request.method in ['PUT', 'DELETE']:
#         if not Acceso.objects.filter(
#             usuario=request.user,
#             dependiente=comida.dependiente,
#             rol__in=['Admin', 'Editor']
#         ).exists():
#             return Response(
#                 {"error": "Solo administradores o editores pueden modificar comidas"},
#                 status=status.HTTP_403_FORBIDDEN
#             )
    
#     if request.method == 'PUT':
#         serializer = CrearComidaSerializer(comida, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     elif request.method == 'DELETE':
#         comida.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_comida(request, dependiente_id, comida_id):
    # Obtener la comida verificando permisos de acceso
    comida = get_object_or_404(
        Comida,
        pk=comida_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user
    )
    
    # Verificar permisos de escritura para PUT/DELETE
    if request.method in ['PUT', 'DELETE']:
        if not Acceso.objects.filter(
            usuario=request.user,
            dependiente=comida.dependiente,
            rol__in=['Admin', 'Editor']
        ).exists():
            return Response(
                {"error": "Se requieren permisos de administrador o editor"},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Manejar cada método
    if request.method == 'GET':
        serializer = ComidaSerializer(comida)
        return Response(serializer.data)
        
    elif request.method == 'PUT':
        serializer = CrearComidaSerializer(comida, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        comida.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_comido(request, dependiente_id, comida_id):
    # Cualquier usuario con acceso puede marcar como comido
    comida = get_object_or_404(
        Comida,
        pk=comida_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user
    )
    
    serializer = MarcarComidoSerializer(comida, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#header
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    serializer = UsuarioSerializer(user)
    return Response(serializer.data)

#listado dependientes
# views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dependientes_usuario(request):
    usuario = request.user
    accesos = Acceso.objects.filter(usuario=usuario)
    dependientes = [acceso.dependiente for acceso in accesos]
    serializer = DependienteSerializer(dependientes, many=True)
    return Response(serializer.data)

#logout
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Invalida el refresh token
            refresh_token = request.data.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Opcional: Elimina el token de acceso del cliente
            # (esto se manejará en el frontend)
            
            return Response(
                {"message": "Sesión cerrada correctamente"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": "Error al cerrar sesión", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )