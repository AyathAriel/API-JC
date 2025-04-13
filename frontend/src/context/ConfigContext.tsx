import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'

// Definir el tipo para el tema
export type Theme = 'light' | 'dark' | 'modern' | 'system'

// Definir el tipo para el idioma
export type Language = 'es' | 'en'

// Interfaz para cada usuario del sistema
export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: string
  activo: boolean
}

// Interfaz para cada rol del sistema
export interface Role {
  id: string
  nombre: string
  descripcion: string
  permisos: string[]
  usuariosCount: number
}

// Interfaz para las notificaciones
export interface NotificationSetting {
  id: string
  name: string
  enabled: boolean
}

// Interfaz para todos los estados de configuración
export interface ConfigState {
  // Apariencia
  theme: Theme
  language: Language
  
  // Sistema
  appName: string
  distrito: string
  defaultPage: string
  notifications: NotificationSetting[]
  
  // Usuarios y roles
  users: User[]
  roles: Role[]
  currentUser: User | null
  
  // Seguridad
  twoFactorEnabled: boolean
  activeSessions: {
    id: string
    browser: string
    os: string
    location: string
    lastActive: string
    isCurrent: boolean
  }[]
}

// Interfaz para los métodos del contexto
interface ConfigContextType extends ConfigState {
  // Métodos para apariencia
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  
  // Métodos para sistema
  setAppName: (name: string) => void
  setDistrito: (distrito: string) => void
  setDefaultPage: (page: string) => void
  toggleNotification: (id: string) => void
  
  // Métodos para usuarios y roles
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  addRole: (role: Omit<Role, 'id'>) => void
  updateRole: (id: string, data: Partial<Role>) => void
  deleteRole: (id: string) => void
  
  // Métodos para seguridad
  toggleTwoFactor: () => void
  terminateSession: (id: string) => void
  terminateAllOtherSessions: () => void
  
  // Método para guardar todos los cambios
  saveChanges: () => Promise<void>
}

// Valores iniciales
const initialConfig: ConfigState = {
  // Apariencia
  theme: 'modern',
  language: 'es',
  
  // Sistema
  appName: 'Junta Comunal de San Francisco',
  distrito: 'Panamá',
  defaultPage: 'dashboard',
  notifications: [
    { id: '1', name: 'Notificaciones de solicitudes nuevas', enabled: true },
    { id: '2', name: 'Alertas de almacén', enabled: true },
    { id: '3', name: 'Correos de resumen diario', enabled: false }
  ],
  
  // Usuarios y roles
  users: [
    { id: '1', nombre: 'Administrador', apellido: 'Sistema', email: 'admin@juntacomunal.gov', telefono: '+507 123-4567', rol: 'admin', activo: true },
    { id: '2', nombre: 'Juan', apellido: 'Pérez', email: 'juan@juntacomunal.gov', telefono: '+507 234-5678', rol: 'recepcion', activo: true },
    { id: '3', nombre: 'María', apellido: 'González', email: 'maria@juntacomunal.gov', telefono: '+507 345-6789', rol: 'representante', activo: true }
  ],
  roles: [
    { id: '1', nombre: 'Administrador', descripcion: 'Acceso completo al sistema', permisos: ['admin', 'read', 'write', 'delete'], usuariosCount: 1 },
    { id: '2', nombre: 'Recepcionista', descripcion: 'Gestión de solicitudes', permisos: ['read', 'write'], usuariosCount: 1 },
    { id: '3', nombre: 'Representante', descripcion: 'Aprobación de solicitudes', permisos: ['read', 'write', 'approve'], usuariosCount: 1 }
  ],
  currentUser: { id: '1', nombre: 'Administrador', apellido: 'Sistema', email: 'admin@juntacomunal.gov', telefono: '+507 123-4567', rol: 'admin', activo: true },
  
  // Seguridad
  twoFactorEnabled: false,
  activeSessions: [
    { id: '1', browser: 'Chrome', os: 'Windows', location: 'Panamá', lastActive: 'Activa ahora', isCurrent: true },
    { id: '2', browser: 'Safari', os: 'iPhone', location: 'Panamá', lastActive: 'Hace 2 días', isCurrent: false }
  ]
}

