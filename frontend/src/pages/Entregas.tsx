import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBox, 
  FaSearch, 
  FaCalendarAlt, 
  FaFilter, 
  FaFileDownload, 
  FaCamera, 
  FaCheck, 
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaQrcode
} from 'react-icons/fa';
import { 
  Box, 
  Tab, 
  Tabs, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import SolicitudesService from '../services/SolicitudesService';
import { Solicitud } from '../types/solicitud';
import toast from 'react-hot-toast';
import QrCodeScanner from '../components/QrCodeScanner';

const Entregas: React.FC = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pendientes');
  const [dateFilter, setDateFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [entregaEnProceso, setEntregaEnProceso] = useState<Solicitud | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [comentarioEntrega, setComentarioEntrega] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Referencias
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        // Obtener solicitudes del servicio
        const solicitudesData = SolicitudesService.getSolicitudes();
        setSolicitudes(solicitudesData);
        setFilteredSolicitudes(solicitudesData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        toast.error('Error al cargar las solicitudes');
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  useEffect(() => {
    filterSolicitudes();
  }, [solicitudes, searchTerm, activeTab, dateFilter]);

  const filterSolicitudes = () => {
    let result = [...solicitudes];
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(sol => 
        sol.titulo.toLowerCase().includes(term) || 
        sol.descripcion.toLowerCase().includes(term) ||
        sol.id.toString().includes(term) ||
        (sol.ciudadano && (
          sol.ciudadano.nombre.toLowerCase().includes(term) ||
          sol.ciudadano.apellido.toLowerCase().includes(term) ||
          sol.ciudadano.cedula.toLowerCase().includes(term) ||
          `${sol.ciudadano.nombre} ${sol.ciudadano.apellido}`.toLowerCase().includes(term)
        ))
      );
    }
    
    // Filtro por pestaña
    if (activeTab === 'pendientes') {
      // Mostrar solicitudes aprobadas pendientes de entrega
      result = result.filter(sol => 
        (sol.estado === 'aprobado_despacho' || 
         sol.estado === 'aprobado_representante' ||
         sol.estado === 'aprobado_social' ||
         sol.estado === 'en_entrega'));
    } else if (activeTab === 'entregadas') {
      // Mostrar solicitudes entregadas
      result = result.filter(sol => sol.estado === 'entregado');
    }
    
    // Filtro por fecha
    if (dateFilter !== 'todos') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'hoy') {
        result = result.filter(sol => {
          const fecha = new Date(sol.fecha_creacion);
          return fecha.toDateString() === today.toDateString();
        });
      } else if (dateFilter === 'semana') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter(sol => {
          const fecha = new Date(sol.fecha_creacion);
          return fecha >= weekAgo;
        });
      } else if (dateFilter === 'mes') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        result = result.filter(sol => {
          const fecha = new Date(sol.fecha_creacion);
          return fecha >= monthAgo;
        });
      }
    }
    
    setFilteredSolicitudes(result);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDateFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDateFilter(event.target.value as string);
  };

  const handleVerDetalles = (id: number) => {
    navigate(`/despacho-superior/${id}`);
  };

  const handleRegistrarEntrega = (solicitud: Solicitud) => {
    setEntregaEnProceso(solicitud);
    setFotos([]);
    setFotosPreview([]);
    setComentarioEntrega('');
    setShowModal(true);
  };

  const activarSelectorFotos = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivosSeleccionados = e.target.files;
    
    if (archivosSeleccionados) {
      // Convertir FileList a Array
      const nuevasFotos = Array.from(archivosSeleccionados);
      
      // Validar tipo de archivo (solo imágenes)
      const sonImagenes = nuevasFotos.every(file => 
        file.type.startsWith('image/jpeg') || 
        file.type.startsWith('image/png') || 
        file.type.startsWith('image/jpg')
      );
      
      if (!sonImagenes) {
        toast.error('Solo se permiten archivos de imagen (JPG, JPEG, PNG)');
        return;
      }
      
      // Validar tamaño (máximo 5MB por archivo)
      const tamañoValido = nuevasFotos.every(file => file.size <= 5 * 1024 * 1024);
      
      if (!tamañoValido) {
        toast.error('Cada imagen debe ser menor a 5MB');
        return;
      }
      
      // Actualizar estado de fotos
      setFotos(prevFotos => [...prevFotos, ...nuevasFotos]);
      
      // Generar previsualizaciones
      const nuevasPrevisualizaciones = nuevasFotos.map(file => URL.createObjectURL(file));
      setFotosPreview(prevPreviews => [...prevPreviews, ...nuevasPrevisualizaciones]);
    }
  };

  const eliminarFoto = (index: number) => {
    // Liberar URL de objeto para evitar fugas de memoria
    URL.revokeObjectURL(fotosPreview[index]);
    
    // Actualizar estados
    setFotos(fotos.filter((_, i) => i !== index));
    setFotosPreview(fotosPreview.filter((_, i) => i !== index));
  };

  const confirmarEntrega = async () => {
    if (!entregaEnProceso) {
      toast.error('No hay información de la solicitud');
      return;
    }
    
    if (fotos.length === 0) {
      toast.error('Por favor, agregue al menos una foto de la entrega');
      return;
    }
    
    const toastId = toast.loading('Procesando entrega...');
    
    try {
      // Convertir fotos a base64 (simulando subida a servidor)
      const fotosBase64Promises = fotos.map(file => 
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
      
      const fotosBase64 = await Promise.all(fotosBase64Promises);
      
      // Fecha actual para las fotos
      const fechaEntrega = new Date().toISOString();
      
      // Crear documentos para la solicitud
      const documentos = entregaEnProceso.documentos || [];
      fotosBase64.forEach((base64, index) => {
        documentos.push(`Foto de entrega ${index + 1}: ${base64.substring(0, 30)}...`);
      });
      
      // Actualizar la solicitud
      const solicitudActualizada: Solicitud = {
        ...entregaEnProceso,
        estado: 'entregado',
        estado_display: 'Entregado',
        fecha_actualizacion: fechaEntrega,
        documentos
      };
      
      // Guardar en el servicio
      const actualizado = SolicitudesService.updateSolicitud(entregaEnProceso.id, solicitudActualizada);
      
      if (actualizado) {
        // Actualizar la lista de solicitudes
        setSolicitudes(prevSols => prevSols.map(s => 
          s.id === entregaEnProceso.id ? solicitudActualizada : s
        ));
        
        // Limpiar el formulario
        setFotos([]);
        setFotosPreview([]);
        setComentarioEntrega('');
        setEntregaEnProceso(null);
        setShowModal(false);
        
        toast.success('Entrega registrada exitosamente', { id: toastId });
      } else {
        throw new Error('No se pudo actualizar la solicitud');
      }
    } catch (error) {
      console.error('Error al registrar entrega:', error);
      toast.error('Error al registrar la entrega. Intente nuevamente.', { id: toastId });
    }
  };

  // Limpiar URLs de objetos al desmontar
  useEffect(() => {
    return () => {
      fotosPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [fotosPreview]);

  const handleQrScan = (data: string) => {
    try {
      // Intentar decodificar el código QR
      const solicitudInfo = JSON.parse(data);
      if (solicitudInfo.id) {
        const solicitud = solicitudes.find(s => s.id === solicitudInfo.id);
        if (solicitud) {
          setShowQrScanner(false);
          handleRegistrarEntrega(solicitud);
        } else {
          toast.error('Solicitud no encontrada');
        }
      } else {
        toast.error('Código QR inválido');
      }
    } catch (error) {
      console.error('Error al escanear QR:', error);
      toast.error('Error al procesar el código QR');
    }
  };

  const getStatusChip = (estado: string) => {
    switch (estado) {
      case 'entregado':
        return <Chip 
          icon={<FaCheckCircle />} 
          label="Entregado" 
          size="small" 
          sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 500 }} 
        />;
      case 'aprobado_despacho':
        return <Chip 
          icon={<FaTruck />} 
          label="Listo para entrega" 
          size="small" 
          sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 500 }} 
        />;
      case 'en_entrega':
        return <Chip 
          icon={<FaTruck />} 
          label="En proceso de entrega" 
          size="small" 
          sx={{ bgcolor: '#c7d2fe', color: '#3730a3', fontWeight: 500 }} 
        />;
      case 'aprobado_representante':
      case 'aprobado_social':
        return <Chip 
          icon={<FaCheck />} 
          label="Aprobado" 
          size="small" 
          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 500 }} 
        />;
      default:
        return <Chip 
          icon={<FaSpinner />} 
          label="Pendiente" 
          size="small" 
          sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 500 }} 
        />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
        <span className="ml-3 text-lg text-gray-700">Cargando entregas...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#374151' }}>
          <FaBox className="inline-block mr-2 text-green-600" /> Gestión de Entregas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestión y seguimiento de entregas de materiales y solicitudes aprobadas
        </Typography>
      </div>

      {/* Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none',
              minWidth: 0,
              fontSize: '0.95rem',
              fontWeight: 'medium',
              mx: 1
            },
            '& .Mui-selected': {
              color: '#10b981',
              fontWeight: 'bold'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10b981'
            }
          }}
        >
          <Tab 
            value="pendientes" 
            label={
              <div className="flex items-center">
                <FaTruck className="mr-1.5" />
                Pendientes de Entrega
              </div>
            } 
          />
          <Tab 
            value="entregadas" 
            label={
              <div className="flex items-center">
                <FaCheckCircle className="mr-1.5" />
                Entregas Completadas
              </div>
            } 
          />
        </Tabs>
      </Box>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <TextField
          placeholder="Buscar por nombre, cédula o ID..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: '300px' } }}
          InputProps={{
            startAdornment: <FaSearch className="mr-2 text-gray-400" />
          }}
        />
        
        <FormControl 
          size="small" 
          sx={{ minWidth: '150px' }}
        >
          <InputLabel>Período</InputLabel>
          <Select
            value={dateFilter}
            label="Período"
            onChange={handleDateFilterChange as any}
          >
            <MenuItem value="todos">Todas las fechas</MenuItem>
            <MenuItem value="hoy">Hoy</MenuItem>
            <MenuItem value="semana">Esta semana</MenuItem>
            <MenuItem value="mes">Este mes</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          startIcon={<FaQrcode />} 
          onClick={() => setShowQrScanner(true)}
          sx={{ 
            bgcolor: '#10b981', 
            '&:hover': { bgcolor: '#059669' },
            height: '40px' 
          }}
        >
          Escanear QR
        </Button>
      </div>

      {/* Lista de solicitudes */}
      <Grid container spacing={3}>
        {filteredSolicitudes.length > 0 ? (
          filteredSolicitudes.map(solicitud => (
            <Grid item xs={12} sm={6} md={4} key={solicitud.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 2, 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <div className="flex justify-between items-start mb-3">
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ fontWeight: 'bold', mb: 0.5, maxWidth: '80%' }}
                    >
                      #{solicitud.id} - {solicitud.titulo}
                    </Typography>
                    {getStatusChip(solicitud.estado)}
                  </div>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {solicitud.descripcion}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <div className="flex flex-col space-y-1 mb-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-28">Beneficiario:</span>
                      <span className="text-sm text-gray-800">
                        {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-28">Cédula:</span>
                      <span className="text-sm text-gray-800">
                        {solicitud.ciudadano.cedula}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-500 w-28">Dirección:</span>
                      <span className="text-sm text-gray-800">
                        {solicitud.ciudadano.direccion}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-28">Fecha:</span>
                      <span className="text-sm text-gray-800">
                        {formatDate(solicitud.fecha_creacion)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleVerDetalles(solicitud.id)}
                      sx={{ textTransform: 'none', borderColor: '#6366f1', color: '#6366f1' }}
                    >
                      Ver detalles
                    </Button>
                    
                    {(solicitud.estado !== 'entregado') && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={() => handleRegistrarEntrega(solicitud)}
                        sx={{ 
                          textTransform: 'none', 
                          bgcolor: '#10b981', 
                          '&:hover': { 
                            bgcolor: '#059669' 
                          } 
                        }}
                      >
                        Registrar entrega
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
              <FaBox className="text-5xl text-gray-300 mb-4" />
              <Typography variant="h6" align="center" color="textSecondary">
                No hay solicitudes pendientes de entrega
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1 }}>
                Todas las solicitudes aprobadas ya han sido entregadas o no hay solicitudes que coincidan con los criterios de búsqueda.
              </Typography>
            </div>
          </Grid>
        )}
      </Grid>

      {/* Modal de registro de entrega */}
      {showModal && entregaEnProceso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar entrega de materiales</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Detalles de la solicitud</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-sm mb-1">
                  <span className="font-medium">ID:</span> {entregaEnProceso.id}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Solicitante:</span> {entregaEnProceso.ciudadano.nombre} {entregaEnProceso.ciudadano.apellido}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Cédula:</span> {entregaEnProceso.ciudadano.cedula}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Dirección:</span> {entregaEnProceso.ciudadano.direccion}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Título:</span> {entregaEnProceso.titulo}
                </p>
              </div>
            </div>
            
            {/* Input oculto para seleccionar fotos */}
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              multiple
              onChange={handleFotosChange}
            />
            
            {/* Área para subir fotos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos de la entrega <span className="text-red-500">*</span>
              </label>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={activarSelectorFotos}
              >
                <FaCamera className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-600 mb-1">Haga clic para seleccionar fotos</p>
                <p className="text-xs text-gray-500">JPG, JPEG o PNG (máx. 5MB por foto)</p>
              </div>
              
              {/* Vista previa de fotos */}
              {fotosPreview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fotosPreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded border border-gray-200"
                      />
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarFoto(index);
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Comentario de entrega */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario de entrega
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Agregue comentarios sobre la entrega, condiciones, observaciones, etc."
                value={comentarioEntrega}
                onChange={(e) => setComentarioEntrega(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEntrega}
                disabled={fotos.length === 0}
                className={`px-4 py-2 rounded-md flex items-center ${
                  fotos.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <FaCheck className="mr-2" />
                Confirmar entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner */}
      {showQrScanner && (
        <QrCodeScanner
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  );
};

export default Entregas; 