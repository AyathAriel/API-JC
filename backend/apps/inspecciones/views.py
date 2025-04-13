from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Inspeccion
from .serializers import (
    InspeccionSerializer,
    InspeccionCreateSerializer,
    InspeccionUpdateResultadoSerializer
)
from apps.solicitudes.permissions import EsTrabajoSocial

class InspeccionViewSet(viewsets.ModelViewSet):
    queryset = Inspeccion.objects.all()
    serializer_class = InspeccionSerializer
    permission_classes = [permissions.IsAuthenticated, EsTrabajoSocial]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['notas', 'direccion_visita', 'solicitud__titulo']
    ordering_fields = ['fecha_inspeccion', 'fecha_programada', 'resultado']
    
    def get_queryset(self):
        user = self.request.user
        
        # Superusuarios ven todo
        if user.is_superuser:
            return Inspeccion.objects.all()
            
        # Trabajo social ve sus propias inspecciones
        if user.rol == 'trabajo_social':
            return Inspeccion.objects.filter(
                Q(inspector=user) | 
                Q(solicitud__estado='aprobado_representante')
            )
            
        # Otros roles con restricciones
        if user.rol in ['representante', 'almacen', 'recepcion']:
            # Pueden ver inspecciones relacionadas a solicitudes que pueden ver
            return Inspeccion.objects.all()
            
        return Inspeccion.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InspeccionCreateSerializer
        elif self.action in ['update_resultado', 'partial_update']:
            return InspeccionUpdateResultadoSerializer
        return InspeccionSerializer
    
    @action(detail=True, methods=['patch'])
    def update_resultado(self, request, pk=None):
        """
        Actualizar el resultado de una inspección y el estado de la solicitud asociada.
        """
        inspeccion = self.get_object()
        
        # Verificar que la inspección esté pendiente
        if inspeccion.resultado != 'pendiente':
            return Response({"error": "Solo se pueden actualizar inspecciones pendientes"})
        
        serializer = self.get_serializer(inspeccion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """
        Listar inspecciones pendientes.
        """
        queryset = self.get_queryset().filter(resultado='pendiente')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def programadas(self, request):
        """
        Listar inspecciones con fecha programada.
        """
        queryset = self.get_queryset().filter(fecha_programada__isnull=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 