// Crear el contexto
const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

// Props para el proveedor
interface ConfigProviderProps {
  children: ReactNode
}

// Proveedor del contexto
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  // Estado para la configuración
  const [config, setConfig] = useState<ConfigState>(initialConfig)
  
  // Cargar configuración desde localStorage al iniciar
  useEffect(() => {
    const storedConfig = localStorage.getItem('appConfig')
    if (storedConfig) {
      try {
        setConfig(JSON.parse(storedConfig))
      } catch (error) {
        console.error('Error parsing stored config:', error)
      }
    }
  }, [])
  
  // Método para guardar en localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('appConfig', JSON.stringify(config))
  }
  
  // Métodos para apariencia
  const setTheme = (theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }))
    // Aplicar el tema al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('modern')
    } else if (theme === 'modern') {
      document.documentElement.classList.add('modern')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.remove('modern')
    }
  }
  
  const setLanguage = (language: Language) => {
    setConfig(prev => ({ ...prev, language }))
  }
  
  // Métodos para sistema
  const setAppName = (appName: string) => {
    setConfig(prev => ({ ...prev, appName }))
  }
  
  const setDistrito = (distrito: string) => {
    setConfig(prev => ({ ...prev, distrito }))
  }
  
  const setDefaultPage = (defaultPage: string) => {
    setConfig(prev => ({ ...prev, defaultPage }))
  }
  
  const toggleNotification = (id: string) => {
    setConfig(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    }))
  }
  
  // Métodos para usuarios y roles
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now().toString() }
    setConfig(prev => ({
      ...prev,
      users: [...prev.users, newUser as User]
    }))
  }
  
  const updateUser = (id: string, data: Partial<User>) => {
    setConfig(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === id ? { ...user, ...data } : user
      )
    }))
  }
  
  const deleteUser = (id: string) => {
    setConfig(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== id)
    }))
  }
  
  const addRole = (role: Omit<Role, 'id'>) => {
    const newRole = { ...role, id: Date.now().toString() }
    setConfig(prev => ({
      ...prev,
      roles: [...prev.roles, newRole as Role]
    }))
  }
  
  const updateRole = (id: string, data: Partial<Role>) => {
    setConfig(prev => ({
      ...prev,
      roles: prev.roles.map(role => 
        role.id === id ? { ...role, ...data } : role
      )
    }))
  }
  
  const deleteRole = (id: string) => {
    setConfig(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== id)
    }))
  }
  
  // Métodos para seguridad
  const toggleTwoFactor = () => {
    setConfig(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }))
  }
  
  const terminateSession = (id: string) => {
    setConfig(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(session => session.id !== id)
    }))
  }
  
  const terminateAllOtherSessions = () => {
    setConfig(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(session => session.isCurrent)
    }))
  }
  
  // Método para guardar todos los cambios
  const saveChanges = async (): Promise<void> => {
    return new Promise((resolve) => {
      saveToLocalStorage()
      // Simular un tiempo de guardado
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }
  
  // Observar cambios en el tema del sistema
  useEffect(() => {
    if (config.theme === 'system') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      // Configuración inicial
      if (darkModeMediaQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      // Escuchar cambios
      darkModeMediaQuery.addEventListener('change', handleChange)
      
      return () => {
        darkModeMediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [config.theme])
  
  // Aplicar el tema inicial
  useEffect(() => {
    setTheme(config.theme)
  }, [config.theme])
  
  const value = {
    ...config,
    setTheme,
    setLanguage,
    setAppName,
    setDistrito,
    setDefaultPage,
    toggleNotification,
    addUser,
    updateUser,
    deleteUser,
    addRole,
    updateRole,
    deleteRole,
    toggleTwoFactor,
    terminateSession,
    terminateAllOtherSessions,
    saveChanges
  }
  
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}

export default ConfigContext 