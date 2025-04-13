import { supabase, authService, UserRole } from '../services/supabase';

export interface AuthMiddlewareOptions {
  requiredRoles?: UserRole[];
  redirectUrl?: string;
}

/**
 * Middleware para verificar si el usuario está autenticado
 * 
 * @param options Opciones de configuración del middleware
 * @returns Una función middleware
 */
export const authMiddleware = async (options: AuthMiddlewareOptions = {}) => {
  // Verificar si la ruta actual es una página de autenticación (registro o login)
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === '/register' || 
                     currentPath === '/login' || 
                     currentPath.includes('/recover-password') ||
                     currentPath.includes('/reset-password');
  
  // Obtener la sesión actual
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error al verificar sesión:', error);
    return {
      authenticated: false,
      error: isAuthPage ? null : 'Error al verificar la sesión', // No mostrar error en páginas de auth
      user: null,
      redirectUrl: isAuthPage ? null : (options.redirectUrl || '/login')
    };
  }
  
  // Si no hay sesión, el usuario no está autenticado
  if (!session) {
    return {
      authenticated: false,
      error: isAuthPage ? null : 'No has iniciado sesión', // No mostrar error en páginas de auth
      user: null,
      redirectUrl: isAuthPage ? null : (options.redirectUrl || '/login')
    };
  }
  
  // Comprobar si es el ID especial
  const specialUserId = 'dc425d38-b183-465e-9f68-40bdc0a14e22';
  
  // Si es el usuario especial, concederle acceso completo
  if (session.user.id === specialUserId) {
    console.log('ID de usuario especial detectado, concediendo acceso completo');
    
    // Intentar actualizar los metadatos si no tiene el rol de admin
    try {
      // Verificar si ya tiene el rol admin
      const userRoles = session.user.user_metadata?.roles || [];
      if (!userRoles.includes(UserRole.ADMIN)) {
        // Actualizar rol si es necesario
        await authService.grantAdminRights(specialUserId);
      }
    } catch (err) {
      console.error('Error al actualizar metadatos del usuario especial:', err);
      // Continuar de todos modos, le daremos acceso
    }
    
    return {
      authenticated: true,
      error: null,
      user: session.user,
      redirectUrl: null
    };
  }
  
  // Verificar roles si es necesario
  if (options.requiredRoles && options.requiredRoles.length > 0) {
    const hasRequiredRole = authService.hasRole(session.user, options.requiredRoles);
    
    if (!hasRequiredRole) {
      return {
        authenticated: true,
        error: 'No tienes permiso para acceder a este recurso',
        user: session.user,
        redirectUrl: '/'
      };
    }
  }
  
  // El usuario está autenticado y tiene los roles requeridos
  return {
    authenticated: true,
    error: null,
    user: session.user,
    redirectUrl: null
  };
};

/**
 * Middleware para verificar si una petición API está autenticada
 * Útil para proteger rutas en el backend
 */
export const apiAuthMiddleware = async (req: Request): Promise<{ 
  authenticated: boolean, 
  user: any, 
  error?: string,
  roles?: UserRole[]
}> => {
  try {
    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, user: null, error: 'Token no proporcionado' };
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { authenticated: false, user: null, error: error?.message || 'Token inválido' };
    }
    
    // Obtener roles del usuario
    const roles = authService.getUserRoles(user);
    
    return { 
      authenticated: true, 
      user,
      roles
    };
  } catch (error) {
    console.error('Error en apiAuthMiddleware:', error);
    return { authenticated: false, user: null, error: 'Error al verificar autenticación' };
  }
};

/**
 * Hook para usar el middleware de autenticación en componentes
 */
export const useAuthMiddleware = () => {
  return {
    checkAuth: async (options: AuthMiddlewareOptions = {}) => {
      return await authMiddleware(options);
    },
    /**
     * Verificar si un usuario tiene un rol específico
     */
    hasRole: (user: any, requiredRole: UserRole | UserRole[]): boolean => {
      return authService.hasRole(user, requiredRole);
    }
  };
}; 