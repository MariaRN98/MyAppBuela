# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario, Dependiente

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError("Credenciales incorrectas")
        return user
    
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

class DependienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependiente
        fields = ['nombre', 'apellidos', 'fecha_nacimiento', 'movilidad', 
                 'enfermedades', 'alergias', 'vacunas', 'medicamentos']