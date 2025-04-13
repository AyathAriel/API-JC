import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaRobot, FaCog } from 'react-icons/fa'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Juntas Comunales</span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/solicitudes"
                className={`block py-2 px-4 rounded transition ${
                  location.pathname === '/solicitudes'
                    ? 'bg-primary-600 text-white'
                    : 'text-white hover:bg-primary-600'
                }`}
              >
                Recepción
              </Link>
              <Link to="/representante" className="px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 rounded transition-colors">
                Representante
              </Link>
              <Link to="/despacho-superior" className="px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 rounded transition-colors">
                Despacho Superior/Secretaría
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setAiModalOpen(true)}
              className="hidden md:flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 transition-colors"
            >
              <FaRobot className="mr-2" />
              <span>Agente IA</span>
            </button>
            
            <button 
              onClick={() => setConfigModalOpen(true)}
              className="hidden md:flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 transition-colors"
            >
              <FaCog className="mr-2" />
              <span>Configuración</span>
            </button>
            
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-primary-600 transition-colors"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/solicitudes"
              className={`block px-3 py-2 text-base font-medium text-white hover:bg-primary-600 rounded-md transition-colors ${
                location.pathname === '/solicitudes' ? 'bg-primary-600 text-white' : ''
              }`}
            >
              Recepción
            </Link>
            <Link to="/representante" className="block px-3 py-2 text-base font-medium text-white hover:bg-primary-600 rounded-md transition-colors">
              Representante
            </Link>
            <Link to="/despacho-superior" className="block px-3 py-2 text-base font-medium text-white hover:bg-primary-600 rounded-md transition-colors">
              Despacho Superior/Secretaría
            </Link>
            <button 
              onClick={() => setAiModalOpen(true)}
              className="w-full flex items-center px-3 py-2 text-base font-medium text-white hover:bg-accent-600 rounded-md transition-colors"
            >
              <FaRobot className="mr-2" />
              <span>Agente IA</span>
            </button>
            <button 
              onClick={() => setConfigModalOpen(true)}
              className="w-full flex items-center px-3 py-2 text-base font-medium text-white hover:bg-secondary-600 rounded-md transition-colors"
            >
              <FaCog className="mr-2" />
              <span>Configuración</span>
            </button>
          </div>
        </div>
      )}
      
      {/* AI Assistant Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-accent-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaRobot className="h-6 w-6 text-accent-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-neutral-800">Asistente de IA</h3>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-600 mb-4">¿En qué puedo ayudarte hoy?</p>
                      <div className="bg-neutral-50 p-3 rounded-lg mb-4">
                        <p className="text-xs font-medium text-neutral-700 mb-2">Capacidades:</p>
                        <ul className="text-xs text-neutral-600 list-disc pl-5 space-y-1">
                          <li>Consultar datos de solicitudes y ciudadanos</li>
                          <li>Generar informes y estadísticas</li>
                          <li>Verificar requisitos de programas sociales</li>
                          <li>Responder preguntas sobre procedimientos</li>
                        </ul>
                      </div>
                      <textarea
                        className="w-full px-3 py-2 text-neutral-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                        rows={4}
                        placeholder="Escribe tu consulta aquí..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    console.log('Enviando consulta:', aiQuery);
                    setAiModalOpen(false);
                    setAiQuery('');
                  }}
                >
                  Enviar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setAiModalOpen(false);
                    setAiQuery('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Configuration Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-secondary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaCog className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-neutral-800">Configuración</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">Tema</label>
                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                          <option value="light">Claro</option>
                          <option value="dark">Oscuro</option>
                          <option value="system">Sistema</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">Idioma</label>
                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                          <option value="es">Español</option>
                          <option value="en">Inglés</option>
                        </select>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="notifications"
                            name="notifications"
                            type="checkbox"
                            className="focus:ring-2 focus:ring-primary-500 h-4 w-4 text-primary-600 border-neutral-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="notifications" className="font-medium text-neutral-700">
                            Notificaciones
                          </label>
                          <p className="text-neutral-500">Recibir alertas sobre nuevas solicitudes y actualizaciones.</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700">Vista predeterminada</label>
                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                          <option value="/solicitudes">Recepción</option>
                          <option value="/representante">Representante</option>
                          <option value="/despacho-superior">Despacho Superior</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    console.log('Guardando configuración');
                    setConfigModalOpen(false);
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setConfigModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 