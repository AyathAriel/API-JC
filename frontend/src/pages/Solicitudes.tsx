import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { Solicitud, Ciudadano } from '../types/solicitud'
import SolicitudesService from '../services/SolicitudesService'
import WebCamera from '../components/WebCamera'
import QrCodeScanner from '../components/QrCodeScanner'
import { FaTimes, FaCamera, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa'
import ImagePreview from '../components/ImagePreview'

interface NuevaSolicitud {
  titulo: string
  descripcion: string
  ciudadano: {
    nombre: string
    apellido: string
    cedula: string
    direccion: string
    telefono: string
    barrio: string
  }
  fotoCedula: string | null
  fotoSolicitud: string | null
}

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showQrCedula, setShowQrCedula] = useState(false)
  const [showQrRecibo, setShowQrRecibo] = useState(false)
  const [showCameraCedula, setShowCameraCedula] = useState(false)
  const [showCameraRecibo, setShowCameraRecibo] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dateFilter, setDateFilter] = useState<string>('todos')
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentCameraTarget = useRef<'cedula' | 'recibo' | null>(null)
  const { addToast } = useToast()

  // Nuevo estado para manejo de pestañas
  const [activeTab, setActiveTab] = useState('todas')

  // Estado para nueva solicitud
  const [nuevaSolicitud, setNuevaSolicitud] = useState<NuevaSolicitud>({
    titulo: '',
    descripcion: '',
    ciudadano: {
      nombre: '',
      apellido: '',
      cedula: '',
      direccion: '',
      telefono: '',
      barrio: ''
    },
    fotoCedula: null,
    fotoSolicitud: null
  })

  // Estados para previsualización de archivos
  const [previewCedula, setPreviewCedula] = useState<string>('')
  const [previewRecibo, setPreviewRecibo] = useState<string>('')

  const [showCamera, setShowCamera] = useState<boolean>(false)
  const [currentPhotoType, setCurrentPhotoType] = useState<'cedula' | 'solicitud' | null>(null)
  const [fotoSolicitud, setFotoSolicitud] = useState<string | null>(null)
  const [fotoCedula, setFotoCedula] = useState<string | null>(null)

  const [showCameraModal, setShowCameraModal] = useState(false)
  const [captureMode, setCaptureMode] = useState<'cedula' | 'solicitud'>('cedula')

  const [isTakingPhoto, setIsTakingPhoto] = useState(false)
  const [photoType, setPhotoType] = useState<'cedula' | 'solicitud' | null>(null)
  const [cedulaImage, setCedulaImage] = useState<string | null>(null)
  const [solicitudImage, setSolicitudImage] = useState<string | null>(null)

  const [photoSolicitud, setPhotoSolicitud] = useState<string | null>(null)
  const [photoCedula, setPhotoCedula] = useState<string | null>(null)

  // Estados para manejo de QR
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrCodeMode, setQrCodeMode] = useState<'ciudadano' | 'solicitud'>('ciudadano');

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true)
        
        // Obtener solicitudes del servicio que usa localStorage
        const solicitudesData = SolicitudesService.getSolicitudes();
        
        setSolicitudes(solicitudesData)
        setFilteredSolicitudes(solicitudesData)
        setLoading(false)
      } catch (err) {
        setError('Error al cargar las solicitudes')
        setLoading(false)
        console.error('Error fetching solicitudes:', err)
      }
    }

    fetchSolicitudes()
  }, [])

  // Modificar el efecto para aplicar filtros cuando cambia la pestaña seleccionada
  useEffect(() => {
    filterSolicitudesByTab()
  }, [searchTerm, dateFilter, solicitudes, activeTab])

  // Nueva función para filtrar según la pestaña seleccionada
  const filterSolicitudesByTab = () => {
    let result = [...solicitudes];
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(sol => 
        sol.titulo.toLowerCase().includes(term) || 
        sol.descripcion.toLowerCase().includes(term) ||
        sol.id.toString().includes(term) ||
        (sol.ciudadano && 
          `${sol.ciudadano.nombre} ${sol.ciudadano.apellido}`.toLowerCase().includes(term))
      );
    }
    
    // Filtro según la pestaña seleccionada
    if (activeTab !== 'todas') {
      if (activeTab === 'pendientes') {
        result = result.filter(sol => sol.estado === 'pendiente' || sol.en_espera);
      } else if (activeTab === 'aprobadas') {
        result = result.filter(sol => sol.aprobada || sol.estado === 'aprobado_representante' || 
                                      sol.estado === 'aprobado_social' || 
                                      sol.estado === 'en_entrega' || 
                                      sol.estado === 'entregado');
      } else if (activeTab === 'rechazadas') {
        result = result.filter(sol => sol.estado === 'rechazado' || (!sol.aprobada && !sol.en_espera));
      }
    }
    
    // Filtro por fecha
    if (dateFilter !== 'todos') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'hoy') {
        result = result.filter(sol => {
          const solDate = new Date(sol.fecha_creacion);
          return solDate.toDateString() === today.toDateString();
        });
      } else if (dateFilter === 'semana') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        result = result.filter(sol => {
          const solDate = new Date(sol.fecha_creacion);
          return solDate >= lastWeek;
        });
      } else if (dateFilter === 'mes') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        result = result.filter(sol => {
          const solDate = new Date(sol.fecha_creacion);
          return solDate >= lastMonth;
        });
      }
    }
    
    setFilteredSolicitudes(result);
  };

  const getStatusClass = (estado: string) => {
    const statusClasses = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado_representante: 'bg-blue-100 text-blue-800',
      aprobado_social: 'bg-purple-100 text-purple-800',
      en_entrega: 'bg-indigo-100 text-indigo-800',
      entregado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
    }
    return statusClasses[estado as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const { name, value } = e.target;
    
    // Manejar campos anidados (como ciudadano.nombre)
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'ciudadano') {
        setNuevaSolicitud({
          ...nuevaSolicitud,
          ciudadano: {
            ...nuevaSolicitud.ciudadano,
            [child]: value
          }
        });
      }
    } else {
      // Campos normales
      setNuevaSolicitud({
        ...nuevaSolicitud,
        [field]: value
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'foto_cedula' | 'recibo_servicios') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      setNuevaSolicitud({
        ...nuevaSolicitud,
        [field]: file
      })
      
      // Generar preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (field === 'foto_cedula') {
          setPreviewCedula(event.target?.result as string)
        } else {
          setPreviewRecibo(event.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nuevaSolicitud.titulo || !nuevaSolicitud.descripcion) {
      addToast('Debe completar todos los campos requeridos', 'error')
      return
    }

    if (!nuevaSolicitud.ciudadano.nombre || !nuevaSolicitud.ciudadano.apellido || !nuevaSolicitud.ciudadano.cedula) {
      addToast('Debe completar la información del ciudadano', 'error')
      return
    }

    if (!fotoCedula) {
      addToast('Debe agregar una foto de la cédula', 'error')
      return
    }

    try {
      setSubmitting(true)
      
      // Guardar las imágenes de forma segura
      const fotoNombreCedula = fotoCedula ? saveImageToStorage(fotoCedula, 'cedula') : null;
      const fotoNombreSolicitud = fotoSolicitud ? saveImageToStorage(fotoSolicitud, 'solicitud') : null;
      
      // Crear la solicitud con las referencias a las imágenes
      const solicitudConImagenes = {
        ...nuevaSolicitud,
        fotoCedula: fotoNombreCedula,
        fotoSolicitud: fotoNombreSolicitud
      };
      
      // Guardar la solicitud (usando el servicio existente)
      await SolicitudesService.addSolicitud(solicitudConImagenes);
      
      // Actualizar la lista de solicitudes
      const solicitudesActualizadas = SolicitudesService.getSolicitudes();
      setSolicitudes(solicitudesActualizadas);
      setFilteredSolicitudes(solicitudesActualizadas);
      
      // Limpiar el formulario y cerrar el modal
      setNuevaSolicitud({
        titulo: '',
        descripcion: '',
        ciudadano: {
          nombre: '',
          apellido: '',
          cedula: '',
          direccion: '',
          telefono: '',
          barrio: ''
        },
        fotoCedula: null,
        fotoSolicitud: null
      });
      setFotoCedula(null);
      setFotoSolicitud(null);
      setShowModal(false);
      
      addToast('Solicitud registrada exitosamente', 'success');
    } catch (error) {
      console.error('Error al guardar la solicitud:', error);
      addToast('Error al guardar la solicitud', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const toggleQrCedula = () => {
    setShowQrCedula(!showQrCedula)
  }

  const toggleQrRecibo = () => {
    setShowQrRecibo(!showQrRecibo)
  }

  const toggleCameraCedula = () => {
    if (showCameraCedula) {
      stopCamera()
    } else {
      currentCameraTarget.current = 'cedula'
      startCamera()
    }
    setShowCameraCedula(!showCameraCedula)
  }

  const toggleCameraRecibo = () => {
    if (showCameraRecibo) {
      stopCamera()
    } else {
      currentCameraTarget.current = 'recibo'
      startCamera()
    }
    setShowCameraRecibo(!showCameraRecibo)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('No se pudo acceder a la cámara. Por favor, compruebe los permisos del navegador.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar canvas para igualar dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar la imagen actual del video en el canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir la imagen a base64 con calidad
        const imageDataURL = canvas.toDataURL('image/jpeg', 0.9);
        
        try {
          if (currentCameraTarget.current === 'cedula') {
            // Convertir el base64 a un archivo Blob/File
            fetch(imageDataURL)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], `cedula_${Date.now()}.jpg`, { type: 'image/jpeg' });
                setCedulaImage(imageDataURL);
                setShowCameraCedula(false);
                stopCamera();
                addToast('Foto de cédula tomada correctamente', 'success');
              })
              .catch(error => {
                console.error("Error al procesar la imagen de cédula:", error);
                addToast("Error al procesar la imagen. Por favor, intente de nuevo.", "error");
              });
          } else if (currentCameraTarget.current === 'recibo') {
            // Convertir el base64 a un archivo Blob/File
            fetch(imageDataURL)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], `recibo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                setSolicitudImage(imageDataURL);
                setShowCameraRecibo(false);
                stopCamera();
                addToast('Foto de recibo tomada correctamente', 'success');
              })
              .catch(error => {
                console.error("Error al procesar la imagen del recibo:", error);
                addToast("Error al procesar la imagen. Por favor, intente de nuevo.", "error");
              });
          }
        } catch (err) {
          console.error("Error al capturar la foto:", err);
          addToast("Error al capturar la foto. Por favor, intente de nuevo.", "error");
        }
      }
    }
  };

  const handleOpenCamera = (mode: 'cedula' | 'solicitud') => {
    setCaptureMode(mode);
    setShowCamera(true);
  };

  const handleCapturePhoto = (dataUrl: string) => {
    if (currentPhotoType === 'cedula') {
      setNuevaSolicitud({
        ...nuevaSolicitud,
        fotoCedula: dataUrl
      });
      setFotoCedula(dataUrl);
    } else if (currentPhotoType === 'solicitud') {
      setNuevaSolicitud({
        ...nuevaSolicitud,
        fotoSolicitud: dataUrl
      });
      setFotoSolicitud(dataUrl);
    }
    setShowCamera(false);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  // Funciones para escaneo de QR
  const handleShowQrScanner = (mode: 'ciudadano' | 'solicitud') => {
    setQrCodeMode(mode);
    setShowQrScanner(true);
  };

  const handleQrScan = (data: string) => {
    try {
      // Intentar parsear los datos del QR
      const jsonData = JSON.parse(data);
      
      if (qrCodeMode === 'ciudadano' && jsonData.ciudadano) {
        // Actualizar datos del ciudadano desde el QR
        setNuevaSolicitud({
          ...nuevaSolicitud,
          ciudadano: {
            ...nuevaSolicitud.ciudadano,
            nombre: jsonData.ciudadano.nombre || nuevaSolicitud.ciudadano.nombre,
            apellido: jsonData.ciudadano.apellido || nuevaSolicitud.ciudadano.apellido,
            cedula: jsonData.ciudadano.cedula || nuevaSolicitud.ciudadano.cedula,
            direccion: jsonData.ciudadano.direccion || nuevaSolicitud.ciudadano.direccion,
            telefono: jsonData.ciudadano.telefono || nuevaSolicitud.ciudadano.telefono,
            barrio: jsonData.ciudadano.barrio || nuevaSolicitud.ciudadano.barrio
          }
        });
        addToast('Datos del ciudadano escaneados correctamente', 'success');
      } else if (qrCodeMode === 'solicitud' && jsonData.solicitud) {
        // Actualizar datos de la solicitud desde el QR
        setNuevaSolicitud({
          ...nuevaSolicitud,
          titulo: jsonData.solicitud.titulo || nuevaSolicitud.titulo,
          descripcion: jsonData.solicitud.descripcion || nuevaSolicitud.descripcion
        });
        addToast('Datos de la solicitud escaneados correctamente', 'success');
      } else {
        addToast('El código QR no contiene datos válidos para esta operación', 'error');
      }
    } catch (error) {
      console.error('Error al procesar código QR:', error);
      addToast('Error al procesar el código QR. Formato no válido.', 'error');
    }
    
    setShowQrScanner(false);
  };

  // Función para guardar las imágenes de forma más segura
  const saveImageToStorage = (imageDataUrl: string, prefix: string) => {
    try {
      // Generar un nombre único con fecha y hora
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${prefix}_${timestamp}_${randomStr}.jpg`;
      
      // En una implementación real, aquí enviarías la imagen al servidor
      // Para este ejemplo, la guardamos en localStorage (no recomendado para producción)
      localStorage.setItem(`img_${fileName}`, imageDataUrl);
      
      return fileName;
    } catch (error) {
      console.error('Error al guardar la imagen:', error);
      addToast('Error al guardar la imagen', 'error');
      return null;
    }
  };

  // Definir pestañas para la navegación horizontal
  const tabs = [
    { id: 'todas', label: 'Todas las solicitudes', icon: <FaClipboardList /> },
    { id: 'pendientes', label: 'Pendientes', icon: <FaHourglassHalf /> },
    { id: 'aprobadas', label: 'Aprobadas', icon: <FaCheckCircle /> },
    { id: 'rechazadas', label: 'Rechazadas', icon: <FaTimesCircle /> },
  ];

  // Mantener la función SolicitudesTable sin cambios
  const SolicitudesTable = () => {
    if (loading) {
      return <div className="text-center py-4">Cargando solicitudes...</div>
    }

    if (error) {
      return <div className="text-center text-red-600 py-4">{error}</div>
    }

    if (filteredSolicitudes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No se encontraron solicitudes con los criterios seleccionados.</p>
          <button 
            onClick={() => {
              setSearchTerm('')
              setActiveTab('todas')
              setDateFilter('todos')
            }}
            className="text-green-600 hover:text-green-800"
          >
            Limpiar filtros
          </button>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSolicitudes.map((solicitud) => (
              <tr key={solicitud.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {solicitud.ciudadano ? `${solicitud.ciudadano.nombre} ${solicitud.ciudadano.apellido}` : 'Sin nombre'}
                  <div className="text-xs text-gray-500">ID: #{solicitud.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {solicitud.titulo}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {solicitud.descripcion}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(solicitud.fecha_creacion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(solicitud.estado)}`}>
                    {solicitud.estado_display}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/solicitud/${solicitud.id}`)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recepción de Solicitudes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Nueva Solicitud
        </button>
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
              placeholder="Buscar por nombre, título, descripción o ID"
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
          <div className="flex space-x-8 px-6">
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
        <div className="p-4">
          <SolicitudesTable />
        </div>
      </div>

      {/* Modal para nueva solicitud */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-green-600 text-white">
              <h2 className="text-xl font-semibold">Nueva Solicitud</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Información de la Solicitud</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={nuevaSolicitud.titulo}
                        onChange={(e) => handleInputChange(e, 'titulo')}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => handleShowQrScanner('solicitud')}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaQrcode className="mr-2" />
                        QR
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                      value={nuevaSolicitud.descripcion}
                      onChange={(e) => handleInputChange(e, 'descripcion')}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Foto de Cédula <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCamera('cedula')}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <FaCamera className="mr-2" /> Tomar foto
                        </button>
                        {cedulaImage && (
                          <div className="relative h-20 w-20 border rounded overflow-hidden">
                            <img src={cedulaImage} alt="Preview cédula" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setCedulaImage(null)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              title="Eliminar foto"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Foto de Solicitud <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCamera('solicitud')}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <FaCamera className="mr-2" /> Tomar foto
                        </button>
                        {solicitudImage && (
                          <div className="relative h-20 w-20 border rounded overflow-hidden">
                            <img src={solicitudImage} alt="Preview solicitud" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setSolicitudImage(null)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              title="Eliminar foto"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Información del Ciudadano</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-gray-700 font-medium mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={nuevaSolicitud.ciudadano.nombre || ''}
                      onChange={(e) => handleInputChange(e, 'ciudadano.nombre')}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="apellido" className="block text-gray-700 font-medium mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={nuevaSolicitud.ciudadano.apellido || ''}
                      onChange={(e) => handleInputChange(e, 'ciudadano.apellido')}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="cedula" className="block text-gray-700 font-medium mb-2">
                      Cédula
                    </label>
                    <input
                      type="text"
                      id="cedula"
                      name="cedula"
                      value={nuevaSolicitud.ciudadano.cedula || ''}
                      onChange={(e) => handleInputChange(e, 'ciudadano.cedula')}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="direccion" className="block text-gray-700 font-medium mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={nuevaSolicitud.ciudadano.direccion || ''}
                      onChange={(e) => handleInputChange(e, 'ciudadano.direccion')}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="telefono" className="block text-gray-700 font-medium mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={nuevaSolicitud.ciudadano.telefono || ''}
                      onChange={(e) => handleInputChange(e, 'ciudadano.telefono')}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="barrio" className="block text-gray-700 font-medium mb-2">
                      Barrio
                    </label>
                    <input
                      type="text"
                      id="barrio"
                      name="barrio"
                      value={nuevaSolicitud.ciudadano.barrio || ''}
                      onChange={(e) => handleInputChange(e, 'ciudadano.barrio')}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showCamera && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-lg">
            <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {captureMode === 'cedula' ? 'Tomar foto de la cédula' : 'Tomar foto de la solicitud'}
              </h3>
              <button 
                onClick={handleCloseCamera}
                className="text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <WebCamera onCapture={handleCapturePhoto} onClose={handleCloseCamera} />
            </div>
          </div>
        </div>
      )}
      
      {/* Escáner QR */}
      {showQrScanner && (
        <QrCodeScanner 
          onScan={handleQrScan} 
          onClose={() => setShowQrScanner(false)} 
        />
      )}
    </div>
  )
}

export default Solicitudes 