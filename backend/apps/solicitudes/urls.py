from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SolicitudViewSet

router = DefaultRouter()
router.register(r'', SolicitudViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 