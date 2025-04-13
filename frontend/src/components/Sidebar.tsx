import { useAuthStore } from '../auth/store'
import { Link, useLocation } from 'react-router-dom'
import { FaRobot, FaCog } from 'react-icons/fa'

const Sidebar = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  
  // Define los elementos de menú según el rol
  const menuItems = [
    { 
      name: 'Solicitudes', 
      path: '/solicitudes', 
      roles: ['recepcion', 'representante', 'trabajo_social', 'almacen', 'ciudadano']
    },
    { 
      name: 'Representante', 
      path: '/representante', 
      roles: ['representante']
    },
    { 
      name: 'Trabajo Social', 
      path: '/trabajo-social', 
      roles: ['trabajo_social']
    },
    { 
      name: 'Almacén', 
      path: '/almacen', 
      roles: ['almacen']
    }
  ]

  // Elementos de menú del sistema (accesibles para todos)
  const systemItems = [
    {
      name: 'Agente IA',
      path: '/agente-ia',
      icon: <FaRobot className="mr-2" />
    },
    {
      name: 'Configuración',
      path: '/configuracion',
      icon: <FaCog className="mr-2" />
    }
  ]

  // Filtra los elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.rol)
  )

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Panel de Control</h2>
        
        <nav>
          <ul>
            {filteredMenuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`block p-2 rounded hover:bg-gray-700 ${
                    location.pathname.startsWith(item.path) ? 'bg-gray-700' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Sección de Sistema */}
          <div className="mt-8 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              SISTEMA
            </h3>
          </div>
          
          <ul>
            {systemItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                    location.pathname.startsWith(item.path) ? 'bg-gray-700' : ''
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar 