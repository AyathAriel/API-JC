from django.db import models
from django.conf import settings

class Inspeccion(models.Model):
    RESULTADO_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    )
    
    solicitud = models.ForeignKey(
        'solicitudes.Solicitud', 
        on_delete=models.CASCADE,
        related_name='inspecciones'
    )
    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='inspecciones_realizadas',
        limit_choices_to={'rol': 'trabajo_social'}
    )
    fecha_inspeccion = models.DateTimeField(auto_now_add=True)
    fecha_programada = models.DateField(null=True, blank=True)
    resultado = models.CharField(max_length=20, choices=RESULTADO_CHOICES, default='pendiente')
    notas = models.TextField(blank=True, null=True)
    direccion_visita = models.TextField()
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    fotos = models.JSONField(default=list, blank=True)  # Almacena URLs de fotos en Supabase Storage
    
    class Meta:
        verbose_name = 'Inspección'
        verbose_name_plural = 'Inspecciones'
        ordering = ['-fecha_inspeccion']
    
    def __str__(self):
        return f"Inspección de {self.solicitud.titulo} - {self.get_resultado_display()}" 