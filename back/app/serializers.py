# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import *
from datetime import date
from django.conf import settings

#login
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError("Credenciales incorrectas")
        return user

class UsuarioConAccesosSerializer(serializers.ModelSerializer):
    accesos = serializers.SerializerMethodField()
    foto_perfil_url = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'foto_perfil_url', 'telefono', 'fecha_nacimiento', 'accesos'
        ]

    def get_foto_perfil_url(self, obj):
        return obj.foto_perfil.url if obj.foto_perfil else None

    def get_accesos(self, obj):
        accesos = Acceso.objects.filter(usuario=obj).select_related('dependiente')
        return [
            {
                'dependienteId': acceso.dependiente.id,
                'dependienteNombre': acceso.dependiente.nombre,
                'rol': acceso.rol
            }
            for acceso in accesos
        ]


# class UsuarioConAccesosSerializer(serializers.ModelSerializer):
#     accesos = serializers.SerializerMethodField()

#     class Meta:
#         model = Usuario
#         fields = ['id', 'username', 'email', 'first_name', 'last_name', 'foto_perfil', 'telefono', 'fecha_nacimiento', 'accesos']

#     def get_accesos(self, obj):
#         accesos = Acceso.objects.filter(usuario=obj).select_related('dependiente')
#         return [
#             {
#                 'dependienteId': acceso.dependiente.id,
#                 'dependienteNombre': acceso.dependiente.nombre,
#                 'rol': acceso.rol
#             }
#             for acceso in accesos
#         ]

#registro 
class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    repetir_password = serializers.CharField(write_only=True, required=True)
    #foto_perfil = serializers.ImageField(required=False)
    foto_perfil_url = serializers.SerializerMethodField()

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
            'foto_perfil_url',
        ]
    def get_foto_perfil_url(self, obj):
        return obj.foto_perfil.url if obj.foto_perfil else None

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("El email ya está en uso.")
        return value

    def validate(self, data):
        if data['password'] != data['repetir_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        
        fecha_nacimiento = data.get('fecha_nacimiento')
        if fecha_nacimiento and fecha_nacimiento > date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser posterior al día actual.")
        
        return data

    def create(self, validated_data):
        validated_data.pop('repetir_password')
        validated_data['password'] = make_password(validated_data['password'])
        return Usuario.objects.create(**validated_data)
    
class UsuarioSerializer(serializers.ModelSerializer):
    #produccion
    foto_perfil = serializers.ImageField(use_url=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'foto_perfil', 'telefono', 'fecha_nacimiento']
    
    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Este email ya está en uso por otro usuario.")
        return value
    
    def validate_fecha_nacimiento(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser posterior al día actual.")
        return value
    
    #local
    # def get_foto_perfil(self, obj):
    #     if obj.foto_perfil:
    #         request = self.context.get('request')
    #         if request:
    #             return request.build_absolute_uri(obj.foto_perfil.url)
    #     return None

class DependienteSerializer(serializers.ModelSerializer):
    foto_perfil_url = serializers.SerializerMethodField()
    class Meta:
        model = Dependiente
        fields = ['id', 'nombre', 'apellidos', 'fecha_nacimiento', 'movilidad', 'enfermedades', 'alergias', 'vacunas', 'foto_perfil_url']

    # def get_foto_perfil_url(self, obj):
    #     return obj.foto_perfil.url if obj.foto_perfil else None

    def get_foto_perfil_url(self, obj):
        return obj.foto_perfil.url if obj.foto_perfil else None

    # def get_foto_perfil(self, obj):
    #     if obj.foto_perfil:
    #         request = self.context.get('request')
    #         if request:
    #             return request.build_absolute_uri(obj.foto_perfil.url)
    #     return None

#crear abuela
class DependienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependiente
        fields = ['nombre', 'apellidos', 'fecha_nacimiento', 'movilidad', 
                 'enfermedades', 'alergias', 'vacunas']
        
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
    foto_perfil_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'foto_perfil_url']

    def get_foto_perfil_url(self, obj):
        return obj.foto_perfil.url if obj.foto_perfil else None

class DependienteDetailSerializer(serializers.ModelSerializer):
    foto_perfil_url = serializers.SerializerMethodField()
    cuidadores = serializers.SerializerMethodField()
    
    class Meta:
        model = Dependiente
        fields = [
            'id', 'foto_perfil', 'foto_perfil_url', 'nombre', 'apellidos', 'fecha_nacimiento',
            'movilidad', 'alergias', 'enfermedades', 'vacunas', 'cuidadores'
        ]
    
    def get_foto_perfil_url(self, obj):
        return obj.foto_perfil.url if obj.foto_perfil else None
    
    def get_cuidadores(self, obj):
        accesos = Acceso.objects.filter(dependiente=obj).select_related('usuario')
        return [
            {
                **CuidadorSerializer(acceso.usuario, context=self.context).data,
                'tipo_acceso': acceso.rol
            }
            for acceso in accesos
        ]

#eventos    
class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ['dependiente']  

class CrearEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'tipo_evento']

#compras
class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = '__all__'
        read_only_fields = ['dependiente']  

class CrearCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = ['producto', 'cantidad', 'precio_aprx_unid', 'tienda', 'comprado']

#turnos
class TurnoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Turno
        fields = [
            'id', 'dias_semana', 'hora_inicio', 'hora_fin',
            'usuario', 'usuario_nombre', 'dependiente'
        ]
        read_only_fields = ['dependiente'] 

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"

    def validate_usuario(self, value):
        if not Acceso.objects.filter(usuario=value, dependiente=self.context['dependiente']).exists():
            raise serializers.ValidationError("El usuario no tiene acceso a este dependiente")
        return value

#medicamentos
class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '__all__'
        read_only_fields = ['dependiente']  

class MarcarTomadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = ['tomado']  

#comidas
class ComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = '__all__'
        read_only_fields = ['dependiente']  

class CrearComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ['nombre', 'descripcion', 'dias_semana', 'tipo_comida', 'hora']

class MarcarComidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ['comido']  

class AccesoSerializer(serializers.ModelSerializer):
    dependiente = DependienteSerializer()
    
    class Meta:
        model = Acceso
        fields = ['id', 'dependiente', 'rol']


class AccesoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    
    class Meta:
        model = Acceso
        fields = ['id', 'usuario', 'rol']

class NuevoAccesoSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all())  

    class Meta:
        model = Acceso
        fields = ['id', 'usuario', 'dependiente', 'rol']


class ActualizarLocalStorageSerializer(serializers.ModelSerializer):
    dependienteId = serializers.IntegerField(source='dependiente.id')
    dependienteNombre = serializers.CharField(source='dependiente.nombre')
    
    class Meta:
        model = Acceso
        fields = ['dependienteId', 'dependienteNombre', 'rol']