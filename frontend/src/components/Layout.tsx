import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaClipboardList, 
  FaUserTie, 
  FaUsers, 
  FaBriefcase,
  FaCog,
  FaRobot,
  FaBars,
  FaTimes,
  FaBell
} from 'react-icons/fa';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className={`bg-green-600 text-white w-64 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-green-500">
          <div className="flex items-center">
            <span className="font-bold text-xl">Juntas Comunales</span>
          </div>
          <button 
            className="lg:hidden text-white focus:outline-none" 
            onClick={toggleSidebar}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <Link
              to="/solicitudes"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname === '/solicitudes' || location.pathname === '/'
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <FaClipboardList className="mr-3 h-5 w-5" />
              Recepción
            </Link>
            
            <Link
              to="/representante"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname.includes('/representante')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <FaUserTie className="mr-3 h-5 w-5" />
              Representante
            </Link>
            
            <Link
              to="/trabajo-social"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname.includes('/trabajo-social')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <FaUsers className="mr-3 h-5 w-5" />
              Trabajo Social
            </Link>
            
            <Link
              to="/despacho-superior"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname.includes('/despacho-superior')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <FaBriefcase className="mr-3 h-5 w-5" />
              Despacho Superior
            </Link>
            
            <div className="pt-4 mt-4 border-t border-green-500">
              <h3 className="px-4 text-xs font-semibold text-green-200 uppercase tracking-wider">
                Sistema
              </h3>
            </div>
            
            <Link
              to="/agente-ia"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname.includes('/agente-ia')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <FaRobot className="mr-3 h-5 w-5" />
              Agente IA
            </Link>
            
            <Link
              to="/configuracion"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                location.pathname.includes('/configuracion')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-500 hover:text-white'
              }`}
            >
              <FaCog className="mr-3 h-5 w-5" />
              Configuración
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0 lg:ml-64'
      }`}>
        {/* Top Navigation Bar */}
        <div className="bg-white h-16 shadow-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              className="text-gray-600 focus:outline-none lg:hidden mr-3" 
              onClick={toggleSidebar}
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-700">
              {location.pathname.includes('/solicitudes') || location.pathname === '/' ? 'Recepción de Solicitudes' : 
               location.pathname.includes('/representante') ? 'Panel del Representante' :
               location.pathname.includes('/trabajo-social') ? 'Trabajo Social' :
               location.pathname.includes('/despacho-superior') ? 'Despacho Superior/Secretaría' :
               location.pathname.includes('/agente-ia') ? 'Asistente IA' :
               location.pathname.includes('/configuracion') ? 'Configuración' : 'Juntas Comunales'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none"
              >
                <FaBell />
                <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <div className="py-2 px-4 bg-green-600 text-white text-sm font-semibold">
                    Notificaciones (3)
                  </div>
                  <div className="divide-y divide-gray-200">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-700">Nueva solicitud recibida</p>
                      <p className="text-xs text-gray-500">Hace 5 minutos</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-700">Solicitud aprobada</p>
                      <p className="text-xs text-gray-500">Hace 30 minutos</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-700">Recordatorio: Reunión mensual</p>
                      <p className="text-xs text-gray-500">Hoy, 15:00</p>
                    </div>
                  </div>
                  <div className="py-2 px-4 bg-gray-50 text-xs font-medium text-green-600 hover:text-green-800 cursor-pointer">
                    Ver todas las notificaciones
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white cursor-pointer">
              <span className="text-sm font-semibold">JC</span>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white p-4 border-t text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Juntas Comunales - Todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 