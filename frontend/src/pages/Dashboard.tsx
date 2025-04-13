import React, { useState, useEffect, useCallback } from 'react'
import { 
  FaChartLine, 
  FaUsers, 
  FaClipboardCheck, 
  FaCalendarAlt, 
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSpinner,
  FaChartPie,
  FaChartBar,
  FaClipboardList,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaSearch,
  FaExclamationTriangle,
  FaList,
  FaEye,
  FaUser,
  FaFilePdf,
  FaRegClock,
  FaRegCalendarAlt,
  FaFileExport,
  FaFileExcel,
  FaDownload,
  FaCog,
  FaRobot,
  FaHome,
  FaTools,
  FaClock
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
// Temporalmente comentadas las importaciones de Chart.js
// import { Bar, Doughnut, Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartData,
//   ChartOptions
// } from 'chart.js'

// // Registrar componentes de Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// )

interface StatsData {
  totalSolicitudes: number
  pendientes: number
  aprobadas: number
  rechazadas: number
  enProceso: number
  completadas: number
  solicitudesHoy: number
  ciudadanosRegistrados: number
  solicitudesPorCategoria: {
    categoria: string
    cantidad: number
  }[]
  solicitudesPorEstado: {
    estado: string
    cantidad: number
  }[]
  solicitudesRecientes: Solicitud[]
  actividadesRecientes: Actividad[]
}

interface Solicitud {
  id: number
  titulo: string
  fecha: string
  estado: string
  prioridad: string
  ciudadano: {
    nombre: string
    apellido: string
    cedula: string
  }
  categoria: string
}

interface Actividad {
  id: number
  tipo: string
  descripcion: string
  usuario: string
  fecha: string
  solicitudId?: number
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

type TimeRange = 'last7days' | 'last30days' | 'last90days' | 'lastYear' | 'custom';

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [periodo, setPeriodo] = useState('7dias')
  const [exportLoading, setExportLoading] = useState(false)
  const [requestChartData, setRequestChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [categoryChartData, setCategoryChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRange>('last7days')
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Generar datos de ejemplo para el dashboard
  const generarDatosEjemplo = (): StatsData => {
    // Categorías de solicitudes
    const categorias = [
      'Materiales de construcción',
      'Ayuda social',
      'Educación',
      'Salud',
      'Deportes',
      'Infraestructura',
      'Otros'
    ]
    
    // Estados de solicitudes
    const estados = [
      { id: 'pendiente', nombre: 'Pendiente' },
      { id: 'aprobado', nombre: 'Aprobado' },
      { id: 'rechazado', nombre: 'Rechazado' },
      { id: 'en_proceso', nombre: 'En proceso' },
      { id: 'completado', nombre: 'Completado' }
    ]
    
    // Generar distribución por categoría
    const solicitudesPorCategoria = categorias.map(categoria => {
      return {
        categoria,
        cantidad: Math.floor(Math.random() * 30) + 5
      }
    })
    
    // Calcular total
    const totalSolicitudes = solicitudesPorCategoria.reduce((acc, curr) => acc + curr.cantidad, 0)
    
    // Generar distribución por estado
    const pendientes = Math.floor(totalSolicitudes * 0.25)
    const aprobadas = Math.floor(totalSolicitudes * 0.3)
    const rechazadas = Math.floor(totalSolicitudes * 0.15)
    const enProceso = Math.floor(totalSolicitudes * 0.2)
    const completadas = totalSolicitudes - pendientes - aprobadas - rechazadas - enProceso
    
    const solicitudesPorEstado = [
      { estado: 'Pendiente', cantidad: pendientes },
      { estado: 'Aprobado', cantidad: aprobadas },
      { estado: 'Rechazado', cantidad: rechazadas },
      { estado: 'En proceso', cantidad: enProceso },
      { estado: 'Completado', cantidad: completadas }
    ]
    
    // Generar solicitudes recientes
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Luisa', 'Miguel', 'Sofía']
    const apellidos = ['González', 'Rodríguez', 'Pérez', 'Martínez', 'Sánchez', 'Díaz', 'López', 'Ramírez']
    const prioridades = ['alta', 'media', 'baja']
    
    const solicitudesRecientes: Solicitud[] = []
    for (let i = 1; i <= 5; i++) {
      const fechaRandom = new Date()
      fechaRandom.setDate(fechaRandom.getDate() - Math.floor(Math.random() * 7))
      
      solicitudesRecientes.push({
        id: totalSolicitudes - i + 1,
        titulo: `Solicitud de ${categorias[Math.floor(Math.random() * categorias.length)].toLowerCase()}`,
        fecha: fechaRandom.toISOString(),
        estado: estados[Math.floor(Math.random() * estados.length)].id,
        prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
        ciudadano: {
          nombre: nombres[Math.floor(Math.random() * nombres.length)],
          apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
          cedula: `${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 10000)}`
        },
        categoria: categorias[Math.floor(Math.random() * categorias.length)]
      })
    }
    
    // Generar actividades recientes
    const tiposActividad = [
      'solicitud_creada',
      'solicitud_aprobada',
      'solicitud_rechazada',
      'solicitud_completada',
      'ciudadano_verificado',
      'material_entregado'
    ]
    
    const usuarios = [
      'Admin',
      'Recepción',
      'Representante',
      'Trabajo Social',
      'Almacén'
    ]
    
    const actividadesRecientes: Actividad[] = []
    for (let i = 1; i <= 8; i++) {
      const fechaRandom = new Date()
      fechaRandom.setHours(fechaRandom.getHours() - Math.floor(Math.random() * 48))
      
      const tipoActividad = tiposActividad[Math.floor(Math.random() * tiposActividad.length)]
      const solicitudId = Math.floor(Math.random() * totalSolicitudes) + 1
      
      let descripcion = ''
      switch (tipoActividad) {
        case 'solicitud_creada':
          descripcion = `Nueva solicitud creada (#${solicitudId})`
          break
        case 'solicitud_aprobada':
          descripcion = `Solicitud #${solicitudId} aprobada`
          break
        case 'solicitud_rechazada':
          descripcion = `Solicitud #${solicitudId} rechazada`
          break
        case 'solicitud_completada':
          descripcion = `Solicitud #${solicitudId} completada`
          break
        case 'ciudadano_verificado':
          descripcion = `Ciudadano verificado para solicitud #${solicitudId}`
          break
        case 'material_entregado':
          descripcion = `Material entregado para solicitud #${solicitudId}`
          break
      }
      
      actividadesRecientes.push({
        id: i,
        tipo: tipoActividad,
        descripcion,
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        fecha: fechaRandom.toISOString(),
        solicitudId
      })
    }
    
    // Ordenar actividades por fecha
    actividadesRecientes.sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })
    
    return {
      totalSolicitudes,
      pendientes,
      aprobadas,
      rechazadas,
      enProceso,
      completadas,
      solicitudesHoy: Math.floor(Math.random() * 10) + 1,
      ciudadanosRegistrados: totalSolicitudes * 0.8, // Asumiendo que algunos ciudadanos tienen múltiples solicitudes
      solicitudesPorCategoria,
      solicitudesPorEstado,
      solicitudesRecientes,
      actividadesRecientes
    }
  }
  
  // Optimizar la función de carga de datos usando useCallback
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      // Simulación de carga de datos desde API
      setTimeout(() => {
        const datosGenerados = generarDatosEjemplo()
        setStats(datosGenerados)
        setLoading(false)
      }, 800)
      
      // En producción, se reemplazaría con:
      // const response = await fetch(`http://localhost:3000/api/dashboard/stats?periodo=${periodo}`)
      // const data = await response.json()
      // setStats(data)
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
      setLoading(false)
    }
  }, [periodo])
  
  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }
  
  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }
  
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    let interval = Math.floor(seconds / 31536000)
    if (interval > 1) return `hace ${interval} años`
    if (interval === 1) return `hace 1 año`
    
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return `hace ${interval} meses`
    if (interval === 1) return `hace 1 mes`
    
    interval = Math.floor(seconds / 86400)
    if (interval > 1) return `hace ${interval} días`
    if (interval === 1) return `hace 1 día`
    
    interval = Math.floor(seconds / 3600)
    if (interval > 1) return `hace ${interval} horas`
    if (interval === 1) return `hace 1 hora`
    
    interval = Math.floor(seconds / 60)
    if (interval > 1) return `hace ${interval} minutos`
    if (interval === 1) return `hace 1 minuto`
    
    return `hace ${Math.floor(seconds)} segundos`
  }
  
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <FaHourglassHalf className="text-yellow-500" />
      case 'aprobado':
        return <FaCheckCircle className="text-green-500" />
      case 'rechazado':
        return <FaTimesCircle className="text-red-500" />
      case 'en_proceso':
        return <FaSpinner className="text-blue-500" />
      case 'completado':
        return <FaCheckCircle className="text-purple-500" />
      default:
        return <FaFileAlt className="text-gray-500" />
    }
  }
  
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'aprobado':
        return 'bg-green-100 text-green-800'
      case 'rechazado':
        return 'bg-red-100 text-red-800'
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800'
      case 'completado':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-800'
      case 'media':
        return 'bg-yellow-100 text-yellow-800'
      case 'baja':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <FaArrowUp className="text-red-500" />
      case 'media':
        return <FaArrowUp className="text-yellow-500" />
      case 'baja':
        return <FaArrowDown className="text-blue-500" />
      default:
        return null
    }
  }
  
  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'solicitud_creada':
        return <FaFileAlt className="text-blue-500" />
      case 'solicitud_aprobada':
        return <FaCheckCircle className="text-green-500" />
      case 'solicitud_rechazada':
        return <FaTimesCircle className="text-red-500" />
      case 'solicitud_completada':
        return <FaClipboardCheck className="text-purple-500" />
      case 'ciudadano_verificado':
        return <FaUsers className="text-blue-500" />
      case 'material_entregado':
        return <FaClipboardList className="text-green-500" />
      default:
        return <FaFileAlt className="text-gray-500" />
    }
  }
  
  const handleViewSolicitud = (id: number) => {
    navigate(`/despacho-superior/solicitud/${id}`)
  }
  
  // Manejar la exportación de reportes
  const handleExportReport = (format: 'pdf' | 'excel') => {
    setExportLoading(true)
    // Simulación de exportación
    setTimeout(() => {
      setExportLoading(false)
      alert(`Reporte exportado en formato ${format.toUpperCase()}`)
    }, 1500)
  }
  
  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mb-2" />
          <span className="text-gray-600">Cargando datos...</span>
        </div>
      </div>
    )
  }
  
  // Datos para el gráfico de distribución por estado
  const estadoChartData = {
    labels: ['Pendientes', 'Aprobadas', 'Rechazadas', 'En Proceso'],
    datasets: [
      {
        data: [
          stats.pendientes, 
          stats.aprobadas, 
          stats.rechazadas, 
          stats.enProceso
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)'
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)'
        ],
        borderWidth: 1,
      },
    ],
  }

  // Datos para el gráfico de distribución por categoría
  const categoriaChartData = {
    labels: Object.keys(stats.solicitudesPorCategoria),
    datasets: [
      {
        label: 'Solicitudes por Categoría',
        data: Object.values(stats.solicitudesPorCategoria),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Datos para el gráfico de tendencias mensuales
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const mesActual = new Date().getMonth()
  const ultimos6Meses = meses.slice(Math.max(0, mesActual - 5), mesActual + 1)
  
  const tendenciasChartData = {
    labels: ultimos6Meses,
    datasets: [
      {
        label: 'Solicitudes Recibidas',
        data: [65, 78, 52, 91, 86, 105],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Solicitudes Aprobadas',
        data: [42, 53, 31, 65, 59, 78],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      }
    ],
  }

  // Opciones para el gráfico de barras
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tendencia de Solicitudes',
      },
    },
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido a tu panel de administración de solicitudes</p>
      </div>

      {/* Tarjetas con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total de Solicitudes</h3>
              <div className="text-2xl font-bold mt-2">{stats.totalSolicitudes}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.pendientes} pendientes
                <span className={`ml-2 ${stats.pendientes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.pendientes > 0 ? '+' : ''}
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaFileAlt className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Solicitudes Activas</h3>
              <div className="text-2xl font-bold mt-2">{stats.aprobadas}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.pendientes} pendientes
                <span className={`ml-2 ${stats.pendientes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.pendientes > 0 ? '+' : ''}
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUsers className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Materiales Entregados</h3>
              <div className="text-2xl font-bold mt-2">{stats.solicitudesRecientes.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.pendientes} pendientes
                <span className={`ml-2 ${stats.pendientes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.pendientes > 0 ? '+' : ''}
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaTools className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Mantenimientos</h3>
              <div className="text-2xl font-bold mt-2">{stats.actividadesRecientes.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.pendientes} pendientes
                <span className={`ml-2 ${stats.pendientes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.pendientes > 0 ? '+' : ''}
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaTools className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'resumen'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('propiedades')}
              className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'propiedades'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solicitudes
            </button>
            <button
              onClick={() => setActiveTab('mantenimiento')}
              className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'mantenimiento'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mantenimiento
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Ingresos Mensuales</h2>
                <p className="text-gray-600 mb-4">Solicitudes por mes en los últimos 6 meses</p>
                
                {/* Gráfico de barras simulado */}
                <div className="h-64 bg-white rounded-lg relative">
                  {/* Eje Y */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-4">
                    <span>$180k</span>
                    <span>$135k</span>
                    <span>$90k</span>
                    <span>$45k</span>
                    <span>$0k</span>
                  </div>
                  
                  {/* Barras */}
                  <div className="flex justify-around items-end h-full pl-10 pr-4 pt-4 pb-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 bg-green-400 rounded-t-md" style={{ height: '100px' }}></div>
                      <span className="mt-2 text-xs text-gray-500">Junio</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 bg-green-400 rounded-t-md" style={{ height: '120px' }}></div>
                      <span className="mt-2 text-xs text-gray-500">Julio</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 bg-green-400 rounded-t-md" style={{ height: '150px' }}></div>
                      <span className="mt-2 text-xs text-gray-500">Agosto</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 bg-green-400 rounded-t-md" style={{ height: '155px' }}></div>
                      <span className="mt-2 text-xs text-gray-500">Septiembre</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 bg-green-400 rounded-t-md" style={{ height: '158px' }}></div>
                      <span className="mt-2 text-xs text-gray-500">Octubre</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 bg-green-400 rounded-t-md" style={{ height: '180px' }}></div>
                      <span className="mt-2 text-xs text-gray-500">Noviembre</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Estadísticas</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tasa de ocupación</span>
                        <span className="font-medium text-gray-900">75.0%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Propiedades en mantenimiento</span>
                        <span className="font-medium text-gray-900">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Contratos por renovar</span>
                        <span className="font-medium text-gray-900">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tickets de alta prioridad</span>
                        <span className="font-medium text-gray-900">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Pagos pendientes</span>
                        <span className="font-medium text-gray-900">5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Actividad Reciente</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FaFileAlt className="text-green-600 text-sm" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Nueva solicitud recibida</p>
                          <p className="text-xs text-gray-500">Hace 5 minutos</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FaUsers className="text-green-600 text-sm" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Visita de trabajo social programada</p>
                          <p className="text-xs text-gray-500">Hace 30 minutos</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FaTools className="text-green-600 text-sm" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Material entregado</p>
                          <p className="text-xs text-gray-500">Hace 2 horas</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FaClock className="text-green-600 text-sm" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Recordatorio: Reunión de coordinación</p>
                          <p className="text-xs text-gray-500">Mañana, 09:00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'propiedades' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Lista de Solicitudes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Solicitante
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.solicitudesRecientes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{solicitud.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitud.categoria}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(solicitud.estado)}`}>
                            <span className="capitalize">{solicitud.estado.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(solicitud.fecha)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href={`/solicitud/${solicitud.id}`} className="text-green-600 hover:text-green-900">Ver detalles</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'mantenimiento' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Solicitudes de Mantenimiento</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {stats.actividadesRecientes.map((actividad) => (
                  <div key={actividad.id} className="bg-white p-4 rounded-md shadow-sm">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{actividad.descripcion}</h3>
                        <p className="text-sm text-gray-500 mt-1">{actividad.solicitudId ? `Solicitud #${actividad.solicitudId}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Asignado a:</p>
                        <p className="text-sm font-medium">{actividad.usuario}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard