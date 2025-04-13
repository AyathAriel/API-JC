from django.db import models
from django.conf import settings

class Solicitud(models.Model):
    ESTADO_CHOICES = (
        ('pendiente', 'Pendiente de Revisión'),
        ('aprobado_representante', 'Aprobado por Representante'),
        ('rechazado_representante', 'Rechazado por Representante'),
        ('en_inspeccion', 'En Inspección'),
        ('aprobado_social', 'Aprobado por Trabajo Social'),
        ('rechazado_social', 'Rechazado por Trabajo Social'),
        ('en_entrega', 'En Proceso de Entrega'),
        ('entregado', 'Entregado'),
        ('rechazado', 'Rechazado'),
    )
    
    ciudadano = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='solicitudes',
        limit_choices_to={'rol': 'ciudadano'}
    )
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='solicitudes_creadas'
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_aprobacion_representante = models.DateTimeField(null=True, blank=True)
    representante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True, 
        related_name='solicitudes_revisadas',
        limit_choices_to={'rol': 'representante'}
    )
    notas_internas = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Solicitud'
        verbose_name_plural = 'Solicitudes'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.titulo} - {self.ciudadano.username} - {self.get_estado_display()}" 