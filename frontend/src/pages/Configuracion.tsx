import React, { useState } from 'react';
import { FaCog, FaUsers, FaBuilding, FaLock, FaUserShield } from 'react-icons/fa';
import AdminUsuarios from './AdminUsuarios';
import { UserRole } from '../services/supabase';
import useAuth from '../hooks/useAuth';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { hasRole } = useAuth();

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'usuarios', label: 'Usuarios', icon: <FaUsers />, requiredRole: UserRole.ADMIN },
    { id: 'empresa', label: 'Empresa', icon: <FaBuilding /> },
    { id: 'seguridad', label: 'Seguridad', icon: <FaLock /> },
    { id: 'roles', label: 'Roles y Permisos', icon: <FaUserShield />, requiredRole: UserRole.ADMIN },
  ];

  // Filtrar pestañas según permisos
  const filteredTabs = tabs.filter(tab => 
    !tab.requiredRole || hasRole(tab.requiredRole)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Configuración</h1>
        <p className="text-gray-600 mb-6">Administra las configuraciones de tu sistema</p>

        {/* Tabs Navigation - Horizontal */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content for each tab */}
        <div className="mt-4">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Configuración General</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Información del Sistema</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la aplicación
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        defaultValue="Juntas Comunales"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zona horaria
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                        <option>America/Panama (GMT-5)</option>
                        <option>America/New_York (GMT-5)</option>
                        <option>America/Los_Angeles (GMT-8)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Apariencia</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tema
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                        <option>Claro</option>
                        <option>Oscuro</option>
                        <option>Sistema</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color primario
                      </label>
                      <div className="flex space-x-2">
                        <span className="w-8 h-8 rounded-full bg-green-500 cursor-pointer border-2 border-white shadow-sm"></span>
                        <span className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer"></span>
                        <span className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></span>
                        <span className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></span>
                        <span className="w-8 h-8 rounded-full bg-yellow-500 cursor-pointer"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Guardar cambios
                </button>
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <AdminUsuarios />
          )}

          {activeTab === 'empresa' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Información de la Empresa</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Junta Comunal</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        defaultValue="Junta Comunal de San Francisco"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        defaultValue="Calle 50, Edificio Central, San Francisco, Panamá"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        defaultValue="+507 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        defaultValue="contacto@juntacomunalsanfrancisco.gob.pa"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        defaultValue="https://juntacomunalsanfrancisco.gob.pa"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                          Logo
                        </div>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none">
                          Cambiar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Configuración de Seguridad</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Política de contraseñas</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="complexity"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="complexity" className="font-medium text-gray-700">
                            Requerir contraseñas complejas
                          </label>
                          <p className="text-gray-500">
                            Las contraseñas deben tener al menos 8 caracteres, una mayúscula, un número y un símbolo
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="expiration"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="expiration" className="font-medium text-gray-700">
                            Expiración de contraseñas
                          </label>
                          <p className="text-gray-500">
                            Requerir cambio de contraseña cada 90 días
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Autenticación de dos factores</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="2fa"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="2fa" className="font-medium text-gray-700">
                            Requerir 2FA para todos los usuarios
                          </label>
                          <p className="text-gray-500">
                            Todos los usuarios deberán utilizar autenticación de dos factores para ingresar al sistema
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Registro de actividad</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="activity"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="activity" className="font-medium text-gray-700">
                            Registrar actividad de usuarios
                          </label>
                          <p className="text-gray-500">
                            Guardar registro de todas las acciones realizadas por los usuarios en el sistema
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Gestión de Roles y Permisos</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Configure los roles y permisos disponibles en el sistema. 
                  Esta sección permite establecer qué acciones puede realizar cada rol.
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ver Solicitudes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Crear Solicitudes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Editar Solicitudes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aprobar Solicitudes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Administrar Usuarios</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.values(UserRole).map(role => (
                        <tr key={role}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="checkbox" checked={true} disabled={role === UserRole.ADMIN} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="checkbox" checked={role !== UserRole.USUARIO} disabled={role === UserRole.ADMIN} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="checkbox" checked={role === UserRole.ADMIN || role === UserRole.TRABAJADOR_SOCIAL || role === UserRole.REPRESENTANTE} disabled={role === UserRole.ADMIN} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="checkbox" checked={role === UserRole.ADMIN || role === UserRole.REPRESENTANTE || role === UserRole.DESPACHO} disabled={role === UserRole.ADMIN} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="checkbox" checked={role === UserRole.ADMIN} disabled={role === UserRole.ADMIN} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracion; 