from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from .models import Solicitud
from .serializers import (
    SolicitudSerializer, 
    SolicitudCreateSerializer,
    SolicitudAprobacionRepresentanteSerializer,
    SolicitudCambioEstadoSerializer
)
from .permissions import (
    EsRepresentante, 
    EsTrabajoSocial,
    EsAlmacen,
    EsRecepcion,
    EsCreadorOPuedeRevisar
)

class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion', 'ciudadano__username', 'ciudadano__first_name', 'ciudadano__last_name']
    ordering_fields = ['fecha_creacion', 'fecha_actualizacion', 'estado']
    
    def get_queryset(self):
        """
        Filtra las solicitudes según el rol del usuario.
        """
        user = self.request.user
        
        # Superusuarios ven todo
        if user.is_superuser:
            return Solicitud.objects.all()
            
        # Filtrar por rol
        if user.rol == 'ciudadano':
            # Ciudadanos solo ven sus propias solicitudes
            return Solicitud.objects.filter(ciudadano=user)
            
        elif user.rol == 'recepcion':
            # Recepción ve todas las solicitudes
            return Solicitud.objects.all()
            
        elif user.rol == 'representante':
            # Representantes ven solicitudes pendientes o que ya aprobaron/rechazaron
            return Solicitud.objects.filter(
                Q(estado='pendiente') | 
                Q(representante=user)
            )
            
        elif user.rol == 'trabajo_social':
            # Trabajo social ve solicitudes aprobadas por representante o en proceso de inspección
            return Solicitud.objects.filter(
                Q(estado='aprobado_representante') | 
                Q(estado='en_inspeccion')
            )
            
        elif user.rol == 'almacen':
            # Almacén ve solicitudes aprobadas por trabajo social o en proceso de entrega
            return Solicitud.objects.filter(
                Q(estado='aprobado_social') | 
                Q(estado='en_entrega') | 
                Q(estado='entregado')
            )
            
        return Solicitud.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SolicitudCreateSerializer
        if self.action == 'aprobar_representante':
            return SolicitudAprobacionRepresentanteSerializer
        if self.action in ['aprobar_social', 'rechazar']:
            return SolicitudCambioEstadoSerializer
        return SolicitudSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), EsRecepcion()]
        elif self.action == 'aprobar_representante':
            return [permissions.IsAuthenticated(), EsRepresentante()]
        elif self.action == 'aprobar_social':
            return [permissions.IsAuthenticated(), EsTrabajoSocial()]
        elif self.action in ['entregar', 'marcar_entregado']:
            return [permissions.IsAuthenticated(), EsAlmacen()]
        
        return [permissions.IsAuthenticated(), EsCreadorOPuedeRevisar()]
    
    @action(detail=True, methods=['post'])
    def aprobar_representante(self, request, pk=None):
        """
        Aprobar o rechazar una solicitud por parte del representante.
        """
        solicitud = self.get_object()
        
        # Verificar estado actual
        if solicitud.estado != 'pendiente':
            return Response(
                {"error": "Solo se pueden aprobar solicitudes en estado pendiente"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(solicitud, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(representante=request.user, fecha_aprobacion_representante=timezone.now())
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def aprobar_social(self, request, pk=None):
        """
        Aprobar o rechazar una solicitud por parte de trabajo social.
        """
        solicitud = self.get_object()
        
        # Verificar estado actual
        if solicitud.estado not in ['aprobado_representante', 'en_inspeccion']:
            return Response(
                {"error": "Solo se pueden procesar solicitudes aprobadas por representante o en inspección"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        estado = request.data.get('estado')
        if estado not in ['aprobado_social', 'rechazado_social', 'en_inspeccion']:
            return Response(
                {"error": "Estado no válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(solicitud, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def entregar(self, request, pk=None):
        """
        Marcar una solicitud como en proceso de entrega.
        """
        solicitud = self.get_object()
        
        # Verificar estado actual
        if solicitud.estado != 'aprobado_social':
            return Response(
                {"error": "Solo se pueden entregar solicitudes aprobadas por trabajo social"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        solicitud.estado = 'en_entrega'
        solicitud.save()
        
        serializer = SolicitudSerializer(solicitud)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def marcar_entregado(self, request, pk=None):
        """
        Marcar una solicitud como entregada.
        """
        solicitud = self.get_object()
        
        # Verificar estado actual
        if solicitud.estado != 'en_entrega':
            return Response(
                {"error": "Solo se pueden marcar como entregadas las solicitudes en proceso de entrega"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        solicitud.estado = 'entregado'
        solicitud.save()
        
        serializer = SolicitudSerializer(solicitud)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """
        Rechazar una solicitud en cualquier estado.
        """
        solicitud = self.get_object()
        
        serializer = self.get_serializer(solicitud, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(estado='rechazado')
        
        return Response(serializer.data) 