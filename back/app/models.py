from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

# Usuario
class Usuario(AbstractUser):
    foto_perfil = models.ImageField(upload_to="usuarios/", null=True, blank=True)
    #email = models.EmailField(unique=True, max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True) 
    telefono = models.CharField(max_length=15, unique=True, null=True, blank=True)

    def __str__(self):
        return self.first_name + " " + self.last_name

# Dependiente    
class Dependiente(models.Model):
    foto_perfil = models.ImageField(upload_to="depedientes/", null=True, blank=True)
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True) 
    movilidad = models.TextField()
    enfermedades = models.TextField()
    alergias = models.TextField()
    vacunas = models.TextField()
    medicamentos = models.TextField()
    

    def __str__(self):
        return self.nombre + " " + self.apellidos
    
# Acceso
class Acceso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='usuario_acceso')
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependiente_acceso')
    rol = models.CharField(choices=
        (
            ('Admin', 'Admin'),
            ('Editor', 'Editor'),
            ('Lector', 'Lector'),
        ), max_length=100, default='Lector'
    )
    def __str__(self):
        return f'{self.usuario, self.rol}'

# Nota
class Nota(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='usuario_nota')
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependiente_nota')
    titulo = models.CharField(max_length=100)
    cuerpo = models.TextField()
    fecha_publicacoin = models.DateTimeField(null=True, blank=True) 
    def __str__(self):
        return f'{self.titulo, self.cuerpo}'

# Turno
class Turno(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='usuario_turno')
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependiente_turno')
    dias_semana = models.CharField(choices=
        (
            ('Lunes', 'Lunes'),
            ('Martes', 'Martes'),
            ('Miercoles', 'Miercoles'),
            ('Jueves', 'Jueves'),
            ('Viernes', 'Viernes'),
            ('Sabado', 'Sabado'),
            ('Domingo', 'Domingo'),
        ), max_length=100
    )
    hora_inicio = models.TimeField(null=True, blank=True) 
    hora_fin = models.TimeField(null=True, blank=True) 

    def __str__(self):
        return f'{self.usuario, self.hora_inicio, self.hora_fin}'
    
# Medicamento*
class Medicamento(models.Model):
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependendiente_medicamento')
    medicamento = models.CharField(max_length=100)
    dosis = models.CharField(max_length=100)
    dias_semana = models.CharField(choices=
        (
            ('Lunes', 'Lunes'),
            ('Martes', 'Martes'),
            ('Miercoles', 'Miercoles'),
            ('Jueves', 'Jueves'),
            ('Viernes', 'Viernes'),
            ('Sabado', 'Sabado'),
            ('Domingo', 'Domingo'),
        ), max_length=100
    )
    hora = models.TimeField(null=True, blank=True) 
    tomado = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.medicamento}'
    
# Comidas*
class Comida(models.Model):
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependendiente_comida')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    dias_semana = models.CharField(choices=
        (
            ('Lunes', 'Lunes'),
            ('Martes', 'Martes'),
            ('Miercoles', 'Miercoles'),
            ('Jueves', 'Jueves'),
            ('Viernes', 'Viernes'),
            ('Sabado', 'Sabado'),
            ('Domingo', 'Domingo'),
        ), max_length=100
    )
    tipo_comida = models.CharField(choices=
        (
            ('Desayuno', 'Desuayuno'),
            ('Mediamañana', 'Mediamañana'),
            ('Almuerzo', 'Almuerzo'),
            ('Merienda', 'Merinda'),
            ('Cena', 'Cena'),
        ), max_length=100
    )
    hora = models.TimeField(null=True, blank=True) 
    comido = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.nombre}'
    
# Eventos
class Evento(models.Model):
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependendiente_evento')
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    tipo_evento = models.CharField(choices=
        (
            ('Cita medica', 'Cita medica'),
            ('Visita', 'Visita'),
            ('Cumpleaños', 'Cumpleaños'),
            ('Cura', 'Cura'),
            ('Vacuna', 'Vacuna'),
            ('Otros', 'Otros'), #ire agregando los eventos que se me ocurran
        ), max_length=100
    )

    def __str__(self):
        return f'{self.titulo}'
    
# Compras*
class Compra(models.Model):
    dependiente = models.ForeignKey(Dependiente, on_delete=models.CASCADE, related_name='dependendiente_compra')
    producto = models.CharField(max_length=100)
    cantidad = models.IntegerField()
    precio_aprx_unid = models.DecimalField(max_digits=10, decimal_places=2)
    tienda = models.CharField(max_length=100)
    comprado = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.producto}'