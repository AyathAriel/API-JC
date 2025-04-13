from rest_framework import permissions

class EsRepresentante(permissions.BasePermission):
    """
    Verifica si el usuario es un representante.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'representante'

class EsTrabajoSocial(permissions.BasePermission):
    """
    Verifica si el usuario pertenece a trabajo social.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'trabajo_social'

class EsAlmacen(permissions.BasePermission):
    """
    Verifica si el usuario pertenece a almacén.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'almacen'

class EsRecepcion(permissions.BasePermission):
    """
    Verifica si el usuario pertenece a recepción.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'recepcion'

class EsCreadorOPuedeRevisar(permissions.BasePermission):
    """
    Permite acceso si el usuario creó la solicitud o si tiene rol de revisión apropiado.
    """
    def has_object_permission(self, request, view, obj):
        # Si es el creador de la solicitud
        if obj.creado_por == request.user:
            return True
        
        # Si es el representante asignado
        if obj.representante == request.user:
            return True
        
        # Permisos basados en roles y estado de la solicitud
        if request.user.rol == 'representante' and obj.estado == 'pendiente':
            return True
        
        if request.user.rol == 'trabajo_social' and obj.estado == 'aprobado_representante':
            return True
            
        if request.user.rol == 'almacen' and obj.estado == 'aprobado_social':
            return True
            
        return False 