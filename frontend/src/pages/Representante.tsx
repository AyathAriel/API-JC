import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { Solicitud } from '../types/solicitud'
import SolicitudesService from '../services/SolicitudesService'
import { FaClipboardList, FaHourglassHalf, FaFileInvoice, FaShoppingCart, FaFileContract } from 'react-icons/fa'

const Representante: React.FC = () => {
  const { addToast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('todos')
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  
  // Nuevo estado para las pestañas
  const [activeTab, setActiveTab] = useState('todas')

  // Definir pestañas para la navegación horizontal
  const tabs = [
    { id: 'todas', label: 'Todas las solicitudes', icon: <FaClipboardList /> },
    { id: 'pendientes', label: 'Pendientes', icon: <FaHourglassHalf /> },
    { id: 'requisiones', label: 'Requisiones', icon: <FaFileInvoice /> },
    { id: 'orden_compras', label: 'Orden de Compras', icon: <FaShoppingCart /> },
    { id: 'cotazaciones', label: 'Cotizaciones', icon: <FaFileContract /> },
  ];

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  // Función para manejar acción de revisar
  const handleReview = (id: number) => {
    // Implementar lógica para revisar la solicitud
    addToast(`Solicitud #${id} revisada`, 'info')
  }

  // Función para manejar acción de pausa
  const handlePause = (id: number) => {
    // Implementar lógica para pausar la solicitud
    addToast(`Solicitud #${id} puesta en espera para revisión posterior`, 'info')
  }

  // Función para aprobar requisición
  const handleAprobarRequisicion = (id: number) => {
    try {
      const resultado = SolicitudesService.aprobarSolicitud(id)
      if (resultado) {
        // Actualizar la lista de solicitudes después de aprobar
        const updatedSolicitudes = solicitudes.map(sol => 
          sol.id === id ? {...sol, 
            aprobada: true,
            estado: 'requisicion_aprobada',
            estado_display: 'Requisición Aprobada'
          } : sol
        )
        setSolicitudes(updatedSolicitudes)
        addToast(`Requisición #${id} aprobada correctamente`, 'success')
      } else {
        addToast('Error al aprobar la requisición', 'error')
      }
    } catch (error) {
      console.error('Error al aprobar requisición:', error)
      addToast('Error al aprobar la requisición', 'error')
    }
  }

  // Función para aprobar orden de compra
  const handleAprobarOrdenCompra = (id: number) => {
    try {
      const resultado = SolicitudesService.aprobarSolicitud(id)
      if (resultado) {
        // Actualizar la lista de solicitudes después de aprobar
        const updatedSolicitudes = solicitudes.map(sol => 
          sol.id === id ? {...sol, 
            aprobada: true,
            estado: 'orden_compra_aprobada',
            estado_display: 'Orden de Compra Aprobada'
          } : sol
        )
        setSolicitudes(updatedSolicitudes)
        addToast(`Orden de compra #${id} aprobada correctamente`, 'success')
      } else {
        addToast('Error al aprobar la orden de compra', 'error')
      }
    } catch (error) {
      console.error('Error al aprobar orden de compra:', error)
      addToast('Error al aprobar la orden de compra', 'error')
    }
  }

  // Función para aprobar cotización
  const handleAprobarCotizacion = (id: number) => {
    try {
      const resultado = SolicitudesService.aprobarSolicitud(id)
      if (resultado) {
        // Actualizar la lista de solicitudes después de aprobar
        const updatedSolicitudes = solicitudes.map(sol => 
          sol.id === id ? {...sol, 
            aprobada: true,
            estado: 'cotizacion_aprobada',
            estado_display: 'Cotización Aprobada'
          } : sol
        )
        setSolicitudes(updatedSolicitudes)
        addToast(`Cotización #${id} aprobada correctamente`, 'success')
      } else {
        addToast('Error al aprobar la cotización', 'error')
      }
    } catch (error) {
      console.error('Error al aprobar cotización:', error)
      addToast('Error al aprobar la cotización', 'error')
    }
  }

  // Función para aprobar solicitud directamente
  const handleApprove = (id: number) => {
    try {
      const resultado = SolicitudesService.aprobarSolicitud(id)
      if (resultado) {
        // Actualizar la lista de solicitudes después de aprobar
        const updatedSolicitudes = solicitudes.map(sol => 
          sol.id === id ? {...sol, 
            aprobada: true,
            estado: 'aprobado_representante',
            estado_display: 'Aprobado por Representante'
          } : sol
        )
        setSolicitudes(updatedSolicitudes)
        addToast(`Solicitud #${id} aprobada correctamente`, 'success')
      } else {
        addToast('Error al aprobar la solicitud', 'error')
      }
    } catch (error) {
      console.error('Error al aprobar solicitud:', error)
      addToast('Error al aprobar la solicitud', 'error')
    }
  }

  useEffect(() => {
    // Cargar solicitudes desde el servicio
    const loadSolicitudes = () => {
      setLoading(true)
      try {
        const data = SolicitudesService.getSolicitudes()
        setSolicitudes(data)
        setFilteredSolicitudes(data)
      } catch (error) {
        console.error('Error al cargar solicitudes:', error)
        addToast('Error al cargar las solicitudes', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadSolicitudes()
  }, [addToast])

  useEffect(() => {
    // Filtrar solicitudes basado en el término de búsqueda y la pestaña activa
    filterSolicitudesByTab()
  }, [searchTerm, solicitudes, activeTab, dateFilter])

  // Función para filtrar solicitudes según la pestaña activa y otros criterios
  const filterSolicitudesByTab = () => {
    let filtered = [...solicitudes];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(solicitud => {
        const fullName = `${solicitud.ciudadano.nombre} ${solicitud.ciudadano.apellido}`.toLowerCase()
        const cedula = solicitud.ciudadano.cedula.toLowerCase()
        const titulo = solicitud.titulo.toLowerCase()
        const term = searchTerm.toLowerCase()
        
        return fullName.includes(term) || 
               cedula.includes(term) || 
               titulo.includes(term)
      })
    }
    
    // Filtrar según la pestaña seleccionada
    if (activeTab !== 'todas') {
      if (activeTab === 'pendientes') {
        filtered = filtered.filter(sol => sol.estado === 'pendiente' || !sol.aprobada);
      } else if (activeTab === 'requisiones') {
        filtered = filtered.filter(sol => sol.estado === 'requisicion' || sol.tipo === 'requisicion');
      } else if (activeTab === 'orden_compras') {
        filtered = filtered.filter(sol => sol.estado === 'orden_compra' || sol.tipo === 'orden_compra');
      } else if (activeTab === 'cotazaciones') {
        filtered = filtered.filter(sol => sol.estado === 'cotizacion' || sol.tipo === 'cotizacion');
      }
    }
    
    // Filtrar por fecha si se selecciona un filtro de fecha
    if (dateFilter !== 'todos') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'hoy') {
        filtered = filtered.filter(sol => {
          const solDate = new Date(sol.fecha_creacion);
          return solDate.toDateString() === today.toDateString();
        });
      } else if (dateFilter === 'semana') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        filtered = filtered.filter(sol => {
          const solDate = new Date(sol.fecha_creacion);
          return solDate >= lastWeek;
        });
      } else if (dateFilter === 'mes') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        filtered = filtered.filter(sol => {
          const solDate = new Date(sol.fecha_creacion);
          return solDate >= lastMonth;
        });
      }
    }
    
    setFilteredSolicitudes(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Representante</h1>
      </div>
      
      {/* Buscador y Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, cédula o título..."
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            />
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
              onClick={() => {
                setSearchTerm('')
                setActiveTab('todas')
                setDateFilter('todos')
              }}
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

        {/* Contenido de las pestañas */}
        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-green-600">Cargando solicitudes...</p>
            </div>
          ) : filteredSolicitudes.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-gray-600">No hay solicitudes disponibles con los criterios seleccionados.</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setActiveTab('todas')
                  setDateFilter('todos')
                }}
                className="mt-4 text-green-600 hover:text-green-800"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudadano/Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref./Cédula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo/Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSolicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(solicitud.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{solicitud.ciudadano.cedula}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{solicitud.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {solicitud.tipo && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {solicitud.tipo === 'requisicion' ? 'Requisición' : 
                            solicitud.tipo === 'orden_compra' ? 'Orden de Compra' : 
                            solicitud.tipo === 'cotizacion' ? 'Cotización' : 'Solicitud'}
                          </span>
                        )}
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          solicitud.estado.includes('aprobado') 
                            ? 'bg-green-100 text-green-800' 
                            : solicitud.estado.includes('rechazado')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {solicitud.estado_display}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center gap-2">
                        {solicitud.tipo === 'requisicion' && (
                          <button
                            onClick={() => handleAprobarRequisicion(solicitud.id)}
                            disabled={solicitud.estado.includes('aprobado')}
                            className={`px-3 py-1 rounded-md text-sm ${
                              solicitud.estado.includes('aprobado') 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            Aprobar Requisición
                          </button>
                        )}
                        
                        {solicitud.tipo === 'orden_compra' && (
                          <button
                            onClick={() => handleAprobarOrdenCompra(solicitud.id)}
                            disabled={solicitud.estado.includes('aprobado')}
                            className={`px-3 py-1 rounded-md text-sm ${
                              solicitud.estado.includes('aprobado') 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            Aprobar Orden
                          </button>
                        )}
                        
                        {solicitud.tipo === 'cotizacion' && (
                          <button
                            onClick={() => handleAprobarCotizacion(solicitud.id)}
                            disabled={solicitud.estado.includes('aprobado')}
                            className={`px-3 py-1 rounded-md text-sm ${
                              solicitud.estado.includes('aprobado') 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            Aprobar Cotización
                          </button>
                        )}
                        
                        {(!solicitud.tipo || solicitud.tipo === 'solicitud') && (
                          <button
                            onClick={() => handleApprove(solicitud.id)}
                            disabled={solicitud.estado.includes('aprobado')}
                            className={`px-3 py-1 rounded-md text-sm ${
                              solicitud.estado.includes('aprobado') 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            Aprobar
                          </button>
                        )}
                        
                        <Link 
                          to={`/representante/${solicitud.id}`} 
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Representante 