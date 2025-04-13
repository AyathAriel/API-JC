from rest_framework import serializers
from .models import Solicitud
from apps.users.serializers import UserSerializer
from django.utils import timezone

class SolicitudSerializer(serializers.ModelSerializer):
    ciudadano_info = UserSerializer(source='ciudadano', read_only=True)
    creador_info = UserSerializer(source='creado_por', read_only=True)
    representante_info = UserSerializer(source='representante', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Solicitud
        fields = ['id', 'titulo', 'descripcion', 'estado', 'estado_display',
                  'ciudadano', 'ciudadano_info', 'creado_por', 'creador_info',
                  'fecha_creacion', 'fecha_actualizacion', 'fecha_aprobacion_representante',
                  'representante', 'representante_info', 'notas_internas']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 
                           'fecha_aprobacion_representante', 'estado_display']

class SolicitudCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = ['id', 'titulo', 'descripcion', 'ciudadano']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        # Asignar el usuario que crea la solicitud
        validated_data['creado_por'] = self.context['request'].user
        return super().create(validated_data)

class SolicitudAprobacionRepresentanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = ['id', 'estado', 'notas_internas', 'representante']
        read_only_fields = ['id']
    
    def validate(self, attrs):
        # Validar que el estado sea uno de los permitidos
        estado = attrs.get('estado')
        if estado not in ['aprobado_representante', 'rechazado_representante']:
            raise serializers.ValidationError(
                {'estado': 'El estado debe ser aprobado_representante o rechazado_representante'})
        return attrs
    
    def update(self, instance, validated_data):
        # Si se está aprobando, registrar la fecha
        if validated_data.get('estado') == 'aprobado_representante':
            validated_data['fecha_aprobacion_representante'] = timezone.now()
        
        # Asignar el representante que toma la decisión si no se proporciona uno
        if 'representante' not in validated_data:
            validated_data['representante'] = self.context['request'].user
            
        return super().update(instance, validated_data)

class SolicitudCambioEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = ['id', 'estado', 'notas_internas']
        read_only_fields = ['id'] 