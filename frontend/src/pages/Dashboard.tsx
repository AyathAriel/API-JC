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
  FaClock,
  FaBoxOpen,
  FaTruck
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
  entregasPorMes: {
    mes: string
    cantidad: number
  }[]
  entregasPorSemana: {
    semana: string
    cantidad: number
  }[]
  usuariosActivos: {
    nombre: string
    departamento: string
    entregas: number
  }[]
  tiposAyuda: {
    tipo: string
    cantidad: number
  }[]
  totalEntregas: number
  entregasHoy: number
  entregasSemana: number
  entregasMes: number
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
    
    // Generar datos adicionales para entregas
    const entregasPorMes = [
      { mes: 'Enero', cantidad: Math.floor(Math.random() * 30) + 10 },
      { mes: 'Febrero', cantidad: Math.floor(Math.random() * 30) + 15 },
      { mes: 'Marzo', cantidad: Math.floor(Math.random() * 30) + 20 },
      { mes: 'Abril', cantidad: Math.floor(Math.random() * 30) + 25 },
      { mes: 'Mayo', cantidad: Math.floor(Math.random() * 30) + 30 },
      { mes: 'Junio', cantidad: Math.floor(Math.random() * 30) + 35 },
    ];
    
    const entregasPorSemana = [
      { semana: 'Semana 1', cantidad: Math.floor(Math.random() * 15) + 5 },
      { semana: 'Semana 2', cantidad: Math.floor(Math.random() * 15) + 8 },
      { semana: 'Semana 3', cantidad: Math.floor(Math.random() * 15) + 10 },
      { semana: 'Semana 4', cantidad: Math.floor(Math.random() * 15) + 12 },
    ];
    
    const usuariosActivos = [
      { nombre: 'Carlos Ruiz', departamento: 'Almacén', entregas: Math.floor(Math.random() * 20) + 30 },
      { nombre: 'María López', departamento: 'Despacho', entregas: Math.floor(Math.random() * 20) + 25 },
      { nombre: 'Juan Pérez', departamento: 'Trabajo Social', entregas: Math.floor(Math.random() * 20) + 20 },
      { nombre: 'Ana Martínez', departamento: 'Almacén', entregas: Math.floor(Math.random() * 20) + 15 },
      { nombre: 'Pedro González', departamento: 'Despacho', entregas: Math.floor(Math.random() * 20) + 10 },
    ];
    
    const tiposAyuda = [
      { tipo: 'Materiales de construcción', cantidad: Math.floor(Math.random() * 50) + 50 },
      { tipo: 'Alimentos', cantidad: Math.floor(Math.random() * 40) + 40 },
      { tipo: 'Medicamentos', cantidad: Math.floor(Math.random() * 30) + 30 },
      { tipo: 'Útiles escolares', cantidad: Math.floor(Math.random() * 20) + 20 },
      { tipo: 'Ropa', cantidad: Math.floor(Math.random() * 10) + 10 },
    ];
    
    const totalEntregas = entregasPorMes.reduce((acc, curr) => acc + curr.cantidad, 0);
    const entregasHoy = Math.floor(Math.random() * 10) + 1;
    const entregasSemana = Math.floor(Math.random() * 40) + 20;
    const entregasMes = Math.floor(Math.random() * 100) + 50;
    
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
      actividadesRecientes,
      entregasPorMes,
      entregasPorSemana,
      usuariosActivos,
      tiposAyuda,
      totalEntregas,
      entregasHoy,
      entregasSemana,
      entregasMes
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
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard de Entregas</h1>
        <p className="text-gray-600">Vista general de las entregas y distribución de ayudas</p>
      </div>

      {/* Tarjetas con estadísticas de entregas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total de Entregas</h3>
              <div className="text-2xl font-bold mt-2">{stats.totalEntregas}</div>
              <div className="text-sm text-green-500 mt-1">
                +{Math.floor(stats.totalEntregas * 0.1)} respecto al mes anterior
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaBoxOpen className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Entregas de Hoy</h3>
              <div className="text-2xl font-bold mt-2">{stats.entregasHoy}</div>
              <div className="text-sm text-green-500 mt-1">
                +{stats.entregasHoy} respecto a ayer
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaClock className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Entregas esta Semana</h3>
              <div className="text-2xl font-bold mt-2">{stats.entregasSemana}</div>
              <div className="text-sm text-green-500 mt-1">
                +{Math.floor(stats.entregasSemana * 0.15)} respecto a la semana anterior
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaRegCalendarAlt className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Entregas este Mes</h3>
              <div className="text-2xl font-bold mt-2">{stats.entregasMes}</div>
              <div className="text-sm text-green-500 mt-1">
                +{Math.floor(stats.entregasMes * 0.08)} respecto al mes anterior
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaCalendarAlt className="text-yellow-600" />
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
              <FaChartLine className="mr-2" />
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('entregas')}
              className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'entregas'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBoxOpen className="mr-2" />
              Entregas
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'usuarios'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUsers className="mr-2" />
              Usuarios Activos
            </button>
            <button
              onClick={() => setActiveTab('ayudas')}
              className={`flex items-center py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'ayudas'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaTools className="mr-2" />
              Tipos de Ayuda
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'resumen' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Actividad</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Entregas por Mes</h4>
                  <div className="h-80">
                    {/* Comentado por ahora, se puede descomentar si se importa Chart.js */}
                    {/* <Bar 
                      data={{
                        labels: stats.entregasPorMes.map(item => item.mes),
                        datasets: [{
                          label: 'Entregas',
                          data: stats.entregasPorMes.map(item => item.cantidad),
                          backgroundColor: 'rgba(16, 185, 129, 0.6)',
                          borderColor: 'rgb(16, 185, 129)',
                          borderWidth: 1
                        }]
                      }}
                      options={barOptions}
                    /> */}
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaChartBar className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Gráfico de entregas por mes</p>
                        <p className="text-xs text-gray-400 mt-2">(Importa Chart.js para activar)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Entregas por Semana</h4>
                  <div className="h-80">
                    {/* Comentado por ahora, se puede descomentar si se importa Chart.js */}
                    {/* <Line 
                      data={{
                        labels: stats.entregasPorSemana.map(item => item.semana),
                        datasets: [{
                          label: 'Entregas',
                          data: stats.entregasPorSemana.map(item => item.cantidad),
                          backgroundColor: 'rgba(99, 102, 241, 0.6)',
                          borderColor: 'rgb(99, 102, 241)',
                          borderWidth: 1,
                          tension: 0.1
                        }]
                      }}
                      options={barOptions}
                    /> */}
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaChartLine className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Gráfico de entregas por semana</p>
                        <p className="text-xs text-gray-400 mt-2">(Importa Chart.js para activar)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entregas' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de Entregas</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beneficiario
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.solicitudesRecientes.map((sol) => (
                      <tr key={sol.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{sol.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                              <FaUser />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {sol.ciudadano.nombre} {sol.ciudadano.apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                {sol.ciudadano.cedula}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sol.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sol.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sol.estado)}`}>
                            {sol.estado === 'completado' ? 'Entregado' : sol.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios Más Activos</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Top 5 Usuarios por Entregas</h4>
                  <div className="space-y-4">
                    {stats.usuariosActivos.map((usuario, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                          <div className="font-semibold">{index + 1}</div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                          <div className="text-xs text-gray-500">{usuario.departamento}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{usuario.entregas}</div>
                          <div className="text-xs text-gray-500">entregas</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Distribución por Departamento</h4>
                  <div className="h-80">
                    {/* Comentado por ahora, se puede descomentar si se importa Chart.js */}
                    {/* <Doughnut
                      data={{
                        labels: ['Almacén', 'Despacho', 'Trabajo Social'],
                        datasets: [{
                          data: [45, 30, 25],
                          backgroundColor: [
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(245, 158, 11, 0.7)'
                          ]
                        }]
                      }}
                    /> */}
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaChartPie className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Gráfico de distribución por departamento</p>
                        <p className="text-xs text-gray-400 mt-2">(Importa Chart.js para activar)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ayudas' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Ayuda Entregada</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Distribución por Tipo</h4>
                  <div className="h-80">
                    {/* Comentado por ahora, se puede descomentar si se importa Chart.js */}
                    {/* <Doughnut
                      data={{
                        labels: stats.tiposAyuda.map(item => item.tipo),
                        datasets: [{
                          data: stats.tiposAyuda.map(item => item.cantidad),
                          backgroundColor: [
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(236, 72, 153, 0.7)',
                            'rgba(59, 130, 246, 0.7)'
                          ]
                        }]
                      }}
                    /> */}
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaChartPie className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500">Gráfico de distribución por tipo de ayuda</p>
                        <p className="text-xs text-gray-400 mt-2">(Importa Chart.js para activar)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Ranking de Ayudas Entregadas</h4>
                  <div className="space-y-4">
                    {stats.tiposAyuda.map((tipo, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                          <div className="font-semibold">{index + 1}</div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-medium text-gray-900">{tipo.tipo}</div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(tipo.cantidad / stats.tiposAyuda[0].cantidad) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{tipo.cantidad}</div>
                          <div className="text-xs text-gray-500">unidades</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/entregas')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <FaTruck className="mr-2" /> Ver Todas las Entregas
          </button>
          <button
            onClick={() => handleExportReport('pdf')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaFilePdf className="mr-2" /> Exportar Reporte PDF
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaFileExcel className="mr-2" /> Exportar Reporte Excel
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard