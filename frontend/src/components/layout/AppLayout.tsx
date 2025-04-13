import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  FaHome,
  FaClipboardList,
  FaUserTie,
  FaBuilding,
  FaWarehouse,
  FaUserFriends,
  FaBell,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaRobot,
  FaCog,
  FaCheckCircle
} from 'react-icons/fa'

import { useConfig } from '../../context/ConfigContext'
import ConfigModal from './ConfigModal'

interface SidebarItem {
  title: string
  path: string
  icon: JSX.Element
}

const AppLayout = () => {
  const config = useConfig()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const location = useLocation()

  // Cierra el sidebar en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const sidebarItems: SidebarItem[] = [
    { title: 'Inicio', path: '/', icon: <FaHome /> },
    { title: 'Recepción', path: '/solicitudes', icon: <FaClipboardList /> },
    { title: 'Representante', path: '/representante', icon: <FaUserTie /> },
    { title: 'Despacho Superior', path: '/despacho-superior', icon: <FaBuilding /> },
    { title: 'Trabajo Social', path: '/trabajo-social', icon: <FaUserFriends /> },
    { title: 'Almacén', path: '/almacen', icon: <FaWarehouse /> }
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-blue-800 text-white transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{config.appName}</h1>
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-4">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm transition-colors duration-150 hover:bg-blue-700 ${
                    location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path))
                      ? 'bg-blue-700 border-l-4 border-white'
                      : ''
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.title}
                </Link>
              </li>
            ))}
            
            {/* Botón de Agente IA */}
            <li className="mb-1">
              <button
                onClick={() => setShowAIModal(true)}
                className="w-full flex items-center px-4 py-3 text-sm transition-colors duration-150 hover:bg-blue-700"
              >
                <span className="mr-3 text-xl"><FaRobot /></span>
                Agente IA
              </button>
            </li>
            
            {/* Botón de Configuración */}
            <li className="mb-1">
              <button
                onClick={() => setShowConfigModal(true)}
                className="w-full flex items-center px-4 py-3 text-sm transition-colors duration-150 hover:bg-blue-700"
              >
                <span className="mr-3 text-xl"><FaCog /></span>
                Configuración
              </button>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
          <button
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-white transition-colors duration-150 rounded-md hover:bg-blue-700"
          >
            <FaSignOutAlt className="mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <button
              className="mr-4 text-gray-600 focus:outline-none md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars size={20} />
            </button>
            <h2 className="text-lg font-medium text-gray-700">
              {sidebarItems.find(
                (item) =>
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
              )?.title || 'Panel Principal'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-600"
              title="Notificaciones"
            >
              <FaBell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Modales para AI y Configuración */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaRobot className="mr-2 text-purple-600" /> Asistente de Inteligencia Artificial
              </h3>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">¿En qué puedo ayudarte hoy? Puedo asistirte con:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center text-gray-600">
                  <FaCheckCircle className="text-green-500 mr-2" /> Resumen de solicitudes
                </li>
                <li className="flex items-center text-gray-600">
                  <FaCheckCircle className="text-green-500 mr-2" /> Análisis de datos
                </li>
                <li className="flex items-center text-gray-600">
                  <FaCheckCircle className="text-green-500 mr-2" /> Recomendaciones de acción
                </li>
                <li className="flex items-center text-gray-600">
                  <FaCheckCircle className="text-green-500 mr-2" /> Verificación de ciudadanos
                </li>
              </ul>
            </div>
            <div className="mb-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Escribe tu consulta aquí..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Enviar consulta
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Configuración */}
      <ConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </div>
  )
}

export default AppLayout 