import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaCommentAlt, FaUserCheck, FaUserTimes, FaHistory, FaFileDownload, FaClipboardCheck, FaExclamationTriangle, FaWhatsapp, FaEnvelope, FaPrint, FaCamera, FaUpload, FaSpinner, FaTimesCircle, FaCheckCircle, FaBoxOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Ciudadano {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  correo_electronico?: string;
}

interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  aprobado: boolean;
}

interface Comentario {
  id: number;
  texto: string;
  usuario: string;
  fecha: string;
  departamento: string;
}

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  fecha_subida: string;
  url: string;
  name?: string;
  type?: string;
  uploadDate?: string;
}

interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: string;
  estado_display: string;
  prioridad: 'baja' | 'media' | 'alta';
  ciudadano: Ciudadano;
  materiales: Material[];
  comentarios: Comentario[];
  documentos: Documento[];
  etapa_actual: string;
  aprobada_representante: boolean;
  aprobada_trabajo_social: boolean;
  aprobada_despacho: boolean;
}

const DetalleDespachoSuperior: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comentario, setComentario] = useState<string>('');
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState<boolean>(false);
  const [motivoRechazo, setMotivoRechazo] = useState<string>('');
  const [materialesEditados, setMaterialesEditados] = useState<Material[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);

  // Estados para el registro de entregas
  const [mostrarModalEntrega, setMostrarModalEntrega] = useState<boolean>(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [comentarioEntrega, setComentarioEntrega] = useState<string>('');
  const [loadingEntrega, setLoadingEntrega] = useState<boolean>(false);

  // Referencia al input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock de historial de la solicitud
  const historialSolicitud = [
    { fecha: '2023-04-15 09:30', accion: 'Solicitud creada', usuario: 'Juan Pérez', departamento: 'Recepción' },
    { fecha: '2023-04-16 11:45', accion: 'Revisada por Representante', usuario: 'María Gómez', departamento: 'Representante' },
    { fecha: '2023-04-18 14:20', accion: 'Aprobada por Representante', usuario: 'María Gómez', departamento: 'Representante' },
    { fecha: '2023-04-20 10:15', accion: 'Verificación de residencia completada', usuario: 'Carlos Ruiz', departamento: 'Trabajo Social' },
    { fecha: '2023-04-22 16:30', accion: 'Aprobada por Trabajo Social', usuario: 'Carlos Ruiz', departamento: 'Trabajo Social' },
  ];

  // Mock data para simular carga de la solicitud
  useEffect(() => {
    const cargarSolicitud = async () => {
      setLoading(true);
      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const solicitudData: Solicitud = {
          id: parseInt(id || '0'),
          titulo: 'Solicitud de materiales para reparación de vivienda',
          descripcion: 'Necesito materiales para reparar el techo de mi vivienda que fue dañado durante las últimas lluvias.',
          fecha_creacion: '2023-04-15T09:30:00',
          fecha_actualizacion: '2023-04-22T16:30:00',
          estado: 'pendiente_despacho',
          estado_display: 'Pendiente de aprobación por Despacho Superior',
          prioridad: 'alta',
          ciudadano: {
            id: 1,
            nombre: 'Ana',
            apellido: 'Martínez',
            cedula: '8-123-456',
            telefono: '6789-1234',
            direccion: 'Calle 5, Casa 23, San Miguelito',
            fecha_nacimiento: '1985-06-12',
            correo_electronico: 'ana.martinez@ejemplo.com'
          },
          materiales: [
            { id: 1, nombre: 'Láminas de zinc', cantidad: 10, unidad: 'unidades', aprobado: true },
            { id: 2, nombre: 'Cemento', cantidad: 5, unidad: 'bolsas', aprobado: true },
            { id: 3, nombre: 'Arena', cantidad: 2, unidad: 'metros cúbicos', aprobado: true },
            { id: 4, nombre: 'Bloques', cantidad: 50, unidad: 'unidades', aprobado: true }
          ],
          comentarios: [
            { 
              id: 1, 
              texto: 'Solicitud recibida. La ciudadana presenta toda la documentación requerida.', 
              usuario: 'Juan Pérez', 
              fecha: '2023-04-15T09:35:00',
              departamento: 'Recepción'
            },
            { 
              id: 2, 
              texto: 'He verificado que la solicitante vive en el corregimiento. Recomiendo aprobar.', 
              usuario: 'María Gómez', 
              fecha: '2023-04-16T11:45:00',
              departamento: 'Representante'
            },
            { 
              id: 3, 
              texto: 'Visita domiciliaria realizada. Se confirma la necesidad urgente de los materiales solicitados.', 
              usuario: 'Carlos Ruiz', 
              fecha: '2023-04-20T10:15:00',
              departamento: 'Trabajo Social'
            }
          ],
          documentos: [
            { id: '1', nombre: 'Cédula', tipo: 'imagen', fecha_subida: '2023-04-15T09:30:00', url: '/docs/cedula.jpg' },
            { id: '2', nombre: 'Recibo de luz', tipo: 'pdf', fecha_subida: '2023-04-15T09:30:00', url: '/docs/recibo.pdf' },
            { id: '3', nombre: 'Fotos de daños', tipo: 'imagen', fecha_subida: '2023-04-15T09:30:00', url: '/docs/fotos.jpg' },
            { id: '4', nombre: 'Informe de visita', tipo: 'pdf', fecha_subida: '2023-04-20T10:20:00', url: '/docs/informe.pdf' }
          ],
          etapa_actual: 'despacho_superior',
          aprobada_representante: true,
          aprobada_trabajo_social: true,
          aprobada_despacho: false
        };
        
        setSolicitud(solicitudData);
        setMaterialesEditados(solicitudData.materiales);
      } catch (error) {
        console.error('Error al cargar la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitud();
  }, [id]);

  const handleAprobar = async () => {
    if (!solicitud) return;
    
    try {
      // Mostrar toast de carga
      const toastId = toast.loading('Procesando aprobación...');
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar estado local
      setSolicitud({
        ...solicitud,
        estado: 'aprobado_despacho',
        estado_display: 'Aprobado por Despacho Superior',
        aprobada_despacho: true
      });
      
      // Actualizar toast a éxito
      toast.success('Solicitud aprobada exitosamente', { id: toastId });
      
      // Navegar de vuelta a la lista después de un breve retraso
      setTimeout(() => {
        navigate('/despacho-superior');
      }, 1500);
    } catch (error) {
      console.error('Error al aprobar la solicitud:', error);
      toast.error('Error al aprobar la solicitud. Intente nuevamente.');
    }
  };

  const handleRechazar = async () => {
    if (!solicitud || !motivoRechazo.trim()) return;
    
    try {
      // Mostrar toast de carga
      const toastId = toast.loading('Procesando rechazo...');
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar estado local
      setSolicitud({
        ...solicitud,
        estado: 'rechazado_despacho',
        estado_display: 'Rechazado por Despacho Superior',
        comentarios: [
          ...solicitud.comentarios,
          { 
            id: solicitud.comentarios.length + 1, 
            texto: `RECHAZO: ${motivoRechazo}`, 
            usuario: 'Laura Díaz', 
            fecha: new Date().toISOString(),
            departamento: 'Despacho Superior'
          }
        ]
      });
      
      // Cerrar modal y limpiar motivo
      setMostrarModalRechazo(false);
      setMotivoRechazo('');
      
      // Actualizar toast a éxito
      toast.success('Solicitud rechazada exitosamente', { id: toastId });
      
      // Navegar de vuelta a la lista después de un breve retraso
      setTimeout(() => {
        navigate('/despacho-superior');
      }, 1500);
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
      toast.error('Error al rechazar la solicitud. Intente nuevamente.');
    }
  };

  const handleEnviarComentario = () => {
    if (!solicitud || !comentario.trim()) return;
    
    try {
      // Actualizar estado local
      setSolicitud({
        ...solicitud,
        comentarios: [
          ...solicitud.comentarios,
          { 
            id: solicitud.comentarios.length + 1, 
            texto: comentario, 
            usuario: 'Laura Díaz', 
            fecha: new Date().toISOString(),
            departamento: 'Despacho Superior'
          }
        ]
      });
      
      // Mostrar mensaje de éxito
      toast.success('Comentario añadido correctamente');
      
      // Limpiar el campo de comentario
      setComentario('');
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      toast.error('Error al añadir el comentario. Intente nuevamente.');
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!solicitud) return;
    
    try {
      const telefono = solicitud.ciudadano.telefono.replace(/[-\s]/g, '');
      const mensaje = `Hola ${solicitud.ciudadano.nombre}, su solicitud #${solicitud.id} "${solicitud.titulo}" ha sido procesada por Despacho Superior.`;
      
      window.open(`https://wa.me/507${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
      toast.success('WhatsApp abierto con mensaje predefinido');
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      toast.error('Error al abrir WhatsApp. Intente nuevamente.');
    }
  };

  const handleEnviarEmail = () => {
    if (!solicitud || !solicitud.ciudadano.correo_electronico) {
      toast.error('No hay correo electrónico disponible para este ciudadano');
      return;
    }
    
    try {
      const asunto = `Solicitud #${solicitud.id} - ${solicitud.titulo}`;
      const cuerpo = `Estimado/a ${solicitud.ciudadano.nombre} ${solicitud.ciudadano.apellido},\n\nSu solicitud "${solicitud.titulo}" ha sido procesada por Despacho Superior.\n\nAtentamente,\nJunta Comunal`;
      
      window.open(`mailto:${solicitud.ciudadano.correo_electronico}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`, '_blank');
      toast.success('Cliente de correo abierto con mensaje predefinido');
    } catch (error) {
      console.error('Error al abrir cliente de correo:', error);
      toast.error('Error al abrir cliente de correo. Intente nuevamente.');
    }
  };

  const handleImprimir = () => {
    try {
      window.print();
      toast.success('Documento enviado a impresión');
    } catch (error) {
      console.error('Error al imprimir:', error);
      toast.error('Error al imprimir. Intente nuevamente.');
    }
  };

  const getPrioridadColor = (prioridad: string): string => {
    switch(prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string): string => {
    if (estado.includes('aprobado')) return 'bg-green-100 text-green-800';
    if (estado.includes('rechazado')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Función para descargar todos los documentos
  const handleDownloadAllDocuments = () => {
    if (!solicitud?.documentos || solicitud.documentos.length === 0) {
      toast.error('No hay documentos disponibles para descargar');
      return;
    }

    // Mostrar mensaje de preparación
    toast('Preparando descarga de documentos...');
    
    // Pequeño retraso para evitar bloqueo de navegador con múltiples descargas
    setTimeout(() => {
      solicitud.documentos.forEach((doc, index) => {
        // Descargar cada documento con un pequeño retraso entre ellos
        setTimeout(() => {
          try {
            const link = document.createElement('a');
            link.href = doc.url;
            const fileName = doc.name || doc.nombre || `documento_${new Date().getTime()}`;
            // Asegurar que el archivo tenga la extensión correcta
            const fileExtension = doc.url.split('.').pop()?.toLowerCase() || 'jpg';
            const finalFileName = fileName.endsWith(`.${fileExtension}`) ? fileName : `${fileName}.${fileExtension}`;
            link.setAttribute('download', finalFileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Descargando: ${finalFileName}`);
          } catch (error) {
            console.error('Error al descargar:', error);
            toast.error('Error al descargar el documento');
          }
        }, index * 300);
      });
    }, 500);
  };

  // Función para activar la selección de fotos
  const activarSelectorFotos = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejar la selección de fotos
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

  // Eliminar una foto
  const eliminarFoto = (index: number) => {
    // Liberar URL de objeto para evitar fugas de memoria
    URL.revokeObjectURL(fotosPreview[index]);
    
    // Actualizar estados
    setFotos(fotos.filter((_, i) => i !== index));
    setFotosPreview(fotosPreview.filter((_, i) => i !== index));
  };

  // Registrar la entrega
  const handleRegistrarEntrega = async () => {
    if (!solicitud) {
      toast.error('No hay información de la solicitud');
      return;
    }
    
    if (fotos.length === 0) {
      toast.error('Por favor, agregue al menos una foto de la entrega');
      return;
    }
    
    setLoadingEntrega(true);
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
      const nuevosDocumentos = fotosBase64.map((base64, index) => ({
        id: `entrega_${Date.now()}_${index}`,
        nombre: `Foto de entrega ${index + 1}`,
        tipo: 'imagen',
        fecha_subida: fechaEntrega,
        url: base64
      }));
      
      // Actualizar la solicitud
      const solicitudActualizada = {
        ...solicitud,
        estado: 'entregado',
        estado_display: 'Entregado',
        fecha_entrega: fechaEntrega,
        documentos: [...solicitud.documentos, ...nuevosDocumentos],
        comentarios: [
          ...solicitud.comentarios,
          {
            id: Date.now(),
            texto: `ENTREGA: ${comentarioEntrega || 'Materiales entregados al beneficiario.'}`,
            usuario: 'Administrador',
            fecha: fechaEntrega,
            departamento: 'Despacho Superior'
          }
        ]
      };
      
      // Simular guardado (en un sistema real, aquí se haría una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar estado local
      setSolicitud(solicitudActualizada);
      
      // Limpiar el formulario
      setFotos([]);
      setFotosPreview([]);
      setComentarioEntrega('');
      setMostrarModalEntrega(false);
      
      // Actualizar toast a éxito
      toast.success('Entrega registrada exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error al registrar entrega:', error);
      toast.error('Error al registrar la entrega. Intente nuevamente.', { id: toastId });
    } finally {
      setLoadingEntrega(false);
    }
  };

  // Limpiar URLs de objetos al desmontar
  useEffect(() => {
    return () => {
      fotosPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto text-yellow-500 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitud no encontrada</h2>
            <p className="text-gray-600 mb-6">No pudimos encontrar la solicitud que estás buscando.</p>
            <button
              onClick={() => navigate('/despacho-superior')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si la solicitud está aprobada por Despacho Superior y lista para entrega
  const puedeEntregarse = solicitud.estado === 'aprobado_despacho' || 
                           solicitud.aprobada_despacho || 
                           solicitud.estado.includes('aprobado');
  const yaEntregada = solicitud.estado === 'entregado' || solicitud.estado.includes('entregado');

  return (
    <div className="bg-gray-50 rounded-lg shadow transition-all duration-300">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-t-lg border-b">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/despacho-superior')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Volver a la lista</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <FaHistory className="mr-2" />
              {mostrarHistorial ? 'Ocultar historial' : 'Ver historial'}
            </button>
            
            <button
              onClick={handleEnviarWhatsApp}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FaWhatsapp className="mr-2" />
              WhatsApp
            </button>
            
            <button
              onClick={handleEnviarEmail}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={!solicitud?.ciudadano.correo_electronico}
            >
              <FaEnvelope className="mr-2" />
              Email
            </button>
            
            <button
              onClick={handleImprimir}
              className="flex items-center px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              <FaPrint className="mr-2" />
              Imprimir
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{solicitud.titulo}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                {solicitud.estado_display}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(solicitud.prioridad)}`}>
                Prioridad {solicitud.prioridad.charAt(0).toUpperCase() + solicitud.prioridad.slice(1)}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{solicitud.descripcion}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Creada: {new Date(solicitud.fecha_creacion).toLocaleDateString('es-ES', { 
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}</span>
              <span className="mx-2">•</span>
              <span>Última actualización: {new Date(solicitud.fecha_actualizacion).toLocaleDateString('es-ES', { 
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
            {solicitud.aprobada_representante && (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <FaUserCheck className="mr-1" />
                Aprobado por Representante
              </span>
            )}
            {solicitud.aprobada_trabajo_social && (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <FaUserCheck className="mr-1" />
                Aprobado por Trabajo Social
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenido principal en un grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Columna 1: Información del Ciudadano */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Ciudadano</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nombre completo</p>
              <p className="font-medium">{solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cédula</p>
              <p className="font-medium">{solicitud.ciudadano.cedula}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teléfono</p>
              <p className="font-medium">{solicitud.ciudadano.telefono}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dirección</p>
              <p className="font-medium">{solicitud.ciudadano.direccion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de nacimiento</p>
              <p className="font-medium">{new Date(solicitud.ciudadano.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
            </div>
            {solicitud.ciudadano.correo_electronico && (
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-medium">{solicitud.ciudadano.correo_electronico}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Columna 2: Materiales Solicitados */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Materiales Solicitados</h2>
          {solicitud.materiales.length === 0 ? (
            <p className="text-gray-500 italic">No hay materiales solicitados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitud.materiales.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{material.nombre}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{material.cantidad} {material.unidad}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {material.aprobado ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Aprobado
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Columna 3: Documentos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Documentos</h3>
            {solicitud?.documentos && solicitud.documentos.length > 0 && (
              <button
                onClick={handleDownloadAllDocuments}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                title="Descargar todos los documentos"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar todos
              </button>
            )}
          </div>
          
          {solicitud?.documentos && solicitud.documentos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de subida
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitud.documentos.map((doc, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.name || doc.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.type || doc.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.uploadDate || doc.fecha_subida).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end">
                        <button
                          onClick={() => {
                            window.open(doc.url, '_blank');
                            toast.success('Documento abierto en nueva pestaña');
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Ver documento"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            try {
                              const link = document.createElement('a');
                              link.href = doc.url;
                              const fileName = doc.name || doc.nombre || `documento_${new Date().getTime()}`;
                              // Asegurar que el archivo tenga la extensión correcta
                              const fileExtension = doc.url.split('.').pop()?.toLowerCase() || 'jpg';
                              const finalFileName = fileName.endsWith(`.${fileExtension}`) ? fileName : `${fileName}.${fileExtension}`;
                              link.setAttribute('download', finalFileName);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast.success(`Descargando: ${finalFileName}`);
                            } catch (error) {
                              console.error('Error al descargar:', error);
                              toast.error('Error al descargar el documento');
                            }
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Descargar documento"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
              No hay documentos adjuntos a esta solicitud.
            </div>
          )}
        </div>
      </div>
      
      {/* Historial de la solicitud y comentarios en formato horizontal */}
      <div className="mx-6 mb-6 mt-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Historial de la solicitud */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaHistory className="mr-2 text-blue-500" />
              Historial de la Solicitud
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              <ul className="space-y-6">
                {historialSolicitud.map((item, index) => (
                  <li key={index} className="relative pl-10">
                    <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center z-10">
                      {item.accion.includes('creada') ? (
                        <FaClipboardCheck className="text-blue-600" />
                      ) : item.accion.includes('Aprobada') ? (
                        <FaCheck className="text-green-600" />
                      ) : item.accion.includes('Rechazada') ? (
                        <FaTimes className="text-red-600" />
                      ) : (
                        <FaClipboardCheck className="text-blue-600" />
                      )}
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
          
          {/* Sección de comentarios */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
            <h2 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
              <FaCommentAlt className="mr-2 text-blue-500" />
              Comentarios
            </h2>
            
            <div className="space-y-4 mb-6">
              {solicitud.comentarios.map((com) => (
                <div key={com.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{com.usuario} • {com.departamento}</h3>
                      <p className="text-xs text-gray-500">{new Date(com.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}</p>
                    </div>
                    {com.texto.startsWith('RECHAZO:') && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Rechazo
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{com.texto}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Agregar un comentario..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleEnviarComentario}
                  disabled={!comentario.trim()}
                  className={`px-4 py-2 rounded-md ${
                    comentario.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Enviar comentario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botones de acción en la parte superior */}
      <div className="flex flex-wrap gap-2 justify-end md:justify-end mb-2 mt-4 px-6">
        {/* Botón de aprobar */}
        {!solicitud.aprobada_despacho && (
          <button
            onClick={handleAprobar}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <FaUserCheck className="mr-2" />
            Aprobar solicitud
          </button>
        )}
        
        {/* Botón de rechazar */}
        {!solicitud.aprobada_despacho && (
          <button
            onClick={() => setMostrarModalRechazo(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <FaUserTimes className="mr-2" />
            Rechazar solicitud
          </button>
        )}
        
        {/* Botón de registrar entrega - Solo visible si la solicitud está aprobada */}
        {puedeEntregarse && !yaEntregada && (
          <button
            onClick={() => setMostrarModalEntrega(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaBoxOpen className="mr-2" />
            Registrar entrega
          </button>
        )}
        
        {/* Botón de WhatsApp */}
        <button
          onClick={handleEnviarWhatsApp}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
        >
          <FaWhatsapp className="mr-2" />
          WhatsApp
        </button>
        
        {/* Botón de Email */}
        <button
          onClick={handleEnviarEmail}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <FaEnvelope className="mr-2" />
          Email
        </button>
        
        {/* Botón de Imprimir */}
        <button
          onClick={handleImprimir}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center"
        >
          <FaPrint className="mr-2" />
          Imprimir
        </button>
      </div>

      {/* Modal de rechazo */}
      {mostrarModalRechazo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rechazar solicitud</h2>
            <p className="text-gray-600 mb-4">Por favor, indique el motivo del rechazo de esta solicitud:</p>
            
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="Motivo del rechazo..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            ></textarea>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setMostrarModalRechazo(false);
                  setMotivoRechazo('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={!motivoRechazo.trim()}
                className={`px-4 py-2 rounded-md ${
                  motivoRechazo.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro de entrega */}
      {mostrarModalEntrega && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar entrega de materiales</h2>
              <button 
                onClick={() => setMostrarModalEntrega(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Detalles de la solicitud</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-sm mb-1">
                  <span className="font-medium">ID:</span> {solicitud.id}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Solicitante:</span> {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Cédula:</span> {solicitud.ciudadano.cedula}
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
                        <FaTimesCircle />
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Agregue comentarios sobre la entrega, condiciones, observaciones, etc."
                value={comentarioEntrega}
                onChange={(e) => setComentarioEntrega(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMostrarModalEntrega(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarEntrega}
                disabled={loadingEntrega || fotos.length === 0}
                className={`px-4 py-2 rounded-md flex items-center ${
                  loadingEntrega || fotos.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loadingEntrega ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Registrar entrega
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleDespachoSuperior; 