from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('recepcion', 'Recepción'),
        ('representante', 'Representante'),
        ('trabajo_social', 'Trabajo Social'),
        ('almacen', 'Almacén'),
        ('ciudadano', 'Ciudadano'),
    )
    
    rol = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ciudadano')
    cedula = models.CharField(max_length=20, blank=True, null=True, unique=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    supabase_uid = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}" 