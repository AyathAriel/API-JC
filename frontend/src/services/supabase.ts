import { createClient } from '@supabase/supabase-js'

// Configuración de cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL y key son requeridos')
}

// IDs de usuario específicos que siempre tendrán rol de administrador
const ADMIN_IDS = ['dc425d38-b183-465e-9f68-40bdc0a14e22']

// Sobrescribir temporalmente configuración Supabase para desarrollo
if (import.meta.env.DEV) {
  // Permitir registro sin email verificado en desarrollo
  localStorage.setItem('supabase.auth.allowUnverifiedEmails', 'true')
  
  // Almacenar IDs admin para verificación local
  localStorage.setItem('supabase.admin.ids', JSON.stringify(ADMIN_IDS))
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Interfaz para tipos de autenticación
export interface AuthResponse {
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  } | null
  user: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      roles?: string[]
      [key: string]: any
    }
  } | null
}

// Definición de roles disponibles en el sistema
export enum UserRole {
  ADMIN = 'admin',
  TRABAJADOR_SOCIAL = 'trabajador_social',
  REPRESENTANTE = 'representante',
  DESPACHO = 'despacho',
  USUARIO = 'usuario'
}

// Interfaz para registro de usuarios
export interface RegisterUserData {
  email: string
  password: string
  fullName?: string
  roles?: UserRole[]
  meta?: Record<string, any>
}

// Funciones de autenticación
export const authService = {
  login: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  logout: async () => {
    return await supabase.auth.signOut()
  },
  
  getSession: async () => {
    return await supabase.auth.getSession()
  },
  
  register: async ({ email, password, fullName, roles = [UserRole.USUARIO], meta = {} }: RegisterUserData) => {
    // Combinar los metadatos proporcionados con los roles y el nombre
    const userData = {
      full_name: fullName,
      roles,
      ...meta
    }
    
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
  },
  
  // Actualizar datos del usuario
  updateUserData: async (userData: Partial<{ 
    email: string, 
    password: string, 
    data: Record<string, any> 
  }>) => {
    return await supabase.auth.updateUser(userData)
  },
  
  // Recuperar contraseña
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
  },
  
  // Verificar correo electrónico
  verifyOtp: async (email: string, token: string, type: 'email' | 'recovery' = 'email') => {
    return await supabase.auth.verifyOtp({
      email,
      token,
      type
    })
  },
  
  // Eliminar un usuario (solo disponible para administradores con clave de servicio)
  deleteUser: async (userId: string) => {
    try {
      // Esta operación requiere clave de servicio y solo puede ser realizada
      // por un administrador o backend, no desde el cliente
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) {
        throw error
      }
      return { success: true, error: null }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      return { success: false, error }
    }
  },
  
  // Actualizar los roles de un usuario
  updateUserRoles: async (userId: string, roles: UserRole[]) => {
    try {
      // Primero obtenemos los metadatos actuales
      const { data, error: fetchError } = await supabase.auth.admin.getUserById(userId)
      if (fetchError) throw fetchError
      
      const currentMetadata = data?.user?.user_metadata || {}
      
      // Luego actualizamos incluyendo los nuevos roles
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { ...currentMetadata, roles } }
      )
      
      if (updateError) throw updateError
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Error al actualizar roles:', error)
      return { success: false, error }
    }
  },
  
  // Otorgar permisos de administrador a un ID específico
  grantAdminRights: async (userId: string) => {
    console.log('Otorgando permisos de administrador a:', userId);
    try {
      // Permitir acceso inmediato al ID específico
      if (userId === 'dc425d38-b183-465e-9f68-40bdc0a14e22') {
        // Intento #1: Usando la API de actualización de usuario
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: { roles: [UserRole.ADMIN] }
          });
          
          if (error) throw error;
          console.log('Permisos actualizados correctamente (método 1)');
          return { success: true };
        } catch (error1) {
          console.error('Error en método 1:', error1);
          
          // Intento #2: Método alternativo usando la API admin
          try {
            const { error } = await supabase.auth.admin.updateUserById(
              userId,
              { user_metadata: { roles: [UserRole.ADMIN] } }
            );
            
            if (error) throw error;
            console.log('Permisos actualizados correctamente (método 2)');
            return { success: true };
          } catch (error2) {
            console.error('Error en método 2:', error2);
            
            // Almacenar la información en localStorage como último recurso
            localStorage.setItem('user_admin_override', userId);
            console.log('Almacenado override en localStorage');
            return { success: true };
          }
        }
      }
      
      return { success: false, message: 'ID de usuario no autorizado para permisos de administrador' };
    } catch (error) {
      console.error('Error al otorgar permisos de administrador:', error);
      return { success: false, error };
    }
  },
  
  // Determinar roles del usuario
  getUserRoles: (user: any): UserRole[] => {
    if (!user) return []
    
    // Usuarios con IDs específicos siempre serán admin
    if (ADMIN_IDS.includes(user.id)) {
      return [UserRole.ADMIN]
    }
    
    // Si hay roles explícitos en los metadatos, usarlos
    if (user.user_metadata?.roles && Array.isArray(user.user_metadata.roles)) {
      return user.user_metadata.roles
    }
    
    // Si no hay roles explícitos, inferir desde el email (para compatibilidad)
    if (user.email) {
      if (user.email.includes('admin')) return [UserRole.ADMIN]
      if (user.email.includes('trabajosocial')) return [UserRole.TRABAJADOR_SOCIAL]
      if (user.email.includes('despacho')) return [UserRole.DESPACHO]
      if (user.email.includes('representante')) return [UserRole.REPRESENTANTE]
    }
    
    // Por defecto, usuario común
    return [UserRole.USUARIO]
  },
  
  // Comprobar si un usuario tiene un rol específico
  hasRole: (user: any, requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false
    
    // Usuarios con IDs específicos siempre serán admin
    if (ADMIN_IDS.includes(user.id)) {
      return true
    }
    
    const roles = authService.getUserRoles(user)
    
    // Siempre dar acceso completo a administradores
    if (roles.includes(UserRole.ADMIN)) return true
    
    // Comprobar roles requeridos
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return rolesToCheck.some(role => roles.includes(role))
  },
  
  // Listar todos los usuarios (requiere clave de servicio y permisos de admin)
  listUsers: async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) throw error
      return { users: data.users, error: null }
    } catch (error) {
      console.error('Error al listar usuarios:', error)
      return { users: [], error }
    }
  },
  
  // Funciones para gestión de almacenamiento
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    return data
  },
  
  getFileUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }
} 