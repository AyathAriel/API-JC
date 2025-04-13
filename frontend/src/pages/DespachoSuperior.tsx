/**
 * Componente DespachoSuperior - Página para administrar solicitudes en etapa de aprobación
 */
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaFilter, 
  FaUserTie, 
  FaClipboardCheck, 
  FaSearch,
  FaChartLine,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileAlt,
  FaUserClock,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaEye,
  FaClipboardList
} from 'react-icons/fa'
import { 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  CircularProgress, 
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Chip
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import AllInboxIcon from '@mui/icons-material/AllInbox'
import PendingIcon from '@mui/icons-material/Pending'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import moment from 'moment'
import 'moment/locale/es'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ErrorIcon from '@mui/icons-material/Error'
import TodayIcon from '@mui/icons-material/Today'

// Establecer el idioma español para moment
moment.locale('es')

// Definición de componente StatCard
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, lightColor }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </div>
          <div style={{ backgroundColor: lightColor, borderRadius: '50%', padding: '8px' }}>
            {React.cloneElement(icon as React.ReactElement, { sx: { color, fontSize: 28 } })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Interfaces de datos
interface Ciudadano {
  nombre: string
  apellido: string
  cedula: string
  direccion: string
  telefono: string
  correo?: string
}

interface Solicitud {
  id: number | string
  titulo: string
  fecha: string
  estado: string
  prioridad: string
  ciudadano: Ciudadano
  categoria: string
  descripcion: string
  verificado: boolean
  fecha_aprobacion?: string
  usuario_aprobacion?: string
}

// Definiciones para los mock data
interface MockSolicitud {
  id: string;
  nombreCiudadano: string;
  dpi: string;
  fechaSolicitud: Date;
  estado: string;
  telefono: string;
  direccion: string;
  materialesSolicitados: number;
  comentarios: number;
}

const estados = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <FaHourglassHalf className="text-yellow-500" /> },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="text-green-500" /> },
  rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: <FaTimesCircle className="text-red-500" /> },
  en_proceso: { label: 'En proceso', color: 'bg-green-100 text-green-800', icon: <FaSpinner className="text-green-500" /> },
  completado: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="text-green-500" /> }
}

const prioridades = {
  alta: { label: 'Alta', color: 'bg-red-100 text-red-800', icon: <FaArrowUp className="text-red-500" /> },
  media: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', icon: <FaArrowUp className="text-yellow-500" /> },
  baja: { label: 'Baja', color: 'bg-blue-100 text-blue-800', icon: <FaArrowDown className="text-blue-500" /> }
}

const categorias = [
  'Materiales de construcción',
  'Ayuda social',
  'Educación',
  'Salud',
  'Deportes',
  'Infraestructura',
  'Otros'
]

