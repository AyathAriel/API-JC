import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FaUser, 
  FaIdCard, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaPrint,
  FaDownload,
  FaEnvelope,
  FaTimes,
  FaHistory,
  FaClipboard,
  FaFileAlt,
  FaRegComments,
  FaQrcode,
} from 'react-icons/fa'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Tooltip, Badge, IconButton, Button } from '@mui/material'
import DetalleSolicitudActions from '../components/DetalleSolicitudActions'
import toast from 'react-hot-toast'
import QrCodeScanner from '../components/QrCodeScanner'

interface Solicitud {
  id: number
  titulo: string
  descripcion: string
  fecha_creacion: string
  estado: string
  estado_display?: string
  foto_cedula?: string
  recibo_servicios?: string
  ciudadano: {
    id: number
    nombre: string
    apellido: string
    cedula: string
    telefono: string
    direccion: string
    correo_electronico?: string
  }
}

interface HistorialItem {
  id: number
  fecha: string
  accion: string
  usuario: string
  departamento: string
}

const DetalleSolicitud = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('detalles')
  const [showHistorialCiudadano, setShowHistorialCiudadano] = useState(false)
  const [historialCiudadano, setHistorialCiudadano] = useState<HistorialItem[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([
    { id: 1, text: 'Revisada documentación. Todo en orden.', user: 'Maria Rodriguez', timestamp: '2023-04-15T10:30:00Z', department: 'Recepción' },
    { id: 2, text: 'Programada visita para verificación.', user: 'Carlos Méndez', timestamp: '2023-04-16T09:15:00Z', department: 'Trabajo Social' }
  ])
  const [showQrScanner, setShowQrScanner] = useState(false)

  // Referencias para imprimir
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulación de carga de datos
    const fetchSolicitud = async () => {
      try {
        // En una app real, esto sería una llamada a API
        // const response = await fetch(`/api/solicitudes/${id}`)
        // const data = await response.json()
        
        // Datos ficticios para demostración
        const mockSolicitud: Solicitud = {
          id: Number(id),
          titulo: 'Solicitud de materiales para vivienda',
          descripcion: 'Necesito materiales para reparar mi techo después de las lluvias. La situación es urgente ya que mi familia está expuesta a las inclemencias del tiempo. Específicamente, necesito láminas de zinc, clavos y madera para vigas.',
          fecha_creacion: new Date().toISOString(),
          estado: 'pendiente',
          estado_display: 'Pendiente',
          foto_cedula: 'https://via.placeholder.com/800x500?text=Cédula',
          recibo_servicios: 'https://via.placeholder.com/800x500?text=Recibo',
          ciudadano: {
            id: 101,
            nombre: 'Juan',
            apellido: 'Pérez',
            cedula: '8-123-456',
            telefono: '6123-4567',
            direccion: 'Barrio San Miguel, Casa #123, El Porvenir'
          }
        }
        
        // Simular retraso de red
        setTimeout(() => {
          setSolicitud(mockSolicitud)
          setLoading(false)
        }, 800)
        
      } catch (error) {
        console.error('Error al cargar la solicitud:', error)
        setLoading(false)
      }
    }

    fetchSolicitud()
  }, [id])

  const handleVerHistorialCiudadano = () => {
    if (!solicitud) return;
    
    setLoadingHistorial(true);
    setShowHistorialCiudadano(true);
    
    // Simulación de carga de datos del historial
    setTimeout(() => {
      const mockHistorial: HistorialItem[] = [
        { 
          id: 1, 
          fecha: '2023-01-10', 
          accion: 'Solicitud de reparación de acera', 
          usuario: 'María Rodríguez', 
          departamento: 'Recepción' 
        },
        { 
          id: 2, 
          fecha: '2023-02-15', 
          accion: 'Solicitud de materiales para cercado', 
          usuario: 'Carlos Méndez', 
          departamento: 'Recepción' 
        },
        { 
          id: 3, 
          fecha: '2023-03-22', 
          accion: 'Participación en programa comunitario', 
          usuario: 'Ana Gómez', 
          departamento: 'Trabajo Social' 
        },
        { 
          id: 4, 
          fecha: new Date().toISOString().split('T')[0], 
          accion: 'Solicitud actual de materiales', 
          usuario: 'Juan Pérez', 
          departamento: 'Recepción' 
        }
      ];
      
      setHistorialCiudadano(mockHistorial);
      setLoadingHistorial(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 text-green-800'
      case 'rechazado':
        return 'bg-red-100 text-red-800'
      case 'en_espera':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  // Función mejorada para imprimir solicitud
  const handleImprimirSolicitud = () => {
    if (!solicitud || !detailsRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const element = detailsRef.current.cloneNode(true) as HTMLElement;
      
      // Eliminar botones de acción
      const buttonsToRemove = element.querySelectorAll('button');
      buttonsToRemove.forEach(button => {
        if (button.title === "Imprimir solicitud" || 
            button.title === "Descargar documentos" || 
            button.title === "Editar solicitud" || 
            button.title === "Ver imagen" ||
            button.title === "Descargar imagen") {
          button.style.display = 'none';
        }
      });
      
      // Agregar estilos de impresión
      const printStyles = document.createElement('style');
      printStyles.textContent = `
        @media print {
          body { font-family: Arial, sans-serif; color: #000; }
          .container { max-width: 100%; padding: 0; }
          button, .no-print { display: none !important; }
          a { text-decoration: none; color: #000; }
          .shadow, .shadow-sm, .shadow-lg, .shadow-xl, .shadow-md { box-shadow: none !important; }
          .rounded-lg, .rounded-md, .rounded-full { border-radius: 0 !important; }
          .bg-white, .bg-gray-50, .bg-gray-100 { background-color: #fff !important; }
        }
      `;
      element.appendChild(printStyles);
      
      // Aplicar el contenido para impresión
      const printWindow = window.open('', '_blank');
      if (printWindow && solicitud) {
        printWindow.document.write('<html><head><title>Solicitud #' + solicitud.id + '</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        // Esperar a que cargue el contenido antes de imprimir
        printWindow.onload = function() {
          printWindow.focus();
          printWindow.print();
          printWindow.onafterprint = function() {
            printWindow.close();
          };
        };
      }
      
      // Mostrar toast de éxito
      toast.success('Documento enviado a impresión');
    } catch (error: any) {
      console.error('Error al imprimir:', error);
      toast.error('Error al imprimir. Por favor, intente de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  }

  // Función para descargar un documento específico
  const handleDownloadDocument = (url: string | undefined, filename: string) => {
    if (!url) {
      toast.error(`No se pudo descargar: ${filename}`);
      return;
    }
    
    try {
      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = url;
      // Asegurar que el archivo tenga la extensión correcta
      const fileExtension = url.split('.').pop()?.toLowerCase() || 'jpg';
      const finalFilename = filename.endsWith(`.${fileExtension}`) ? filename : `${filename}.${fileExtension}`;
      link.setAttribute('download', finalFilename);
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Descargando: ${finalFilename}`);
    } catch (error) {
      console.error(`Error al descargar ${filename}:`, error);
      toast.error(`Error al descargar ${filename}`);
    }
  };

  // Función para descargar todos los documentos
  const handleDescargarDocumentos = async () => {
    if (!solicitud) return;
    
    setIsDownloading(true);
    
    try {
      // Definimos los documentos disponibles
      const documentos = [
        { nombre: 'Cédula', url: solicitud.foto_cedula },
        { nombre: 'Recibo', url: solicitud.recibo_servicios }
      ].filter(doc => doc.url); // Solo los que tienen URL
      
      if (documentos.length === 0) {
        throw new Error('No hay documentos disponibles para descargar');
      }
      
      // Mostrar toast de progreso
      const toastId = toast.loading(`Descargando 0 de ${documentos.length} documentos...`);
      
      let completados = 0;
      
      for (const doc of documentos) {
        if (!doc.url) continue;
        
        try {
          handleDownloadDocument(doc.url, `${doc.nombre}_${solicitud.id}.jpg`);
          
          // Actualizar contador de completados
          completados += 1;
          toast.loading(`Descargando ${completados} de ${documentos.length} documentos...`, { id: toastId });
        } catch (err) {
          console.error(`Error al descargar documento ${doc.nombre}:`, err);
        }
        
        // Pequeña pausa entre descargas
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Actualizar el toast a completado
      toast.success(`${completados} documentos descargados correctamente`, { id: toastId });
    } catch (error: any) {
      console.error('Error al descargar documentos:', error);
      toast.error(error.message || 'Error al descargar documentos. Por favor, intente de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  }

  // Función mejorada para abrir el formulario de edición
  const handleEditarSolicitud = () => {
    // Mostrar un mensaje de confirmación antes de editar
    const confirmEdit = window.confirm('¿Está seguro que desea editar esta solicitud?');
    
    if (confirmEdit) {
      // En una aplicación real, esto redigiría a una página de edición
      navigate(`/solicitudes/edit/${id}`);
    }
  }

  // Función para añadir comentarios
  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      text: comment,
      user: 'Usuario Actual', // En una app real, este sería el usuario logueado
      timestamp: new Date().toISOString(),
      department: 'Mi Departamento' // En una app real, este sería el departamento del usuario
    };
    
    setComments([...comments, newComment]);
    setComment('');
    toast.success('Comentario añadido correctamente');
  };

  // Función mejorada para descargar comentarios
  const handleDescargarComentarios = () => {
    if (!comments.length) {
      toast.error('No hay comentarios para descargar');
      return;
    }
    
    try {
      setIsDownloading(true);
      
      // Crear un contenido más rico para el archivo
      let content = `# Comentarios de la Solicitud #${id}\n`;
      content += `Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n\n`;
      content += `## Información de la solicitud\n`;
      content += `* Título: ${solicitud?.titulo || 'N/A'}\n`;
      content += `* Estado: ${solicitud?.estado_display || solicitud?.estado || 'N/A'}\n`;
      content += `* Ciudadano: ${solicitud?.ciudadano.nombre} ${solicitud?.ciudadano.apellido}\n\n`;
      
      content += `## Lista de comentarios\n\n`;
      
      comments.forEach((c, index) => {
        content += `### Comentario ${index + 1}\n`;
        content += `* Texto: ${c.text}\n`;
        content += `* Autor: ${c.user} (${c.department})\n`;
        content += `* Fecha: ${formatDate(c.timestamp)}\n\n`;
      });
      
      // Crear blob y descargar
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comentarios_solicitud_${id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Comentarios descargados correctamente');
    } catch (error: any) {
      console.error('Error al descargar comentarios:', error);
      toast.error('Error al descargar comentarios. Por favor, intente de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Añadir una función para manejar el escaneo QR
  const handleQrCodeScanned = (data: string) => {
    try {
      // Intentar parsear los datos como JSON
      const jsonData = JSON.parse(data);
      
      if (jsonData.documentId) {
        toast.success(`Documento identificado: ${jsonData.documentId}`);
        // Aquí podrías hacer algo con el documentId, como abrir el documento
        setShowQrScanner(false);
      } else {
        toast.error('Código QR no válido para documentos');
      }
    } catch (error) {
      console.error('Error al procesar el código QR:', error);
      
      // Si no es JSON, asumir que es una URL o un texto simple
      if (data.startsWith('http')) {
        // Es una URL, podríamos abrirla en una nueva pestaña
        window.open(data, '_blank');
        toast.success('Enlace abierto en nueva pestaña');
      } else {
        toast(`Información escaneada: ${data}`);
      }
      
      setShowQrScanner(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-green-600 text-4xl mb-2" />
          <span className="text-gray-600">Cargando detalles de la solicitud...</span>
        </div>
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-lg">
          <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">Solicitud no encontrada</h2>
          <p className="text-gray-600 text-center mb-6">
            La solicitud que estás buscando no existe o ha sido eliminada.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/solicitudes')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Volver a solicitudes
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Definir pestañas para la navegación horizontal
  const tabs = [
    { id: 'detalles', label: 'Información', icon: <FaFileAlt /> },
    { id: 'documentos', label: 'Documentos', icon: <FaClipboard /> },
    { id: 'historial', label: 'Historial', icon: <FaHistory /> },
    { id: 'comentarios', label: 'Comentarios', icon: <FaRegComments /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8" ref={detailsRef}>
      {/* Cabecera */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={() => navigate('/solicitudes')}
            className="mr-4 text-gray-500 hover:text-gray-700"
            title="Volver"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Solicitud #{solicitud.id}</h1>
            <p className="text-gray-600">Detalles de la solicitud</p>
          </div>
        </div>
        
        <DetalleSolicitudActions 
          estado={solicitud.estado}
          estadoDisplay={solicitud.estado_display}
          isDownloading={isDownloading}
          onPrint={handleImprimirSolicitud}
          onDownload={handleDescargarDocumentos}
          onEdit={handleEditarSolicitud}
        />
      </div>

      {/* Pestañas */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
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

        {/* Contenido según la pestaña activa */}
        <div className="p-6">
          {activeTab === 'detalles' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información de la solicitud */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Información de la Solicitud
                  </h2>
                  
                  <div className="mb-4">
                    <h3 className="text-gray-600 font-medium mb-1">Título</h3>
                    <p className="text-gray-800 font-semibold">{solicitud.titulo}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-gray-600 font-medium mb-1">Descripción</h3>
                    <p className="text-gray-800">{solicitud.descripcion}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Fecha de Creación</h3>
                      <p className="text-gray-800 flex items-center">
                        <FaCalendarAlt className="mr-2 text-green-500" />
                        {solicitud.fecha_creacion ? formatDate(solicitud.fecha_creacion) : ''}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Estado</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(solicitud.estado)}`}>
                        {solicitud.estado_display || solicitud.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Información del ciudadano */}
              <div>
                <div className="bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Información del Ciudadano
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Nombre Completo</h3>
                      <p className="text-gray-800 flex items-center">
                        <FaUser className="mr-2 text-green-500" />
                        {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Cédula</h3>
                      <p className="text-gray-800 flex items-center">
                        <FaIdCard className="mr-2 text-green-500" />
                        {solicitud.ciudadano.cedula}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Teléfono</h3>
                      <p className="text-gray-800 flex items-center">
                        <FaPhoneAlt className="mr-2 text-green-500" />
                        {solicitud.ciudadano.telefono}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Dirección</h3>
                      <p className="text-gray-800 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-500" />
                        {solicitud.ciudadano.direccion}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={handleVerHistorialCiudadano}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaHistory className="mr-2" />
                      Ver historial del ciudadano
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'documentos' && (
            <div className="bg-white rounded-lg">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Documentos
                </h2>
                <button
                  onClick={() => setShowQrScanner(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center text-sm transition-colors"
                >
                  <FaQrcode className="mr-2" />
                  Escanear QR
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img 
                      src={solicitud.foto_cedula} 
                      alt="Cédula" 
                      className="object-cover w-full h-full" 
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button 
                        className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                        onClick={() => setShowImageModal(solicitud.foto_cedula || null)}
                        title="Ver imagen"
                      >
                        <FaEye className="text-green-500" />
                      </button>
                      {solicitud.foto_cedula && (
                        <button 
                          className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                          onClick={() => handleDownloadDocument(solicitud.foto_cedula, `cedula_${solicitud.id}.jpg`)}
                          title="Descargar foto de cédula"
                        >
                          <FaDownload className="text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800">Cédula de Identidad</h3>
                    <p className="text-sm text-gray-500">Documento de identidad del solicitante</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img 
                      src={solicitud.recibo_servicios} 
                      alt="Recibo de Servicios" 
                      className="object-cover w-full h-full" 
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button 
                        className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                        onClick={() => setShowImageModal(solicitud.recibo_servicios || null)}
                        title="Ver imagen"
                      >
                        <FaEye className="text-green-500" />
                      </button>
                      {solicitud.recibo_servicios && (
                        <button 
                          className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                          onClick={() => handleDownloadDocument(solicitud.recibo_servicios, `recibo_${solicitud.id}.jpg`)}
                          title="Descargar recibo de servicios"
                        >
                          <FaDownload className="text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800">Recibo de Servicios</h3>
                    <p className="text-sm text-gray-500">Comprobante de residencia</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'historial' && (
            <div className="bg-white rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Historial de la Solicitud
              </h2>
              
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-7 border-l-2 border-gray-200"></div>
                <ul className="space-y-6">
                  {[
                    { fecha: '2023-04-15 09:30', accion: 'Solicitud creada', usuario: 'Juan Pérez', departamento: 'Recepción' },
                    { fecha: '2023-04-15 15:45', accion: 'Documentos verificados', usuario: 'María Rodríguez', departamento: 'Recepción' },
                    { fecha: '2023-04-16 11:30', accion: 'Enviada a Representante', usuario: 'Carlos Méndez', departamento: 'Recepción' }
                  ].map((item, idx) => (
                    <li key={idx} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-green-100 border-4 border-white flex items-center justify-center z-10">
                        <FaCheckCircle className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{item.accion}</h3>
                        <p className="text-xs text-gray-500">
                          {item.usuario} • {item.departamento} • {item.fecha}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'comentarios' && (
            <div className="bg-white rounded-lg">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Comentarios
                </h2>
                <Button 
                  onClick={handleDescargarComentarios}
                  disabled={isDownloading}
                  startIcon={isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderColor: 'rgba(37, 99, 235, 0.5)',
                    color: '#2563eb',
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(37, 99, 235, 0.04)',
                    },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'medium',
                  }}
                >
                  Descargar comentarios
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="flex flex-col space-y-1 mb-2">
                  <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                    Agregar comentario
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                  />
                </div>
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  variant="contained"
                  size="small"
                  sx={{ 
                    bgcolor: '#16a34a',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#15803d',
                    },
                    textTransform: 'none',
                    fontWeight: 'medium',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    px: 3,
                    py: 1
                  }}
                >
                  Enviar comentario
                </Button>
              </div>
              
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay comentarios todavía</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 mb-2">{c.text}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{c.user} • {c.department}</span>
                        <span>{formatDate(c.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(null)}
        >
          <div 
            className="relative max-w-3xl max-h-screen p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              onClick={() => setShowImageModal(null)}
            >
              <FaTimes className="text-gray-700" />
            </button>
            <img 
              src={showImageModal} 
              alt="Imagen ampliada" 
              className="max-h-[90vh] max-w-full rounded-lg" 
            />
          </div>
        </div>
      )}

      {/* Modal de historial del ciudadano */}
      {showHistorialCiudadano && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowHistorialCiudadano(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Historial del Ciudadano
              </h3>
              <button 
                onClick={() => setShowHistorialCiudadano(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {loadingHistorial ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-green-600 text-3xl mx-auto mb-4" />
                  <p className="text-gray-500">Cargando historial...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {solicitud.ciudadano.cedula}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-7 border-l-2 border-gray-200"></div>
                    <ul className="space-y-6">
                      {historialCiudadano.map((item) => (
                        <li key={item.id} className="relative pl-10">
                          <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-green-100 border-4 border-white flex items-center justify-center z-10">
                            <FaClipboard className="text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{item.accion}</h3>
                            <p className="text-xs text-gray-500">
                              {item.usuario} • {item.departamento} • {item.fecha}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 bg-gray-100 flex justify-end">
              <button
                onClick={() => setShowHistorialCiudadano(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Añadir el componente QR Scanner al final del componente, fuera del return principal */}
      {showQrScanner && (
        <QrCodeScanner
          onScan={handleQrCodeScanned}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  )
}

export default DetalleSolicitud 