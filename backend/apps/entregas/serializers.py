from rest_framework import serializers
from .models import Entrega, Producto
from apps.solicitudes.models import Solicitud
from apps.users.serializers import UserSerializer

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'unidad_medida', 'codigo', 'stock_actual']
        read_only_fields = ['id']

class EntregaSerializer(serializers.ModelSerializer):
    encargado_info = UserSerializer(source='encargado', read_only=True)
    
    class Meta:
        model = Entrega
        fields = ['id', 'solicitud', 'encargado', 'encargado_info', 'fecha_entrega', 
                 'fecha_programada', 'comentarios', 'evidencia_fotos', 'firma_receptor',
                 'productos', 'completada']
        read_only_fields = ['id', 'fecha_entrega']

class EntregaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = ['id', 'solicitud', 'fecha_programada', 'comentarios', 'productos']
        read_only_fields = ['id']
    
    def validate_solicitud(self, value):
        if value.estado != 'aprobado_social':
            raise serializers.ValidationError(
                "Solo se pueden programar entregas para solicitudes aprobadas por trabajo social"
            )
        return value
    
    def validate_productos(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Productos debe ser una lista")
        
        if len(value) == 0:
            raise serializers.ValidationError("Debe incluir al menos un producto")
        
        # Validar formato de cada producto
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Cada producto debe ser un objeto")
            
            if 'id' not in item or 'cantidad' not in item:
                raise serializers.ValidationError("Cada producto debe tener id y cantidad")
            
            # Verificar que el producto existe
            try:
                producto = Producto.objects.get(id=item['id'])
            except Producto.DoesNotExist:
                raise serializers.ValidationError(f"El producto con id {item['id']} no existe")
            
            # Verificar que hay suficiente stock
            if producto.stock_actual < item['cantidad']:
                raise serializers.ValidationError(
                    f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock_actual}"
                )
        
        return value
    
    def create(self, validated_data):
        # Asignar el usuario que crea la entrega
        solicitud = validated_data.get('solicitud')
        solicitud.estado = 'en_entrega'
        solicitud.save()
        
        validated_data['encargado'] = self.context['request'].user
        validated_data['completada'] = False
        
        # Asignar datos adicionales para productos
        productos = validated_data.get('productos', [])
        productos_completos = []
        
        for item in productos:
            producto = Producto.objects.get(id=item['id'])
            productos_completos.append({
                'id': item['id'],
                'nombre': producto.nombre,
                'cantidad': item['cantidad'],
                'unidad': producto.unidad_medida
            })
        
        validated_data['productos'] = productos_completos
        
        return super().create(validated_data)

class EntregaCompletarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = ['id', 'comentarios', 'evidencia_fotos', 'firma_receptor', 'completada']
        read_only_fields = ['id']
    
    def validate_completada(self, value):
        if not value:
            raise serializers.ValidationError("La entrega debe marcarse como completada")
        return value
    
    def validate(self, attrs):
        # Al menos una foto es requerida para completar la entrega
        evidencia_fotos = attrs.get('evidencia_fotos')
        if not evidencia_fotos or len(evidencia_fotos) == 0:
            raise serializers.ValidationError(
                {"evidencia_fotos": "Debe incluir al menos una foto como evidencia"}
            )
        
        return attrs
    
    def update(self, instance, validated_data):
        # Actualizar entrega y marcar como completada
        validated_data['completada'] = True
        
        # Actualizar estado de la solicitud
        solicitud = instance.solicitud
        solicitud.estado = 'entregado'
        solicitud.save()
        
        # Actualizar stock de productos
        for producto_entregado in instance.productos:
            try:
                producto = Producto.objects.get(id=producto_entregado['id'])
                producto.stock_actual -= producto_entregado['cantidad']
                producto.save()
            except Producto.DoesNotExist:
                pass
        
        return super().update(instance, validated_data) 