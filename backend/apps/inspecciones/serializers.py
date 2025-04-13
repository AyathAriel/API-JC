from rest_framework import serializers
from .models import Inspeccion
from apps.solicitudes.models import Solicitud
from apps.users.serializers import UserSerializer

class InspeccionSerializer(serializers.ModelSerializer):
    inspector_info = UserSerializer(source='inspector', read_only=True)
    resultado_display = serializers.CharField(source='get_resultado_display', read_only=True)
    
    class Meta:
        model = Inspeccion
        fields = ['id', 'solicitud', 'inspector', 'inspector_info', 'fecha_inspeccion', 
                 'fecha_programada', 'resultado', 'resultado_display', 'notas', 
                 'direccion_visita', 'lat', 'lng', 'fotos']
        read_only_fields = ['id', 'fecha_inspeccion', 'resultado_display']

class InspeccionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inspeccion
        fields = ['id', 'solicitud', 'fecha_programada', 'direccion_visita', 'notas']
        read_only_fields = ['id']
    
    def validate_solicitud(self, value):
        # Verificar que la solicitud esté en un estado válido para inspección
        if value.estado not in ['aprobado_representante', 'en_inspeccion']:
            raise serializers.ValidationError(
                "Solo se pueden crear inspecciones para solicitudes aprobadas por el representante o en inspección"
            )
        return value
    
    def create(self, validated_data):
        # Asignar el usuario como inspector y actualizar estado de solicitud
        solicitud = validated_data.get('solicitud')
        solicitud.estado = 'en_inspeccion'
        solicitud.save()
        
        validated_data['inspector'] = self.context['request'].user
        validated_data['resultado'] = 'pendiente'
        
        return super().create(validated_data)

class InspeccionUpdateResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inspeccion
        fields = ['id', 'resultado', 'notas', 'fotos']
        read_only_fields = ['id']
    
    def validate_resultado(self, value):
        if value not in ['aprobado', 'rechazado']:
            raise serializers.ValidationError(
                "El resultado de la inspección debe ser 'aprobado' o 'rechazado'"
            )
        return value
    
    def update(self, instance, validated_data):
        # Actualizar resultado y actualizar estado de la solicitud
        resultado = validated_data.get('resultado')
        solicitud = instance.solicitud
        
        if resultado == 'aprobado':
            solicitud.estado = 'aprobado_social'
        elif resultado == 'rechazado':
            solicitud.estado = 'rechazado_social'
        
        solicitud.save()
        
        return super().update(instance, validated_data)