import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { UserRole } from '../services/supabase'
import toast from 'react-hot-toast'

const AdminSetup = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userId = 'dc425d38-b183-465e-9f68-40bdc0a14e22' // ID de la cuenta a convertir en admin

  useEffect(() => {
    setAdminRole()
  }, [])

  const setAdminRole = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener usuario
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError) throw new Error(`Error al obtener el usuario: ${userError.message}`)
      
      if (!userData || !userData.user) {
        throw new Error('No se encontró el usuario con el ID proporcionado')
      }
      
      // Obtener los metadatos actuales
      const currentMetadata = userData.user.user_metadata || {}
      
      // Actualizar metadatos con rol de admin
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: { 
            ...currentMetadata, 
            roles: [UserRole.ADMIN]
          }
        }
      )
      
      if (updateError) throw new Error(`Error al actualizar el rol: ${updateError.message}`)
      
      // Si llegamos aquí, todo ha ido bien
      setSuccess(true)
      toast.success('¡Usuario actualizado correctamente a administrador!')
      
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error desconocido')
      toast.error(`Error: ${err.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }
  
  // Alternativa: actualización manual
  const manualUpdate = async () => {
    setLoading(true)
    
    try {
      // Actualización directa sin comprobaciones
      await supabase.rpc('admin_set_role', {
        user_id: userId,
        role: 'admin'
      })
      setSuccess(true)
      toast.success('¡Usuario actualizado correctamente!')
    } catch (err: any) {
      console.error('Error manual:', err)
      setError(err.message || 'Error desconocido')
      toast.error(`Error: ${err.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Configuración de Administrador</h1>
          <p className="text-gray-600">Asignando permisos de administrador</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">¡Éxito!</p>
            <p>El usuario ha sido actualizado correctamente a administrador.</p>
            <p className="mt-2">ID: {userId}</p>
            <div className="mt-4">
              <a 
                href="/configuracion" 
                className="block text-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Ir a Configuración
              </a>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-4">
              Actualizando permisos para el usuario con ID: 
              <br />
              <span className="font-mono text-sm">{userId}</span>
            </p>
            
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-700">Actualizando permisos...</span>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={setAdminRole}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  Asignar Rol de Administrador
                </button>
                
                <button
                  onClick={manualUpdate}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  Método Alternativo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSetup 