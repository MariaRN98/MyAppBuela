from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import LoginView, RegistroView, home_data, crear_dependiente

urlpatterns = [
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/registro/', RegistroView.as_view(), name='registro'),
    path('api/home/', home_data, name='home-data'),
    path('api/dependientes/crear/', crear_dependiente, name='crear-dependiente'),
]