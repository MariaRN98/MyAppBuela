from django.contrib import admin
from .models import Usuario, Dependiente, Acceso, Nota, Turno, Medicamento, Comida, Evento, Compra
from django.contrib.auth.admin import UserAdmin

admin.site.register(Usuario)
admin.site.register(Dependiente)
admin.site.register(Acceso)
admin.site.register(Nota)
admin.site.register(Turno)
admin.site.register(Medicamento)
admin.site.register(Comida)
admin.site.register(Evento)
admin.site.register(Compra)

class CustomUserAdmin(UserAdmin):
    model = Usuario
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('foto_perfil', 'fecha_nacimiento', 'telefono')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('foto_perfil', 'fecha_nacimiento', 'telefono')}),
    )

#admin.site.register(Usuario, CustomUserAdmin)
