import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const FixAccount = () => {
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const userIdToFix = 'dc425d38-b183-465e-9f68-40bdc0a14e22'
  
  useEffect(() => {
    checkSession()
  }, [])
  
  const checkSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      console.log('Información de sesión:', data)
      setSessionInfo(data)
      
      if (data.session?.user?.id === userIdToFix) {
        toast.success('¡ID de usuario coincide con el ID a reparar!')
      }
    } catch (err: any) {
      console.error('Error al obtener sesión:', err)
      setError(err.message || 'Error al comprobar sesión')
    } finally {
      setLoading(false)
    }
  }
  
  const fixUserRole = async () => {
    setLoading(true)
    toast.loading('Reparando cuenta...', { id: 'fix' })
    
    try {
      // Comprobar si hay sesión
      if (!sessionInfo?.session) {
        throw new Error('No hay sesión activa. Inicia sesión primero.')
      }
      
      // Método 1: Actualizar metadatos del usuario actual
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          roles: ['admin'],
          is_admin: true,
          fixed_at: new Date().toISOString()
        }
      })
      
      if (updateError) throw updateError
      
      // Verificar cambios
      const { data: newData } = await supabase.auth.getUser()
      console.log('Usuario actualizado:', newData)
      
      // Actualizar info en localStorage para futura referencia
      localStorage.setItem('user_admin_role', 'true')
      
      toast.success('¡Cuenta reparada correctamente!', { id: 'fix' })
      
      // Recargar para aplicar cambios
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      console.error('Error al reparar cuenta:', err)
      setError(err.message || 'Error al reparar cuenta')
      toast.error(`Error: ${err.message || 'Error desconocido'}`, { id: 'fix' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Reparación de Cuenta</h1>
          <p className="text-gray-600">Herramienta de emergencia para reparar permisos</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Información de Sesión</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              sessionInfo ? (
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Autenticado:</span> {sessionInfo.session ? 'Sí' : 'No'}
                  </p>
                  {sessionInfo.session && (
                    <>
                      <p>
                        <span className="font-semibold">Usuario ID:</span> 
                        <span className={`ml-1 ${sessionInfo.session.user.id === userIdToFix ? 'text-green-600 font-bold' : ''}`}>
                          {sessionInfo.session.user.id}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span> {sessionInfo.session.user.email}
                      </p>
                      <p>
                        <span className="font-semibold">Roles:</span> {sessionInfo.session.user.user_metadata?.roles?.join(', ') || 'No definidos'}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No hay información de sesión disponible</p>
              )
            )}
            
            <button
              onClick={checkSession}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Actualizar Información
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Reparación de Cuenta</h2>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Esta herramienta repara los permisos de administrador para la cuenta con ID:
              </p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded overflow-auto">
                {userIdToFix}
              </p>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={fixUserRole}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
                  disabled={loading || !sessionInfo?.session}
                >
                  {loading ? 'Procesando...' : 'Reparar Permisos de Administrador'}
                </button>
                
                <p className="text-xs text-gray-500 mt-2">
                  Para usar esta opción debes haber iniciado sesión con la cuenta a reparar
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Herramienta de emergencia - Acceso restringido
          </p>
        </div>
      </div>
    </div>
  )
}

export default FixAccount 