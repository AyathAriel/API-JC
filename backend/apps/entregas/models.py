from django.db import models
from django.conf import settings

class Entrega(models.Model):
    solicitud = models.ForeignKey(
        'solicitudes.Solicitud',
        on_delete=models.CASCADE,
        related_name='entregas'
    )
    encargado = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='entregas_realizadas',
        limit_choices_to={'rol': 'almacen'}
    )
    fecha_entrega = models.DateTimeField(auto_now_add=True)
    fecha_programada = models.DateField(null=True, blank=True)
    comentarios = models.TextField(blank=True, null=True)
    evidencia_fotos = models.JSONField(default=list, blank=True)  # Lista de URLs
    firma_receptor = models.TextField(blank=True, null=True)  # URL de la firma
    productos = models.JSONField(default=list)  # Lista de productos entregados con cantidades
    completada = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Entrega'
        verbose_name_plural = 'Entregas'
        ordering = ['-fecha_entrega']
    
    def __str__(self):
        estado = "Completada" if self.completada else "Pendiente"
        return f"Entrega de solicitud {self.solicitud.id} - {estado}"

class Producto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    unidad_medida = models.CharField(max_length=50)
    codigo = models.CharField(max_length=50, unique=True)
    stock_actual = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} - {self.stock_actual} {self.unidad_medida}" 