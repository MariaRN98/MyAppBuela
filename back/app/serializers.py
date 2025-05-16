# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import *

#login
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError("Credenciales incorrectas")
        return user

#registro 
class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    repetir_password = serializers.CharField(write_only=True, required=True)
    foto_perfil = serializers.ImageField(required=False)

    class Meta:
        model = Usuario
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'telefono',
            'password',
            'repetir_password',
            'fecha_nacimiento',
            'foto_perfil',
        ]

    def validate(self, data):
        if data['password'] != data['repetir_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return data

    def create(self, validated_data):
        validated_data.pop('repetir_password')
        validated_data['password'] = make_password(validated_data['password'])
        return Usuario.objects.create(**validated_data)
    
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'foto_perfil']

class DependienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependiente
        fields = '__all__'

#crear abuela
class DependienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependiente
        fields = ['nombre', 'apellidos', 'fecha_nacimiento', 'movilidad', 
                 'enfermedades', 'alergias', 'vacunas', 'medicamentos']
        
#notas
class NotaSerializer(serializers.ModelSerializer):
    autor = serializers.SerializerMethodField()
    
    class Meta:
        model = Nota
        fields = ['id', 'titulo', 'cuerpo', 'fecha_publicacoin', 'autor']
        read_only_fields = ['autor', 'fecha_publicacion']

    def get_autor(self, obj):
        return {
            'foto': obj.usuario.foto_perfil.url if obj.usuario.foto_perfil else None,
            'nombre': obj.usuario.first_name,
            'apellido': obj.usuario.last_name
        }

class CrearNotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = ['titulo', 'cuerpo', 'dependiente']

#perfil abuela
class CuidadorSerializer(serializers.ModelSerializer):
    tipo_acceso = serializers.CharField(source='rol')
    
    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'foto_perfil', 'tipo_acceso']

class DependienteDetailSerializer(serializers.ModelSerializer):
    cuidadores = serializers.SerializerMethodField()
    
    class Meta:
        model = Dependiente
        fields = [
            'id', 'foto_perfil', 'nombre', 'apellidos', 'fecha_nacimiento',
            'movilidad', 'alergias', 'medicamentos', 'enfermedades', 'vacunas', 'cuidadores'
        ]
    
    def get_cuidadores(self, obj):
        accesos = Acceso.objects.filter(dependiente=obj).select_related('usuario')
        return CuidadorSerializer([
            {
                **acceso.usuario.__dict__,
                'rol': acceso.rol
            } for acceso in accesos
        ], many=True).data

#eventos    
class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ['dependiente']  # Evita que se modifique el dependiente

class CrearEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'tipo_evento']

#compras
class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = '__all__'
        read_only_fields = ['dependiente']  # Evita modificaciones no autorizadas

class CrearCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = ['producto', 'cantidad', 'precio_aprx_unid', 'tienda', 'comprado']

class TurnoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Turno
        fields = [
            'id', 'dias_semana', 'hora_inicio', 'hora_fin',
            'usuario', 'usuario_nombre', 'dependiente'
        ]
        read_only_fields = ['dependiente']  # Evita modificación no autorizada

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"

    def validate_usuario(self, value):
        # Verifica que el usuario tenga acceso al dependiente
        if not Acceso.objects.filter(usuario=value, dependiente=self.context['dependiente']).exists():
            raise serializers.ValidationError("El usuario no tiene acceso a este dependiente")
        return value

#medicamentos
class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '__all__'
        read_only_fields = ['dependiente']  # Evita modificación no autorizada

class MarcarTomadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = ['tomado']  # Solo permite actualizar este campo

#comidas
class ComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = '__all__'
        read_only_fields = ['dependiente']  # Evita que se modifique el dependiente

class CrearComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ['nombre', 'descripcion', 'dias_semana', 'tipo_comida', 'hora']

class MarcarComidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ['comido']  # Solo permite actualizar este campo