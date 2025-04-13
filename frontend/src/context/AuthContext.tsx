import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, RegisterUserData, UserRole } from '../services/supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    roles?: UserRole[];
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  register: (userData: RegisterUserData) => Promise<{ error: any | null }>;
  updateUserData: (userData: any) => Promise<{ error: any | null }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await authService.getSession();
        if (error) throw error;
        
        if (data.session) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            user_metadata: data.session.user.user_metadata
          });
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.login(email, password);
      
      if (error) return { error };
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { error };
    }
  };

  const register = async (userData: RegisterUserData) => {
    try {
      console.log('Intentando registrar usuario con datos:', userData);
      const { data, error } = await authService.register(userData);
      
      if (error) {
        console.error('Error en AuthContext.register:', error);
        return { error };
      }
      
      console.log('Registro exitoso, datos recibidos:', data);
      
      if (data.user) {
        console.log('Actualizando estado de usuario en AuthContext');
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata
        });
        
        // Si es el ID especial, otorgar permisos de admin inmediatamente
        if (data.user.id === 'dc425d38-b183-465e-9f68-40bdc0a14e22') {
          console.log('ID de usuario especial detectado, otorgando permisos de admin');
          try {
            await authService.grantAdminRights(data.user.id);
          } catch (adminError) {
            console.error('Error otorgando permisos de admin:', adminError);
            // Continuar de todos modos
          }
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error general en registro:', error);
      return { error };
    }
  };

  const updateUserData = async (userData: any) => {
    try {
      const { data, error } = await authService.updateUserData(userData);
      
      if (error) return { error };
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error al actualizar datos de usuario:', error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUserData,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 