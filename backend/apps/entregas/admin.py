from django.contrib import admin
from .models import Entrega, Producto

@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ('id', 'solicitud', 'encargado', 'fecha_entrega', 'fecha_programada', 'completada')
    list_filter = ('completada', 'fecha_entrega', 'fecha_programada')
    search_fields = ('solicitud__titulo', 'comentarios')
    date_hierarchy = 'fecha_entrega'

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'codigo', 'unidad_medida', 'stock_actual')
    list_filter = ('unidad_medida',)
    search_fields = ('nombre', 'descripcion', 'codigo')
    ordering = ('nombre',) 