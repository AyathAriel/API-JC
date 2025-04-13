from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Entrega, Producto
from .serializers import (
    EntregaSerializer, 
    EntregaCreateSerializer,
    EntregaCompletarSerializer,
    ProductoSerializer
)
from apps.solicitudes.permissions import EsAlmacen

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer
    permission_classes = [permissions.IsAuthenticated, EsAlmacen]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['comentarios', 'solicitud__titulo', 'solicitud__ciudadano__username']
    ordering_fields = ['fecha_entrega', 'fecha_programada', 'completada']
    
    def get_queryset(self):
        user = self.request.user
        
        # Superusuarios ven todo
        if user.is_superuser:
            return Entrega.objects.all()
        
        # Personal de almacén ve todas las entregas
        if user.rol == 'almacen':
            return Entrega.objects.all()
        
        # Otros roles ven entregas asociadas a sus solicitudes
        if user.rol in ['recepcion', 'representante', 'trabajo_social']:
            return Entrega.objects.all()
        
        # Ciudadanos ven entregas de sus solicitudes
        if user.rol == 'ciudadano':
            return Entrega.objects.filter(solicitud__ciudadano=user)
        
        return Entrega.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EntregaCreateSerializer
        elif self.action == 'completar':
            return EntregaCompletarSerializer
        return EntregaSerializer
    
    @action(detail=True, methods=['patch'])
    def completar(self, request, pk=None):
        """
        Marcar una entrega como completada con evidencia.
        """
        entrega = self.get_object()
        
        if entrega.completada:
            return Response(
                {"error": "Esta entrega ya está marcada como completada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(entrega, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(completada=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """
        Listar entregas pendientes.
        """
        queryset = self.get_queryset().filter(completada=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def programadas(self, request):
        """
        Listar entregas con fecha programada.
        """
        queryset = self.get_queryset().filter(fecha_programada__isnull=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'codigo']
    ordering_fields = ['nombre', 'stock_actual']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), EsAlmacen()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """
        Listar productos con stock disponible.
        """
        queryset = self.get_queryset().filter(stock_actual__gt=0)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        """
        Ajustar el stock de un producto.
        """
        producto = self.get_object()
        cantidad = request.data.get('cantidad', 0)
        
        if not isinstance(cantidad, int):
            return Response(
                {"error": "La cantidad debe ser un número entero"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        producto.stock_actual = max(0, producto.stock_actual + cantidad)
        producto.save()
        
        serializer = self.get_serializer(producto)
        return Response(serializer.data) 