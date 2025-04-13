import { create } from 'zustand'
import { supabase } from '../services/supabase'

interface User {
  id: string
  email: string
  nombre: string
  rol: string
  supabase_uid: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // Verificar sesión de Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        set({ isLoading: false, isAuthenticated: false })
        return
      }
      
      // Obtener datos del usuario desde nuestra API
      const token = session.access_token
      // Usar token para obtener datos del usuario
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Error al obtener datos del usuario')
      
      const userData = await response.json()
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Error inicializando autenticación:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido', 
        isLoading: false,
        isAuthenticated: false
      })
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      
      // Login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (!data.session) throw new Error('No se pudo crear la sesión')
      
      // Obtener datos del usuario desde nuestra API
      const token = data.session.access_token
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Error al obtener datos del usuario')
      
      const userData = await response.json()
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Error en login:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Error en la autenticación', 
        isLoading: false,
        isAuthenticated: false 
      })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true })
      await supabase.auth.signOut()
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Error en logout:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Error al cerrar sesión', 
        isLoading: false 
      })
    }
  },
})) 