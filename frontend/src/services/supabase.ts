import { createClient } from '@supabase/supabase-js'

// Configuración de cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL y key son requeridos')
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
  } | null
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