import { useState, useEffect } from 'react'
import { authService, UserRole } from '../services/supabase'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface Usuario {
  id: string
  email: string
  role: UserRole
  fullName?: string
}

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USUARIO)
  const { hasRole } = useAuth()

  // Verificación inicial
  useEffect(() => {
    if (!hasRole(UserRole.ADMIN)) {
      setError('No tienes permisos para acceder a esta sección')
      setLoading(false)
      return
    }
    
    cargarUsuarios()
  }, [hasRole])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const { users, error } = await authService.listUsers()
      if (error) throw error
      
      // Transformar y ordenar usuarios
      const usuariosFormateados = users.map(user => ({
        id: user.id,
        email: user.email || 'Sin correo',
        role: authService.getUserRoles(user)[0] || UserRole.USUARIO,
        fullName: user.user_metadata?.full_name || 'Sin nombre'
      }))
      
      setUsuarios(usuariosFormateados)
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err)
      setError('Error al cargar usuarios. ' + (err.message || ''))
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as UserRole)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return
    
    toast.loading('Actualizando rol del usuario...', { id: 'updateRole' })
    try {
      const { success, error } = await authService.updateUserRoles(
        selectedUser,
        [selectedRole]
      )
      
      if (!success || error) throw error
      
      // Actualizar lista de usuarios
      setUsuarios(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser 
            ? { ...user, role: selectedRole } 
            : user
        )
      )
      
      toast.success('Rol actualizado correctamente', { id: 'updateRole' })
    } catch (err: any) {
      console.error('Error al actualizar rol:', err)
      toast.error(`Error al actualizar rol: ${err.message || ''}`, { id: 'updateRole' })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }
    
    toast.loading('Eliminando usuario...', { id: 'deleteUser' })
    try {
      const { success, error } = await authService.deleteUser(userId)
      
      if (!success || error) throw error
      
      // Actualizar lista de usuarios
      setUsuarios(prevUsers => prevUsers.filter(user => user.id !== userId))
      
      toast.success('Usuario eliminado correctamente', { id: 'deleteUser' })
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err)
      toast.error(`Error al eliminar usuario: ${err.message || ''}`, { id: 'deleteUser' })
    }
  }

  if (error && !loading) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración de Usuarios</h1>
        <button 
          onClick={cargarUsuarios}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-700">Cargando usuarios...</span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol Actual
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuarios.map(usuario => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${usuario.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 
                          usuario.role === UserRole.TRABAJADOR_SOCIAL ? 'bg-blue-100 text-blue-800' :
                          usuario.role === UserRole.REPRESENTANTE ? 'bg-green-100 text-green-800' :
                          usuario.role === UserRole.DESPACHO ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                          {usuario.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => {
                            setSelectedUser(usuario.id)
                            setSelectedRole(usuario.role)
                          }}
                        >
                          Cambiar Rol
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(usuario.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedUser && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Cambiar Rol de Usuario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario Seleccionado
                  </label>
                  <div className="text-gray-900">
                    {usuarios.find(u => u.id === selectedUser)?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={selectedRole}
                    onChange={handleRoleChange}
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleUpdateRole}
                  >
                    Actualizar Rol
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminUsuarios 