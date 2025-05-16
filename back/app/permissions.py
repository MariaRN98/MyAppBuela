# permissions.py
from rest_framework import permissions
from .models import Acceso

class EsCreadorOAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Solo creador o usuarios con rol Admin/Editor pueden editar/borrar
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (
                obj.usuario == request.user or
                Acceso.objects.filter(
                    usuario=request.user,
                    dependiente=obj.dependiente,
                    rol__in=['Admin', 'Editor']
                ).exists()
            )
        return True