from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import *

urlpatterns = [
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/registro/', RegistroView.as_view(), name='registro'),
    path('api/home/', home_data, name='home-data'),
    path('api/dependientes/crear/', crear_dependiente, name='crear-dependiente'),

    #notas
    path('api/dependientes/<int:dependiente_id>/notas/', lista_notas, name='lista-notas'),
    path('api/dependientes/<int:dependiente_id>/notas/crear/', crear_nota, name='crear-nota'),
    path('api/dependientes/<int:dependiente_id>/notas/<int:nota_id>/', detalle_nota, name='detalle-nota'), #get detalles, put modificar y delete eliminar con la misma url

    #perfil abuela
    path('api/dependientes/<int:pk>/', perfil_dependiente, name='perfil-dependiente'),
    path('api/dependientes/<int:pk>/gestionar/', gestionar_dependiente, name='gestionar-dependiente'),

    #eventos
    path('api/dependientes/<int:dependiente_id>/eventos/', listar_eventos, name='listar-eventos'),
    path('api/dependientes/<int:dependiente_id>/eventos/crear/', crear_evento, name='crear-evento'),
    path('api/dependientes/<int:dependiente_id>/eventos/<int:evento_id>/', detalle_evento, name='detalle-evento'),

    #compras
    path('api/dependientes/<int:dependiente_id>/compras/', lista_compras, name='lista-compras'),
    path('api/dependientes/<int:dependiente_id>/compras/crear/', crear_compra, name='crear-compra'),
    path('api/dependientes/<int:dependiente_id>/compras/<int:compra_id>/', gestionar_compra, name='gestionar-compra'),

    #turnos
    path('api/dependientes/<int:dependiente_id>/turnos/', listar_turnos, name='listar-turnos'),
    path('api/dependientes/<int:dependiente_id>/turnos/crear/', crear_turno, name='crear-turno'),
    path('api/dependientes/<int:dependiente_id>/turnos/<int:turno_id>/', gestionar_turno, name='gestionar-turno'),

    #medicamentos
    path('api/dependientes/<int:dependiente_id>/medicamentos/', listar_medicamentos, name='listar-medicamentos'),
    path('api/dependientes/<int:dependiente_id>/medicamentos/crear/', crear_medicamento, name='crear-medicamento'),
    path('api/dependientes/<int:dependiente_id>/medicamentos/<int:medicamento_id>/', editar_medicamento, name='editar-medicamento'),
    path('api/dependientes/<int:dependiente_id>/medicamentos/<int:medicamento_id>/marcar-tomado/', marcar_tomado, name='marcar-tomado'),
    path('api/dependientes/<int:dependiente_id>/medicamentos/<int:medicamento_id>/eliminar/', eliminar_medicamento, name='eliminar-medicamento'),

    #comidas
    path('api/dependientes/<int:dependiente_id>/comidas/', listar_comidas, name='listar-comidas'),
    path('api/dependientes/<int:dependiente_id>/comidas/crear/', crear_comida, name='crear-comida'),
    path('api/dependientes/<int:dependiente_id>/comidas/<int:comida_id>/', gestionar_comida, name='gestionar-comida'),
    path('api/dependientes/<int:dependiente_id>/comidas/<int:comida_id>/marcar-comido/', marcar_comido, name='marcar-comido'),
    
]