from django.shortcuts import render

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer, RegistroSerializer, UsuarioSerializer, DependienteSerializer, DependienteCreateSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Dependiente, Acceso

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
    
class RegistroView(APIView):
    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Usuario registrado correctamente"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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