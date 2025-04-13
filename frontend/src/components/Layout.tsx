import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  FaBell,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { MdDashboard, MdDescription, MdPerson, MdGroups, MdMilitaryTech, MdLocalShipping, MdSettings, MdQrCode2 } from 'react-icons/md';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../services/supabase';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, userRoles } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // El hook se encarga de la redirección
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Obtener el rol principal para mostrar en la UI (el primero si hay varios)
  const displayRole = userRoles.length > 0 
    ? userRoles.includes(UserRole.ADMIN) 
      ? 'Administrador' 
      : userRoles.includes(UserRole.TRABAJADOR_SOCIAL) 
        ? 'Trabajador Social'
        : userRoles.includes(UserRole.REPRESENTANTE)
          ? 'Representante'
          : userRoles.includes(UserRole.DESPACHO)
            ? 'Despacho Superior'
            : 'Usuario'
    : 'Usuario';

  const sidebarItems = [
    { name: 'Recepción', path: '/solicitudes', icon: <MdDescription /> },
    { name: 'Representante', path: '/representante', icon: <MdPerson />, roles: [UserRole.ADMIN, UserRole.REPRESENTANTE] },
    { name: 'Trabajo Social', path: '/trabajo-social', icon: <MdGroups />, roles: [UserRole.ADMIN, UserRole.TRABAJADOR_SOCIAL] },
    { name: 'Despacho Superior', path: '/despacho-superior', icon: <MdMilitaryTech />, roles: [UserRole.ADMIN, UserRole.DESPACHO] },
    { name: 'Configuración', path: '/configuracion', icon: <MdSettings />, roles: [UserRole.ADMIN] },
  ];

  // Filtrar los elementos del sidebar según los roles del usuario
  const filteredSidebarItems = sidebarItems.filter(item => {
    if (!item.roles) return true; // Sin restricción de roles
    return userRoles.some(role => item.roles?.includes(role)) || userRoles.includes(UserRole.ADMIN);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className={`bg-green-600 text-white w-64 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-yellow-500">
          <div className="flex items-center">
            <span className="font-bold text-xl">Juntas Comunales</span>
          </div>
          <button 
            className="lg:hidden text-black focus:outline-none" 
            onClick={toggleSidebar}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="py-4 overflow-y-auto flex flex-col h-[calc(100%-4rem)]">
          <nav className="px-2 space-y-1 flex-grow">
            {filteredSidebarItems.slice(0, -1).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                  (item.path === '/solicitudes' && (location.pathname === '/solicitudes' || location.pathname === '/')) ||
                  (item.path !== '/solicitudes' && location.pathname.includes(item.path))
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-500 hover:text-white'
                }`}
              >
                <span className="mr-3 h-5 w-5">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
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
            
            {(userRoles.includes(UserRole.ADMIN)) && (
              <Link
                to={filteredSidebarItems[filteredSidebarItems.length - 1].path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                  location.pathname.includes(filteredSidebarItems[filteredSidebarItems.length - 1].path)
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-500 hover:text-white'
                }`}
              >
                <span className="mr-3 h-5 w-5">{filteredSidebarItems[filteredSidebarItems.length - 1].icon}</span>
                {filteredSidebarItems[filteredSidebarItems.length - 1].name}
              </Link>
            )}
            
            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all text-green-100 hover:bg-green-500 hover:text-white"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </nav>
          
          {/* Perfil de usuario */}
          {user && (
            <div className="mt-auto border-t border-green-500 p-4">
              <div className="flex items-center">
                <div className="bg-green-700 rounded-full p-2 mr-3">
                  <FaUser className="text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-green-200 capitalize">Rol: {displayRole}</p>
                </div>
              </div>
            </div>
          )}
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