const DespachoSuperior: React.FC = () => {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('todos')
  const [filters, setFilters] = useState({
    estado: 'todos',
    categoria: 'todos',
    fechaDesde: '',
    fechaHasta: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    procesadas_hoy: 0
  })
  const [sortConfig, setSortConfig] = useState<{key: keyof Solicitud, direction: 'asc' | 'desc'}>({
    key: 'fecha',
    direction: 'desc'
  })
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Definición de las pestañas
  const tabs = [
    { id: 'todos', label: 'Todas las solicitudes', icon: <FormatListBulletedIcon /> },
    { id: 'pendiente', label: 'Pendientes', icon: <PendingIcon /> },
    { id: 'aprobado', label: 'Aprobadas', icon: <CheckCircleIcon /> },
    { id: 'rechazado', label: 'Rechazadas', icon: <CancelIcon /> }
  ];

  useEffect(() => {
    // Simular carga de datos
    setLoading(true)
    setTimeout(() => {
      const mockData: MockSolicitud[] = Array.from({ length: 20 }, (_, i) => ({
        id: `REQ-${1000 + i}`,
        nombreCiudadano: `Ciudadano ${i + 1}`,
        dpi: `1234567890${i}`,
        fechaSolicitud: moment().subtract(Math.floor(Math.random() * 30), 'days').toDate(),
        estado: ['pendiente', 'aprobado', 'rechazado'][Math.floor(Math.random() * 3)],
        telefono: `5555-${1000 + i}`,
        direccion: `Zona ${1 + Math.floor(Math.random() * 25)}, Ciudad de Guatemala`,
        materialesSolicitados: Math.floor(Math.random() * 10) + 1,
        comentarios: Math.floor(Math.random() * 5),
      }));
      
      // Convertir los datos mock al formato de Solicitud
      const formattedData: Solicitud[] = mockData.map(item => ({
        id: item.id,
        titulo: `Solicitud de ${item.materialesSolicitados} materiales`,
        fecha: item.fechaSolicitud.toISOString(),
        estado: item.estado,
        prioridad: ['alta', 'media', 'baja'][Math.floor(Math.random() * 3)],
        ciudadano: {
          nombre: item.nombreCiudadano.split(' ')[0],
          apellido: item.nombreCiudadano.split(' ')[1] || 'Apellido',
          cedula: item.dpi,
          direccion: item.direccion,
          telefono: item.telefono
        },
        categoria: categorias[Math.floor(Math.random() * categorias.length)],
        descripcion: `Descripción de la solicitud ${item.id}`,
        verificado: Math.random() > 0.5,
        fecha_aprobacion: item.estado === 'aprobado' ? moment().subtract(Math.floor(Math.random() * 5), 'days').toISOString() : undefined,
        usuario_aprobacion: item.estado === 'aprobado' ? 'Laura Díaz' : undefined
      }));
      
      setSolicitudes(formattedData)
      setFilteredSolicitudes(formattedData)
      
      // Calcular estadísticas
      const pendientes = formattedData.filter(s => s.estado === 'pendiente').length
      const aprobadas = formattedData.filter(s => s.estado === 'aprobado').length
      const rechazadas = formattedData.filter(s => s.estado === 'rechazado').length
      
      // Contar las solicitudes procesadas hoy
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const procesadasHoy = formattedData.filter(s => {
        if (s.fecha_aprobacion) {
          const fechaAprobacion = new Date(s.fecha_aprobacion)
          fechaAprobacion.setHours(0, 0, 0, 0)
          return fechaAprobacion.getTime() === hoy.getTime()
        }
        return false
      }).length
      
      setStats({
        total: formattedData.length,
        pendientes,
        aprobadas,
        rechazadas,
        procesadas_hoy: procesadasHoy
      })
      
      setLoading(false)
    }, 1500)
  }, [])

  useEffect(() => {
    // Aplicar filtros y búsqueda
    let result = [...solicitudes]
    
    // Aplicar filtro de pestañas
    if (tabValue !== 0) {
      const estadoFiltro = tabs[tabValue].id;
      result = result.filter(sol => sol.estado === estadoFiltro)
    }
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(sol => 
        sol.titulo.toLowerCase().includes(searchLower) ||
        sol.ciudadano.nombre.toLowerCase().includes(searchLower) ||
        sol.ciudadano.apellido.toLowerCase().includes(searchLower) ||
        sol.ciudadano.cedula.toLowerCase().includes(searchLower) ||
        `${sol.ciudadano.nombre.toLowerCase()} ${sol.ciudadano.apellido.toLowerCase()}`.includes(searchLower)
      )
    }
    
    // Aplicar otros filtros
    if (filters.categoria !== 'todos') {
      result = result.filter(sol => sol.categoria === filters.categoria)
    }
    
    // Filtros de fecha
    if (dateFilter !== 'todos') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dateFilter === 'hoy') {
        const todayDate = new Date().toDateString()
        result = result.filter(sol => {
          const solDate = new Date(sol.fecha).toDateString()
          return solDate === todayDate
        })
      } else if (dateFilter === 'semana') {
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        result = result.filter(sol => {
          const fecha = new Date(sol.fecha)
          return fecha >= weekAgo
        })
      } else if (dateFilter === 'mes') {
        const monthAgo = new Date()
        monthAgo.setMonth(today.getMonth() - 1)
        result = result.filter(sol => {
          const fecha = new Date(sol.fecha)
          return fecha >= monthAgo
        })
      }
    }
    
    // Fechas específicas si están configuradas
    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde)
      fechaDesde.setHours(0, 0, 0, 0)
      result = result.filter(sol => {
        const fecha = new Date(sol.fecha)
        return fecha >= fechaDesde
      })
    }
    
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta)
      fechaHasta.setHours(23, 59, 59, 999)
      result = result.filter(sol => {
        const fecha = new Date(sol.fecha)
        return fecha <= fechaHasta
      })
    }
    
    // Aplicar ordenamiento
    result.sort((a, b) => {
      if (sortConfig.key === 'fecha' || sortConfig.key === 'fecha_aprobacion') {
        const aValue = a[sortConfig.key] ? new Date(a[sortConfig.key] as string).getTime() : 0
        const bValue = b[sortConfig.key] ? new Date(b[sortConfig.key] as string).getTime() : 0
        
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      } else {
        const aValue = a[sortConfig.key] || ''
        const bValue = b[sortConfig.key] || ''
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        
        return 0
      }
    })
    
    setFilteredSolicitudes(result)
  }, [solicitudes, searchTerm, filters, sortConfig, tabValue, dateFilter])

  const handleSort = (key: keyof Solicitud) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  }

  const handleViewDetails = (id: number | string) => {
    navigate(`/despacho-superior/${id}`);
  }

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      estado: 'todos',
      categoria: 'todos',
      fechaDesde: '',
      fechaHasta: ''
    });
  }

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD MMM YYYY');
  }

  const formatDateTime = (dateString: string) => {
    return moment(dateString).format('DD MMM YYYY, HH:mm');
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm('');
    
    switch(newValue) {
      case 0: // Todas
        setFilters({
          estado: 'todos',
          categoria: 'todos',
          fechaDesde: '',
          fechaHasta: ''
        });
        break;
      case 1: // Pendientes
        setFilters({
          estado: 'pendiente',
          categoria: 'todos',
          fechaDesde: '',
          fechaHasta: ''
        });
        break;
      case 2: // Aprobadas
        setFilters({
          estado: 'aprobado',
          categoria: 'todos',
          fechaDesde: '',
          fechaHasta: ''
        });
        break;
      case 3: // Rechazadas
        setFilters({
          estado: 'rechazado',
          categoria: 'todos',
          fechaDesde: '',
          fechaHasta: ''
        });
        break;
      default:
        setFilters({
          estado: 'todos',
          categoria: 'todos',
          fechaDesde: '',
          fechaHasta: ''
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <CircularProgress sx={{ color: '#9c27b0' }} />
          <span className="text-gray-600">Cargando datos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#003366' }}>
          <FaUserTie className="inline-block mr-2 text-blue-700" /> Despacho Superior
        </Typography>
        
        <div className="flex space-x-4">
          <Button 
            variant="contained" 
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ bgcolor: '#0055A4', '&:hover': { bgcolor: '#003366' }}}
          >
            Filtros
          </Button>
        </div>
      </div>
      
      {/* Sección de tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="solicitudes tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 'medium',
              minHeight: '48px',
              color: '#6B7280',
              '&.Mui-selected': {
                color: '#9c27b0',
                fontWeight: 'bold'
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#9c27b0',
              height: 3
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={tab.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                  {index > 0 && (
                    <Chip 
                      size="small" 
                      label={index === 1 ? stats.pendientes : index === 2 ? stats.aprobadas : stats.rechazadas} 
                      sx={{ 
                        ml: 1, 
                        bgcolor: index === 1 ? '#FEF3C7' : index === 2 ? '#D1FAE5' : '#FEE2E2',
                        color: index === 1 ? '#92400E' : index === 2 ? '#065F46' : '#991B1B',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }} 
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Tablero de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div>
          <StatCard 
            title="Solicitudes" 
            value={stats.total} 
            icon={<AssignmentIcon />} 
            color="#6366F1" 
            lightColor="#EEF2FF"
          />
        </div>
        <div>
          <StatCard 
            title="Pendientes" 
            value={stats.pendientes} 
            icon={<AccessTimeIcon />} 
            color="#F59E0B" 
            lightColor="#FEF3C7"
          />
        </div>
        <div>
          <StatCard 
            title="Aprobadas" 
            value={stats.aprobadas} 
            icon={<CheckCircleIcon />} 
            color="#10B981" 
            lightColor="#D1FAE5"
          />
        </div>
        <div>
          <StatCard 
            title="Rechazadas" 
            value={stats.rechazadas} 
            icon={<ErrorIcon />} 
            color="#EF4444" 
            lightColor="#FEE2E2"
          />
        </div>
        <div>
          <StatCard 
            title="Hoy" 
            value={stats.procesadas_hoy} 
            icon={<TodayIcon />} 
            color="#8B5CF6" 
            lightColor="#EDE9FE"
          />
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <TextField
          label="Buscar por cédula o nombre"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 2 }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            ),
          }}
        />

        <FormControl variant="outlined" sx={{ flex: 1 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            label="Categoría"
          >
            <MenuItem value="todos">Todas las categorías</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      
      {/* Request List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredSolicitudes.length > 0 ? (
          filteredSolicitudes.map((solicitud) => (
            <div key={solicitud.id} className="col-span-1">
              <Card sx={{ height: '100%', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } }}>
                <CardContent>
                  <div className="flex justify-between items-start mb-2">
                    <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', maxWidth: '70%' }}>
                      {solicitud.titulo}
                    </Typography>
                    <div className="flex flex-col items-end">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                          solicitud.estado === 'aprobado'
                            ? 'bg-green-500'
                            : solicitud.estado === 'rechazado'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                      >
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </div>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formatDate(solicitud.fecha)}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    CI: {solicitud.ciudadano.cedula}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Ciudadano: {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Categoría: {solicitud.categoria}
                  </Typography>
                  <div className="flex justify-end mt-2">
                    <Link to={`/despacho-superior/${solicitud.id}`} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        startIcon={<FaEye />}
                        size="small"
                        sx={{
                          bgcolor: '#9c27b0',
                          '&:hover': {
                            bgcolor: '#7b1fa2',
                          },
                        }}
                      >
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center p-8">
            <Typography variant="h6" component="div" color="text.secondary" align="center">
              No se encontraron solicitudes que coincidan con los criterios de búsqueda
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

export default DespachoSuperior 