# views.py
from rest_framework import  status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from .models import Dependiente, Nota, Acceso

from django.contrib.auth import logout


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)
        user_serializer = UsuarioConAccesosSerializer(user)

        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': user_serializer.data  
        })
    


@csrf_exempt 
@api_view(['POST'])
@permission_classes([AllowAny])  
@authentication_classes([]) 
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

def tiene_permiso_escritura(usuario, dependiente):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_notas(request, dependiente_id):
    if not Acceso.objects.filter(usuario=request.user, dependiente_id=dependiente_id).exists():
        return Response({"error": "No tienes acceso a este dependiente"}, status=403)

    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    notas = Nota.objects.filter(dependiente=dependiente)
    serializer = NotaSerializer(notas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_nota(request, dependiente_id):
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente_id=dependiente_id,
        rol__in=['Admin', 'Editor']
    ).exists():
        return Response(
            {"error": "Solo administradores o editores pueden crear notas"},
            status=403
        )

    dependiente = get_object_or_404(Dependiente, pk=dependiente_id)
    serializer = NotaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(usuario=request.user, dependiente=dependiente)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detalle_nota(request, dependiente_id, nota_id):
    if not Acceso.objects.filter(usuario=request.user, dependiente_id=dependiente_id).exists():
        return Response({"error": "No tienes acceso a este dependiente"}, status=403)

    nota = get_object_or_404(Nota, pk=nota_id, dependiente_id=dependiente_id)

    if request.method in ['PUT', 'DELETE']:
        if nota.usuario != request.user and not Acceso.objects.filter(
            usuario=request.user,
            dependiente_id=dependiente_id,
            rol__in=['Admin', 'Editor']
        ).exists():
            return Response(
                {"error": "No tienes permisos para esta acción"},
                status=403
            )

    if request.method == 'GET':
        serializer = NotaSerializer(nota)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = NotaSerializer(nota, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        nota.delete()
        return Response(status=204)


#perfil abuela
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_dependiente(request, pk):
    dependiente = get_object_or_404(
        Dependiente,
        pk=pk,
        dependiente_acceso__usuario=request.user 
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
        dependiente_acceso__rol='Admin'  
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

def tiene_permiso_escritura(usuario, dependiente):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_eventos(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user 
    )
    eventos = Evento.objects.filter(dependiente=dependiente).order_by('fecha_inicio')
    serializer = EventoSerializer(eventos, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_evento(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user,
        dependiente_acceso__rol__in=['Admin', 'Editor'] 
    )
    
    serializer = CrearEventoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detalle_evento(request, dependiente_id, evento_id):
    evento = get_object_or_404(
        Evento,
        pk=evento_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user  
    )
    
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
def tiene_permiso_escritura(usuario, dependiente):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente=dependiente,
        rol__in=['Admin', 'Editor']
    ).exists()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_compras(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user 
    )
    
    comprado = request.query_params.get('comprado')
    producto = request.query_params.get('producto')
    
    compras = Compra.objects.filter(dependiente=dependiente)
    
    if comprado:
        compras = compras.filter(comprado=comprado.lower() == 'true')
    if producto:
        compras = compras.filter(producto__icontains=producto)
    
    serializer = CompraSerializer(compras.order_by('-id'), many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_compra(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user,
        dependiente_acceso__rol__in=['Admin', 'Editor'] 
    )
    
    serializer = CrearCompraSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(dependiente=dependiente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
def es_admin_dependiente(usuario, dependiente_id):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_turnos(request, dependiente_id):
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user 
    )
    turnos = Turno.objects.filter(dependiente=dependiente).order_by('dias_semana', 'hora_inicio')
    serializer = TurnoSerializer(turnos, many=True)
    return Response(serializer.data)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuarios_con_acceso(request, dependiente_id):
    try:
        if not Acceso.objects.filter(usuario=request.user, dependiente_id=dependiente_id).exists():
            return Response(
                {"error": "No tienes permisos para ver este dependiente"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        usuarios_ids = Acceso.objects.filter(
            dependiente_id=dependiente_id
        ).values_list('usuario_id', flat=True)
        
        usuarios = Usuario.objects.filter(id__in=usuarios_ids)
        
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_turno(request, dependiente_id, turno_id):
    turno = get_object_or_404(
        Turno,
        pk=turno_id,
        dependiente_id=dependiente_id
    )
    
    if request.method == 'GET':
        serializer = TurnoSerializer(turno)
        return Response(serializer.data)
    
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
def es_admin_dependiente(usuario, dependiente_id):
    return Acceso.objects.filter(
        usuario=usuario,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists()

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

@api_view(['GET', 'PUT'])  
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
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_tomado(request, dependiente_id, medicamento_id):
    medicamento = get_object_or_404(
        Medicamento,
        pk=medicamento_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user  
    )
    
    serializer = MarcarTomadoSerializer(medicamento, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    dependiente = get_object_or_404(
        Dependiente,
        pk=dependiente_id,
        dependiente_acceso__usuario=request.user
    )
    
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

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_comida(request, dependiente_id, comida_id):
    comida = get_object_or_404(
        Comida,
        pk=comida_id,
        dependiente_id=dependiente_id,
        dependiente__dependiente_acceso__usuario=request.user
    )
    
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


#listado dependientes
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
            refresh_token = request.data.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"message": "Sesión cerrada correctamente"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": "Error al cerrar sesión", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
#usuario
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def current_user(request):
    if request.method == 'GET':
        user = request.user
        serializer = UsuarioSerializer(user, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UsuarioSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dependientes_usuario(request):
    accesos = Acceso.objects.filter(usuario=request.user).select_related('dependiente')
    data = [{
        'id': acceso.dependiente.id,
        'nombre': acceso.dependiente.nombre,
        'apellidos': acceso.dependiente.apellidos,
        'rol': acceso.rol
    } for acceso in accesos]
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_acceso_usuario(request, dependiente_id):
    acceso = get_object_or_404(
        Acceso,
        usuario=request.user,
        dependiente_id=dependiente_id
    )
    acceso.delete()
    Turno.objects.filter(usuario=request.user, dependiente_id=dependiente_id).delete()
    return Response(status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def desactivar_cuenta(request):
    user = request.user
    
    try:
        user.is_active = False
        user.save()
        
        logout(request)
        
        return Response(
            {
                "message": "Cuenta desactivada exitosamente",
                "detail": "Todos tus datos se han conservado. Contacta al administrador para reactivar tu cuenta."
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {
                "error": "Error al desactivar la cuenta",
                "detail": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_accesos(request, dependiente_id):
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists():
        return Response({"error": "No tienes permisos"}, status=403)
    
    accesos = Acceso.objects.filter(dependiente_id=dependiente_id).select_related('usuario')
    serializer = AccesoSerializer(accesos, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_acceso(request, dependiente_id, acceso_id):
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists():
        return Response({"error": "No tienes permisos"}, status=403)
    
    acceso = get_object_or_404(Acceso, pk=acceso_id, dependiente_id=dependiente_id)
    acceso.delete()
    return Response(status=204)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def editar_acceso(request, dependiente_id, acceso_id):
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists():
        return Response({"error": "No tienes permisos"}, status=403)
    
    acceso = get_object_or_404(Acceso, pk=acceso_id, dependiente_id=dependiente_id)
    
    if request.method == 'GET':
        serializer = AccesoSerializer(acceso)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AccesoSerializer(acceso, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_acceso(request, dependiente_id):
    
    print("Datos recibidos:", request.data)
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente_id=dependiente_id,
        rol='Admin'
    ).exists():
        return Response({"error": "No tienes permisos para realizar esta acción"}, status=403)

    usuario_id = request.data.get('usuario')
    if Acceso.objects.filter(usuario_id=usuario_id, dependiente_id=dependiente_id).exists():
        return Response({"error": "Este usuario ya tiene acceso"}, status=400)

    serializer = NuevoAccesoSerializer(data={
        'usuario': usuario_id,
        'dependiente': dependiente_id,
        'rol': request.data.get('rol', 'Lector')
    })
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    
    print("Errores del serializador:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_usuario_por_telefono(request):
    telefono = request.query_params.get('telefono')
    if not telefono:
        return Response({"error": "Se requiere número de teléfono"}, status=400)
    
    try:
        usuario = Usuario.objects.get(telefono=telefono)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    

@api_view(['GET', 'PUT'])  
@permission_classes([IsAuthenticated])
def editar_acceso(request, dependiente_id, acceso_id):
    print("Entrando a la vista editar_acceso con método:", request.method)
    try:
        if not Acceso.objects.filter(
            usuario=request.user,
            dependiente_id=dependiente_id,
            rol='Admin'
        ).exists():
            return Response({"error": "No tienes permisos"}, status=403)
        
        acceso = Acceso.objects.get(pk=acceso_id, dependiente_id=dependiente_id)
        
        if request.method == 'GET':
            serializer = AccesoSerializer(acceso)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = AccesoSerializer(acceso, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
            
    except Acceso.DoesNotExist:
        return Response({"error": "Acceso no encontrado"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ver_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(pk=usuario_id)
        
        accesos = Acceso.objects.filter(usuario=usuario).select_related('dependiente')
        dependientes = [{
            'id': acceso.dependiente.id,
            'nombre': acceso.dependiente.nombre,
            'apellidos': acceso.dependiente.apellidos,
            'rol': acceso.rol
        } for acceso in accesos]
        
        serializer = UsuarioSerializer(usuario)
        data = serializer.data
        data['dependientes'] = dependientes
        
        return Response(data)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ver_usuario_dependiente(request, dependiente_id, usuario_id):
    if not Acceso.objects.filter(
        usuario=request.user,
        dependiente_id=dependiente_id
    ).exists():
        return Response({"error": "No autorizado"}, status=403)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def actualizar_localstorage(request):
    accesos = Acceso.objects.filter(usuario=request.user).select_related('dependiente')
    serializer = ActualizarLocalStorageSerializer(accesos, many=True)
    return Response(serializer.data)