import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { authMiddleware, AuthMiddlewareOptions } from '../middlewares/authMiddleware';
import { authService, UserRole } from '../services/supabase';
import toast from 'react-hot-toast';

export interface UseAuthOptions extends AuthMiddlewareOptions {
  redirectUnauthenticated?: boolean;
  redirectAuthenticated?: boolean;
  loadOnMount?: boolean;
}

/**
 * Hook personalizado que extiende useAuth del contexto con funcionalidades adicionales
 * y protección de rutas
 */
export const useAuth = (options: UseAuthOptions = {}) => {
  const defaultOptions: UseAuthOptions = {
    redirectUnauthenticated: true,
    redirectAuthenticated: false,
    loadOnMount: true,
    ...options
  };

  const navigate = useNavigate();
  const authContext = useAuthContext();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Verificar autenticación y permisos al montar el componente
  useEffect(() => {
    if (defaultOptions.loadOnMount) {
      verifyAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar roles de usuario cuando cambia el usuario
  useEffect(() => {
    if (authContext.user) {
      const roles = authService.getUserRoles(authContext.user);
      setUserRoles(roles);
    } else {
      setUserRoles([]);
    }
  }, [authContext.user]);

  /**
   * Verifica la autenticación y permisos del usuario
   */
  const verifyAuth = async () => {
    setIsVerifying(true);
    try {
      // Verificar si estamos en una página de autenticación
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/register' || 
                          currentPath === '/login' || 
                          currentPath.includes('/recover-password') ||
                          currentPath.includes('/reset-password');
      
      // Si estamos en una página de autenticación pública, simplemente verificamos sin redirigir
      if (isAuthPage) {
        setIsVerifying(false);
        return;
      }
      
      const result = await authMiddleware({
        requiredRoles: defaultOptions.requiredRoles,
        redirectUrl: defaultOptions.redirectUrl
      });

      setHasPermissions(result.authenticated && !result.error);

      // Manejar redirecciones según configuración
      if (!result.authenticated && defaultOptions.redirectUnauthenticated) {
        if (result.error) {
          toast.error(result.error);
        }
        if (result.redirectUrl) {
          navigate(result.redirectUrl);
        }
      } else if (result.authenticated && defaultOptions.redirectAuthenticated) {
        navigate('/');
      } else if (result.authenticated && result.error) {
        // Autenticado pero sin permisos
        toast.error(result.error);
        navigate('/');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setHasPermissions(false);
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Inicia sesión y verifica permisos
   */
  const login = async (email: string, password: string) => {
    try {
      toast.loading('Iniciando sesión...', { id: 'login' });
      const result = await authContext.login(email, password);
      
      if (result.error) {
        toast.error('Error de inicio de sesión: ' + result.error.message, { id: 'login' });
        return result;
      }
      
      toast.success('Inicio de sesión exitoso', { id: 'login' });
      await verifyAuth();
      return result;
    } catch (error) {
      console.error('Error inesperado en login:', error);
      toast.error('Error inesperado en inicio de sesión', { id: 'login' });
      return { error };
    }
  };

  /**
   * Registra un usuario y verifica autenticación
   */
  const register = async (userData: any) => {
    try {
      toast.loading('Registrando usuario...', { id: 'register' });
      console.log('Enviando datos de registro:', userData);
      
      const result = await authContext.register(userData);
      
      if (result.error) {
        console.error('Error en registro:', result.error);
        toast.error('Error en registro: ' + result.error.message, { id: 'register' });
        return result;
      }
      
      toast.success('Registro exitoso. Redirigiendo...', { id: 'register' });
      
      // Redirección manual para asegurar que funcione
      setTimeout(() => {
        try {
          navigate('/', { replace: true });
        } catch (navError) {
          console.error('Error al navegar:', navError);
          // Como último recurso, recargar la página
          window.location.href = '/';
        }
      }, 1500);
      
      return { error: null };
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      toast.error('Error inesperado en registro de usuario', { id: 'register' });
      return { error };
    }
  };

  /**
   * Cierra sesión y redirecciona al login
   */
  const logout = async () => {
    try {
      toast.loading('Cerrando sesión...', { id: 'logout' });
      await authContext.logout();
      toast.success('Sesión cerrada correctamente', { id: 'logout' });
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión', { id: 'logout' });
    }
  };

  /**
   * Solicita un correo para restablecer la contraseña
   */
  const requestPasswordReset = async (email: string) => {
    try {
      toast.loading('Enviando solicitud...', { id: 'passwordReset' });
      const { error } = await authService.resetPassword(email);
      if (error) {
        toast.error(error.message, { id: 'passwordReset' });
        return { error };
      }
      
      toast.success('Se ha enviado un correo con instrucciones para restablecer tu contraseña', { id: 'passwordReset' });
      return { error: null };
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      toast.error('Error al solicitar restablecimiento de contraseña', { id: 'passwordReset' });
      return { error };
    }
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!authContext.user) return false;
    
    // Asegurar que el ID específico siempre tenga acceso
    if (authContext.user.id === 'dc425d38-b183-465e-9f68-40bdc0a14e22') {
      return true;
    }
    
    return authService.hasRole(authContext.user, role);
  };

  return {
    ...authContext,
    login,
    register,
    logout,
    verifyAuth,
    isVerifying,
    hasPermissions,
    requestPasswordReset,
    hasRole,
    userRoles
  };
};

export default useAuth; 