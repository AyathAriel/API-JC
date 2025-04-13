import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaUserFriends, 
  FaEye, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaHourglassHalf,
  FaHome,
  FaSearch,
  FaFilter,
  FaClipboardList
} from 'react-icons/fa'

interface Ciudadano {
  id: number
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  direccion: string
}

interface Solicitud {
  id: number
  titulo: string
  descripcion: string
  fecha_creacion: string
  fecha_aprobacion?: string
  estado: string
  estado_display?: string
  materiales?: { nombre: string, cantidad: number }[]
  ciudadano: Ciudadano
}

const TrabajoSocial = () => {
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('pendientes')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [dateFilter, setDateFilter] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)
  
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)

  // Definir pestañas para la navegación horizontal
  const tabs = [
    { id: 'todos', label: 'Todas las solicitudes', icon: <FaClipboardList /> },
    { id: 'pendientes', label: 'Pendientes de visita', icon: <FaHourglassHalf /> },
    { id: 'verificados', label: 'Verificados', icon: <FaCheckCircle /> },
    { id: 'entrega', label: 'En entrega', icon: <FaHome /> },
    { id: 'completados', label: 'Completados', icon: <FaCheckCircle /> },
  ];

  useEffect(() => {
    // En una aplicación real, esta función obtendría los datos de un endpoint API
    const fetchSolicitudes = async () => {
      try {
        // Simular carga de datos con un mock
        setTimeout(() => {
          const mockData: Solicitud[] = [
            {
              id: 1,
              titulo: 'Solicitud de materiales para vivienda',
              descripcion: 'Necesito materiales para reparar mi techo después de las lluvias.',
              fecha_creacion: '2023-04-15T09:00:00Z',
              fecha_aprobacion: '2023-04-16T15:30:00Z',
              estado: 'pendiente_ts',
              estado_display: 'Pendiente de Visita',
              materiales: [
                { nombre: 'Láminas de zinc', cantidad: 10 },
                { nombre: 'Cemento (bolsa)', cantidad: 5 },
                { nombre: 'Arena (m³)', cantidad: 2 }
              ],
              ciudadano: {
                id: 101,
                nombre: 'Juan',
                apellido: 'Pérez',
                cedula: '8-123-456',
                telefono: '6123-4567',
                direccion: 'Barrio San Miguel, Casa #123, El Porvenir'
              }
            },
            {
              id: 2,
              titulo: 'Solicitud de ayuda para medicamentos',
              descripcion: 'Requiero apoyo para la compra de medicamentos de alta especialidad.',
              fecha_creacion: '2023-04-10T15:30:00Z',
              fecha_aprobacion: '2023-04-12T09:45:00Z',
              estado: 'verificado_ts',
              estado_display: 'Verificado',
              ciudadano: {
                id: 102,
                nombre: 'María',
                apellido: 'González',
                cedula: '9-876-543',
                telefono: '6987-6543',
                direccion: 'Calle Principal, San Antonio'
              }
            },
            {
              id: 3,
              titulo: 'Materiales para escuela comunitaria',
              descripcion: 'Solicito permiso para realizar una feria artesanal en la plaza del barrio.',
              fecha_creacion: '2023-04-05T11:45:00Z',
              fecha_aprobacion: '2023-04-06T14:20:00Z',
              estado: 'en_entrega',
              estado_display: 'En Entrega',
              materiales: [
                { nombre: 'Bloques', cantidad: 100 },
                { nombre: 'Cemento (bolsa)', cantidad: 20 },
                { nombre: 'Varillas (unidad)', cantidad: 30 }
              ],
              ciudadano: {
                id: 103,
                nombre: 'Pedro',
                apellido: 'Rodríguez',
                cedula: '7-789-123',
                telefono: '6789-1234',
                direccion: 'Escuela Primaria, La Esperanza'
              }
            },
            {
              id: 4,
              titulo: 'Reparación de calle vecinal',
              descripcion: 'Necesitamos materiales para reparar la calle principal del barrio.',
              fecha_creacion: '2023-03-15T11:20:00Z',
              fecha_aprobacion: '2023-03-17T10:15:00Z',
              estado: 'completado',
              estado_display: 'Completado',
              ciudadano: {
                id: 104,
                nombre: 'Ana',
                apellido: 'Martínez',
                cedula: '5-432-765',
                telefono: '6234-5678',
                direccion: 'Urbanización Las Flores, Casa 45'
              }
            }
          ]
          
          setSolicitudes(mockData)
          setLoading(false)
        }, 800)
      } catch (error) {
        console.error('Error fetching solicitudes:', error)
        setLoading(false)
      }
    }

    fetchSolicitudes()
  }, [])

  useEffect(() => {
    // Aplicar filtros a las solicitudes
    const filtered = solicitudes.filter(solicitud => {
      // Filtro por pestaña seleccionada
      const tabMatch = 
        (activeTab === 'pendientes' && solicitud.estado === 'pendiente_ts') ||
        (activeTab === 'verificados' && solicitud.estado === 'verificado_ts') ||
        (activeTab === 'entrega' && solicitud.estado === 'en_entrega') ||
        (activeTab === 'completados' && solicitud.estado === 'completado') ||
        (activeTab === 'todos')
      
      // Filtro de búsqueda
      const searchString = searchTerm.toLowerCase()
      const fullName = `${solicitud.ciudadano.nombre} ${solicitud.ciudadano.apellido}`.toLowerCase()
      const cedula = solicitud.ciudadano.cedula.toLowerCase()
      const searchMatch = 
        fullName.includes(searchString) ||
        cedula.includes(searchString) ||
        solicitud.titulo.toLowerCase().includes(searchString) ||
        solicitud.id.toString().includes(searchString)
      
      // Filtro por estado adicional
      const statusMatch = 
        statusFilter === 'todos' || 
        solicitud.estado === statusFilter
      
      // Filtro por fecha
      let dateMatch = true
      if (dateFilter !== 'todos') {
        const today = new Date()
        const solicitudDate = new Date(solicitud.fecha_creacion)
        
        if (dateFilter === 'hoy') {
          dateMatch = 
            solicitudDate.getDate() === today.getDate() &&
            solicitudDate.getMonth() === today.getMonth() &&
            solicitudDate.getFullYear() === today.getFullYear()
        } else if (dateFilter === 'semana') {
          const weekAgo = new Date()
          weekAgo.setDate(today.getDate() - 7)
          dateMatch = solicitudDate >= weekAgo
        } else if (dateFilter === 'mes') {
          const monthAgo = new Date()
          monthAgo.setMonth(today.getMonth() - 1)
          dateMatch = solicitudDate >= monthAgo
        }
      }
      
      return tabMatch && searchMatch && statusMatch && dateMatch
    })
    
    setFilteredSolicitudes(filtered)
  }, [solicitudes, activeTab, searchTerm, statusFilter, dateFilter])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  const getStatusBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente_ts':
        return 'bg-yellow-100 text-yellow-800'
      case 'verificado_ts':
        return 'bg-green-100 text-green-800'
      case 'en_entrega':
        return 'bg-green-100 text-green-800'
      case 'completado':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Función para mostrar iconos según el estado
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente_ts':
        return <FaHourglassHalf className="text-yellow-500" />
      case 'verificado_ts':
        return <FaCheckCircle className="text-green-500" />
      case 'en_entrega':
        return <FaHome className="text-green-500" />
      case 'completado':
        return <FaCheckCircle className="text-green-500" />
      default:
        return null
    }
  }

  // Función para manejar la visualización de detalles
  const handleViewDetails = (id: number) => {
    navigate(`/solicitud/${id}`)
  }

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('todos')
    setDateFilter('todos')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-green-600 text-4xl mb-2" />
          <span className="text-gray-600">Cargando solicitudes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <FaUserFriends className="inline-block mr-2 text-green-600" />
          Panel de Trabajo Social
        </h1>
        
        <div className="flex space-x-2">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors duration-300"
            onClick={() => {/* Programar visita */}}
          >
            <span className="mr-2">+</span> Programar visita
          </button>
        </div>
      </div>
      
      {/* Buscador y Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Buscar por nombre, cédula o título..."
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <select
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            >
              <option value="todos">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabla de solicitudes con pestañas horizontales */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Navegación por pestañas - Horizontal */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
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

        {/* Contenido de las pestañas */}
        <div className="p-4">
          {filteredSolicitudes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <FaTimesCircle className="text-gray-400 text-5xl mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700 mb-2">No se encontraron solicitudes</h2>
              <p className="text-gray-600 mb-6">
                No hay solicitudes que coincidan con los criterios seleccionados.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolicitudes.map((solicitud) => (
                <div 
                  key={solicitud.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4" 
                  style={{ borderTopColor: solicitud.estado === 'pendiente_ts' ? '#faca15' : 
                            solicitud.estado === 'verificado_ts' ? '#10b981' : 
                            solicitud.estado === 'en_entrega' ? '#10b981' : 
                            solicitud.estado === 'completado' ? '#10b981' : '#d1d5db' }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(solicitud.estado)}`}>
                          {getStatusIcon(solicitud.estado)}
                          <span className="ml-1">{solicitud.estado_display || solicitud.estado}</span>
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 mt-2">{solicitud.titulo}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">#{solicitud.id}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-500 mr-2">
                        <span className="text-xs font-bold">
                          {solicitud.ciudadano.nombre.charAt(0)}{solicitud.ciudadano.apellido.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{solicitud.ciudadano.cedula}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 my-2 line-clamp-2">
                      {solicitud.descripcion}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="mb-1">
                        <span className="font-medium">Fecha de creación:</span> {formatDate(solicitud.fecha_creacion)}
                      </div>
                      {solicitud.fecha_aprobacion && (
                        <div>
                          <span className="font-medium">Fecha de aprobación:</span> {formatDate(solicitud.fecha_aprobacion)}
                        </div>
                      )}
                    </div>
                    
                    {solicitud.materiales && solicitud.materiales.length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Materiales:</h4>
                        <ul className="text-xs text-gray-600">
                          {solicitud.materiales.slice(0, 2).map((material, index) => (
                            <li key={index} className="truncate">
                              {material.nombre}: {material.cantidad} unidades
                            </li>
                          ))}
                          {solicitud.materiales.length > 2 && (
                            <li className="text-green-600">+{solicitud.materiales.length - 2} más</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center"
                        onClick={() => navigate(`/solicitud/${solicitud.id}`)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrabajoSocial 