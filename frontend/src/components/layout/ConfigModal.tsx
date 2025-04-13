import React, { useState } from 'react'
import {
  FaCog,
  FaUserEdit,
  FaUsersCog,
  FaBrush,
  FaDesktop,
  FaShieldAlt,
  FaUser,
  FaPlus,
  FaRegBell,
} from 'react-icons/fa'

import { useConfig, Theme, Language } from '../../context/ConfigContext'

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const config = useConfig()
  const [activeTab, setActiveTab] = useState<string>('perfil')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  
  // Estado local para edición
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Manejar el guardado de cambios
  const handleSaveChanges = async () => {
    try {
      setSaveStatus('saving')
      await config.saveChanges()
      setSaveStatus('success')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      setSaveStatus('error')
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="flex">
          {/* Sidebar de configuración */}
          <div className="w-64 bg-gray-100 p-4 border-r border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaCog className="mr-2 text-gray-600" /> Configuración
            </h3>
            
            <nav>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab('perfil')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === 'perfil' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaUserEdit className="mr-2" /> Perfil de Usuario
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('roles')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === 'roles' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaUsersCog className="mr-2" /> Roles y Permisos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('apariencia')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === 'apariencia' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaBrush className="mr-2" /> Apariencia
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('sistema')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === 'sistema' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaDesktop className="mr-2" /> Sistema
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('seguridad')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === 'seguridad' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaShieldAlt className="mr-2" /> Seguridad
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="mt-8">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 p-6">
            {activeTab === 'perfil' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaUserEdit className="mr-2 text-blue-600" /> Perfil de Usuario
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-md">
                        <FaUser className="w-12 h-12 text-gray-600" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full">
                        <FaUserEdit size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={config.currentUser?.nombre || ''} 
                        onChange={(e) => config.currentUser && config.updateUser(config.currentUser.id, { nombre: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <input 
                        type="text" 
                        value={config.currentUser?.apellido || ''} 
                        onChange={(e) => config.currentUser && config.updateUser(config.currentUser.id, { apellido: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                      <input 
                        type="email" 
                        value={config.currentUser?.email || ''} 
                        onChange={(e) => config.currentUser && config.updateUser(config.currentUser.id, { email: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input 
                        type="tel" 
                        value={config.currentUser?.telefono || ''} 
                        onChange={(e) => config.currentUser && config.updateUser(config.currentUser.id, { telefono: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={handleSaveChanges}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
                      {saveStatus === 'success' && <span className="ml-2 text-green-500">✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'roles' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaUsersCog className="mr-2 text-blue-600" /> Roles y Permisos
                </h2>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Roles del Sistema</h3>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center">
                      <FaPlus className="mr-1" /> Añadir Rol
                    </button>
                  </div>
                  
                  <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {config.roles.map(role => (
                          <tr key={role.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.nombre}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.descripcion}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.usuariosCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => config.deleteRole(role.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Usuarios del Sistema</h3>
                    <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {config.users.map(user => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.nombre} {user.apellido}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.rol}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => config.deleteUser(user.id)}
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
                </div>
              </div>
            )}
            
            {activeTab === 'apariencia' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaBrush className="mr-2 text-blue-600" /> Apariencia
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tema</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`border p-4 rounded-lg cursor-pointer ${config.theme === 'light' ? 'border-blue-500' : 'hover:border-blue-500'} bg-white`}
                        onClick={() => config.setTheme('light')}
                      >
                        <div className="h-24 bg-white border border-gray-200 mb-2 rounded">
                          <div className="h-6 bg-blue-600 rounded-t"></div>
                        </div>
                        <div className="text-center font-medium">Claro</div>
                      </div>
                      <div 
                        className={`border p-4 rounded-lg cursor-pointer ${config.theme === 'dark' ? 'border-blue-500' : 'hover:border-blue-500'} bg-white`}
                        onClick={() => config.setTheme('dark')}
                      >
                        <div className="h-24 bg-gray-900 border border-gray-700 mb-2 rounded">
                          <div className="h-6 bg-blue-600 rounded-t"></div>
                        </div>
                        <div className="text-center font-medium">Oscuro</div>
                      </div>
                      <div 
                        className={`border p-4 rounded-lg cursor-pointer ${config.theme === 'system' ? 'border-blue-500' : 'hover:border-blue-500'} bg-white`}
                        onClick={() => config.setTheme('system')}
                      >
                        <div className="h-24 bg-gradient-to-b from-white to-gray-900 border border-gray-200 mb-2 rounded">
                          <div className="h-6 bg-blue-600 rounded-t"></div>
                        </div>
                        <div className="text-center font-medium">Sistema</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Idioma</h3>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="lang-es" 
                          name="language" 
                          checked={config.language === 'es'} 
                          onChange={() => config.setLanguage('es')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                        />
                        <label htmlFor="lang-es" className="text-gray-700">Español</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="lang-en" 
                          name="language" 
                          checked={config.language === 'en'} 
                          onChange={() => config.setLanguage('en')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                        />
                        <label htmlFor="lang-en" className="text-gray-700">Inglés</label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={handleSaveChanges}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? 'Aplicando Cambios...' : 'Aplicar Cambios'}
                      {saveStatus === 'success' && <span className="ml-2 text-green-500">✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'sistema' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaDesktop className="mr-2 text-blue-600" /> Sistema
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Configuración General</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Junta Comunal</label>
                        <input 
                          type="text" 
                          value={config.appName} 
                          onChange={(e) => config.setAppName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                        <input 
                          type="text" 
                          value={config.distrito} 
                          onChange={(e) => config.setDistrito(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Página Inicial</label>
                        <select 
                          value={config.defaultPage}
                          onChange={(e) => config.setDefaultPage(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="dashboard">Dashboard</option>
                          <option value="solicitudes">Solicitudes</option>
                          <option value="despacho-superior">Despacho Superior</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notificaciones</h3>
                    <div className="space-y-2">
                      {config.notifications.map(notification => (
                        <div key={notification.id} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
                          <div className="flex items-center">
                            <FaRegBell className="text-gray-500 mr-2" />
                            <span>{notification.name}</span>
                          </div>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input 
                              type="checkbox" 
                              checked={notification.enabled} 
                              onChange={() => config.toggleNotification(notification.id)}
                              id={`notification-${notification.id}`} 
                              className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" 
                            />
                            <label htmlFor={`notification-${notification.id}`} className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={handleSaveChanges}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? 'Guardando Configuración...' : 'Guardar Configuración'}
                      {saveStatus === 'success' && <span className="ml-2 text-green-500">✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'seguridad' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-600" /> Seguridad
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cambiar Contraseña</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                        <input 
                          type="password" 
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <button 
                          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          disabled={!newPassword || newPassword !== confirmPassword}
                        >
                          Actualizar Contraseña
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Autenticación de Dos Factores</h3>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Autenticación de Dos Factores</p>
                          <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            checked={config.twoFactorEnabled} 
                            onChange={() => config.toggleTwoFactor()}
                            id="twoFactor" 
                            className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" 
                          />
                          <label htmlFor="twoFactor" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sesiones Activas</h3>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <div className="space-y-2">
                        {config.activeSessions.map(session => (
                          <div key={session.id} className="flex items-center justify-between p-2 border-b pb-2">
                            <div>
                              <p className="font-medium">{session.browser} en {session.os}</p>
                              <p className="text-xs text-gray-500">{session.location} · {session.lastActive}</p>
                            </div>
                            <div>
                              {session.isCurrent ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Actual
                                </span>
                              ) : (
                                <button 
                                  className="text-sm text-red-600"
                                  onClick={() => config.terminateSession(session.id)}
                                >
                                  Cerrar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <button 
                          className="text-sm text-red-600"
                          onClick={() => config.terminateAllOtherSessions()}
                        >
                          Cerrar todas las otras sesiones
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigModal 