from django.contrib import admin
from .models import Inspeccion

@admin.register(Inspeccion)
class InspeccionAdmin(admin.ModelAdmin):
    list_display = ('id', 'solicitud', 'inspector', 'resultado', 'fecha_inspeccion', 'fecha_programada')
    list_filter = ('resultado', 'fecha_inspeccion', 'fecha_programada')
    search_fields = ('solicitud__titulo', 'notas', 'direccion_visita')
    date_hierarchy = 'fecha_inspeccion' 