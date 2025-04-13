import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { Solicitud, Comentario, Material } from '../types/solicitud'
import SolicitudesService from '../services/SolicitudesService'

const DetalleRepresentante = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { addToast } = useToast()
  
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Cargar la solicitud desde el servicio
  useEffect(() => {
    if (!id) return
    
    try {
      // Obtener la solicitud por ID
      const solicitudId = parseInt(id)
      const solicitudEncontrada = SolicitudesService.getSolicitudById(solicitudId)
      
      if (solicitudEncontrada) {
        setSolicitud(solicitudEncontrada)
      } else {
        setError('No se encontró la solicitud')
        addToast('No se pudo encontrar la solicitud solicitada', 'error')
      }
    } catch (err) {
      console.error('Error al cargar la solicitud:', err)
      setError('Error al cargar los datos de la solicitud')
      addToast('Error al cargar los datos de la solicitud', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, addToast])
  
  const [comentarios, setComentarios] = useState<Comentario[]>([
    {
      id: 1,
      autor: 'María González - Asistente',
      fecha: '2023-04-13T10:30:00Z',
      contenido: 'He visitado la dirección y verificado que la solicitud es legítima. El techo está en muy mal estado.',
      tipo: 'comentario'
    },
    {
      id: 2,
      autor: 'Roberto Díaz - Almacén',
      fecha: '2023-04-14T14:15:00Z',
      contenido: 'He revisado el inventario y contamos con los materiales solicitados. Se puede proceder con la aprobación.',
      tipo: 'comentario'
    }
  ])
  
  const [comentarioNuevo, setComentarioNuevo] = useState('')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [showRechazoModal, setShowRechazoModal] = useState(false)
  const [showEditMaterialesModal, setShowEditMaterialesModal] = useState(false)
  const [materialesEdit, setMaterialesEdit] = useState<Material[]>([])
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null)
  const [verificandoResidencia, setVerificandoResidencia] = useState(false)
  const [resultadoVerificacion, setResultadoVerificacion] = useState<{
    verificado: boolean;
    mensaje: string;
    detalles?: string;
  } | null>(null)
  
  // Estados para el chat con IA
  const [showIAModal, setShowIAModal] = useState(false)
  const [preguntaIA, setPreguntaIA] = useState('')
  const [respuestaIA, setRespuestaIA] = useState('')
  const [cargandoIA, setCargandoIA] = useState(false)
  const [historialChat, setHistorialChat] = useState<{pregunta: string, respuesta: string}[]>([])
  const [consultandoIA, setConsultandoIA] = useState(false)
  const [resultadoConsultaIA, setResultadoConsultaIA] = useState<string | null>(null)

  // Estados para la verificación de identidad con cámara
  const [showCamaraModal, setShowCamaraModal] = useState(false)
  const [capturandoFoto, setCapturandoFoto] = useState(false)
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null)
  const [resultadoIdentidad, setResultadoIdentidad] = useState<{
    verificado: boolean;
    confianza: number;
    mensaje: string;
  } | null>(null)

  // Inicializar materiales cuando se carga la solicitud
  useEffect(() => {
    if (solicitud && solicitud.materiales_solicitados) {
      setMaterialesEdit([...solicitud.materiales_solicitados])
    }
  }, [solicitud])

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
  
  const handleAddComentario = () => {
    if (!comentarioNuevo.trim()) return
    
    // En un caso real, aquí haríamos una llamada a la API
    alert('Comentario agregado')
    setComentarioNuevo('')
  }
  
  const handleAprobar = () => {
    if (!solicitud || !id) return
    
    // Mostrar toast de carga
    addToast('Procesando aprobación...', 'loading')
    
    // Actualizar directamente el estado de la solicitud a "en proceso por trabajo social"
    const solicitudActualizada = {
      ...solicitud,
      aprobada: true,
      en_espera: false,
      estado: 'en_proceso_trabajo_social',
      estado_display: 'En proceso por Trabajo Social',
      fecha_actualizacion: new Date().toISOString(),
      departamento_actual: 'trabajo_social'
    }
    
    // Guardar en el servicio
    const resultado = SolicitudesService.updateSolicitud(parseInt(id), solicitudActualizada);
    
    if (resultado) {
      // Añadir comentario de aprobación y envío
      const nuevoComentario: Comentario = {
        id: Date.now(),
        autor: 'Representante',
        fecha: new Date().toISOString(),
        contenido: 'Solicitud aprobada y enviada directamente a Trabajo Social para su procesamiento.',
        tipo: 'aprobacion'
      };
      
      setComentarios([...comentarios, nuevoComentario]);
      
      addToast('Solicitud aprobada y enviada directamente a Trabajo Social', 'success');
      
      // Pequeña demora antes de redirigir
      setTimeout(() => {
        navigate('/representante');
      }, 1500);
    } else {
      addToast('Error al aprobar la solicitud', 'error');
    }
  }
  
  const handleRechazar = () => {
    if (!solicitud || !id || !motivoRechazo) return
    
    // Actualizar el estado de la solicitud
    const solicitudActualizada = {
      ...solicitud,
      aprobada: false,
      en_espera: false,
      estado: 'rechazado',
      estado_display: 'Rechazado'
    }
    
    // Guardar en el servicio
    const resultado = SolicitudesService.updateSolicitud(parseInt(id), solicitudActualizada);
    
    if (resultado) {
      // Agregar el comentario de rechazo
      const nuevoComentario: Comentario = {
        id: Date.now(),
        autor: 'Representante',
        fecha: new Date().toISOString(),
        contenido: motivoRechazo,
        tipo: 'rechazo' as 'rechazo'
      };
      
      setComentarios([...comentarios, nuevoComentario]);
      setShowRechazoModal(false);
      setMotivoRechazo('');
      
      addToast('Solicitud rechazada', 'info');
      navigate('/representante');
    } else {
      addToast('Error al rechazar la solicitud', 'error');
    }
  }

  const handleEditMateriales = () => {
    setShowEditMaterialesModal(true)
  }

  const handleSaveMateriales = () => {
    // En un caso real, aquí haríamos una llamada a la API para guardar los cambios
    alert('Materiales actualizados correctamente')
    setShowEditMaterialesModal(false)
  }

  const handleVerificarResidencia = () => {
    // Simular proceso de verificación con IA
    setVerificandoResidencia(true)
    
    // Simulación de llamada a un servicio de IA
    setTimeout(() => {
      // Simulación 80% de probabilidad de éxito
      const exitoso = Math.random() < 0.8
      
      if (exitoso) {
        setResultadoVerificacion({
          verificado: true,
          mensaje: "✅ Residencia verificada correctamente",
          detalles: "La dirección del ciudadano coincide con el patrón electoral. El ciudadano está registrado en la circunscripción 8-7 correspondiente a Barrio San Miguel, El Porvenir."
        })
      } else {
        setResultadoVerificacion({
          verificado: false,
          mensaje: "❌ No se pudo verificar la residencia",
          detalles: "La dirección proporcionada no coincide con los registros del patrón electoral. Se recomienda verificar manualmente la información."
        })
      }
      
      setVerificandoResidencia(false)
      
      // Agregar un comentario automático sobre la verificación
      // En una implementación real, esto se haría mediante una llamada a la API
    }, 3000)
  }

  const handleAbrirCamara = async () => {
    setShowCamaraModal(true);
    setFotoCapturada(null);
    setResultadoIdentidad(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifique los permisos.');
    }
  };
  
  const handleCapturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCapturandoFoto(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Configurar el tamaño del canvas para que coincida con el video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar el fotograma actual del video en el canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir el contenido del canvas a una URL de datos (base64)
      const foto = canvas.toDataURL('image/jpeg');
      setFotoCapturada(foto);
      
      // Simular verificación con IA
      setTimeout(() => {
        // Simulación: 85% de probabilidad de éxito
        const exitoso = Math.random() < 0.85;
        const confianza = exitoso ? 85 + Math.random() * 10 : 60 + Math.random() * 15;
        
        setResultadoIdentidad({
          verificado: exitoso,
          confianza: parseFloat(confianza.toFixed(1)),
          mensaje: exitoso 
            ? "✅ Identidad verificada correctamente" 
            : "❌ No se pudo verificar la identidad con suficiente confianza"
        });
        
        // Agregar comentario automático sobre la verificación
        const nuevoComentario: Comentario = {
          id: Date.now(),
          autor: 'Sistema',
          fecha: new Date().toISOString(),
          contenido: exitoso 
            ? `Verificación de identidad realizada con éxito. Confianza: ${confianza.toFixed(1)}%` 
            : `Verificación de identidad fallida. Confianza insuficiente: ${confianza.toFixed(1)}%`,
          tipo: 'comentario'
        };
        
        setComentarios([...comentarios, nuevoComentario]);
        
        // Mostrar notificación
        addToast(exitoso 
          ? `Identidad verificada con ${confianza.toFixed(1)}% de confianza` 
          : `No se pudo verificar la identidad con suficiente confianza (${confianza.toFixed(1)}%)`, 
          exitoso ? 'success' : 'warning');
        
        setCapturandoFoto(false);
        
        // Detener la transmisión de video cuando se ha completado la captura
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          video.srcObject = null;
        }
      }, 2500);
    }
  };
  
  const handleCerrarCamara = () => {
    if (videoRef.current) {
      // Detener la transmisión de video
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setShowCamaraModal(false);
  };

  const handleAbrirIAModal = () => {
    setShowIAModal(true);
    setRespuestaIA('');
    
    // Analizar automáticamente la solicitud al abrir el modal
    consultarIA();
  };
  
  const consultarIA = async () => {
    setConsultandoIA(true)
    
    try {
      // Preparar contexto específico sobre documentos y solicitudes
      const contextoDocumentos = `
        Análisis de la solicitud:
        - ID: ${solicitud?.id}
        - Título: ${solicitud?.titulo}
        - Descripción: ${solicitud?.descripcion}
        - Estado: ${solicitud?.estado_display}
        - Categoría: ${solicitud?.categoria || 'No especificada'}
        - Dirección del ciudadano: ${solicitud?.ciudadano?.direccion}
        - Documentos: ${solicitud?.documentos ? 'Adjuntos' : 'No disponibles'}
        - Materiales solicitados: ${solicitud?.materiales_solicitados?.map(m => `${m.cantidad} ${m.unidad} de ${m.nombre}`).join(', ') || 'Ninguno'}
      `;
      
      // En una implementación real, esta sería una llamada a un servicio de IA
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      const resultadoIA = `
Análisis de solicitud #${solicitud?.id}:

Basado en la documentación y detalles proporcionados, esta solicitud de ${solicitud?.titulo} cumple con los requisitos para ser procesada por Trabajo Social. 

${solicitud?.ciudadano?.nombre} ${solicitud?.ciudadano?.apellido} (cédula ${solicitud?.ciudadano?.cedula}) reside en ${solicitud?.ciudadano?.direccion}, que pertenece a la circunscripción correspondiente a esta Junta Comunal.

Los materiales solicitados (${solicitud?.materiales_solicitados?.map(m => `${m.cantidad} ${m.unidad} de ${m.nombre}`).join(', ')}) están dentro de las cantidades razonables para el tipo de asistencia solicitada.

Recomendación: Aprobar y enviar a Trabajo Social para verificación domiciliaria.
      `;
      
      setResultadoConsultaIA(resultadoIA)
      addToast('Análisis de IA completado', 'success')
      
      // Agregar el resultado como comentario en la solicitud
      const comentarioIA: Comentario = {
        id: Date.now(),
        autor: 'Asistente IA',
        fecha: new Date().toISOString(),
        contenido: resultadoIA,
        tipo: 'comentario'
      };
      
      setComentarios([...comentarios, comentarioIA]);
      
    } catch (error) {
      console.error('Error al consultar IA:', error)
      addToast('Error al realizar la consulta a la IA', 'error')
    } finally {
      setConsultandoIA(false)
    }
  }

  const agregarComentario = () => {
    if (!comentarioNuevo.trim()) {
      addToast('El comentario no puede estar vacío', 'warning')
      return
    }

    const comentario: Comentario = {
      id: comentarios.length + 1,
      autor: 'Representante',
      fecha: new Date().toISOString(),
      contenido: comentarioNuevo,
      tipo: 'comentario'
    }

    setComentarios([...comentarios, comentario])
    setComentarioNuevo('')
    addToast('Comentario agregado correctamente', 'success')
  }
  
  const verificarResidencia = async () => {
    setVerificandoResidencia(true)
    
    try {
      // Simulamos una llamada a la API que verifica la residencia
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const verificado = Math.random() > 0.3 // 70% de probabilidad de éxito
      
      if (verificado) {
        setResultadoVerificacion({
          verificado: true,
          mensaje: "✅ Residencia verificada correctamente",
          detalles: "La dirección del ciudadano coincide con el patrón electoral. El ciudadano está registrado en la circunscripción 8-7 correspondiente a Barrio San Miguel, El Porvenir."
        })
        addToast('Residencia verificada con éxito', 'success')
      } else {
        setResultadoVerificacion({
          verificado: false,
          mensaje: "❌ No se pudo verificar la residencia",
          detalles: "La dirección proporcionada no coincide con los registros del patrón electoral. Se recomienda verificar manualmente la información."
        })
        addToast('No se pudo verificar la residencia', 'error')
      }
    } catch (error) {
      console.error('Error al verificar residencia:', error)
      addToast('Error al verificar la residencia', 'error')
    } finally {
      setVerificandoResidencia(false)
    }
  }

  // Renderizar materiales
  const renderMateriales = () => {
    if (!solicitud || !solicitud.materiales_solicitados || solicitud.materiales_solicitados.length === 0) {
      return <p className="text-gray-500 italic">No hay materiales solicitados</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solicitud.materiales_solicitados.map((material, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{material.nombre}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.cantidad}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.unidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar la solicitud</h2>
          <p className="text-gray-600 mb-4">{error || 'No se encontró la solicitud solicitada'}</p>
          <button
            onClick={() => navigate('/representante')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver al panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          className="text-blue-500 hover:text-blue-700 flex items-center"
          onClick={() => navigate('/representante')}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al panel
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{solicitud.titulo}</h1>
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            {solicitud.estado_display}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Información de la Solicitud</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Fecha de creación:</span> {formatDate(solicitud.fecha_creacion)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">ID:</span> {solicitud.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Estado:</span> {solicitud.estado_display}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2 flex justify-between items-center">
              <span>Información del Solicitante</span>
              <div className="flex space-x-2">
                <button
                  onClick={handleAbrirIAModal}
                  className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Consultar IA
                </button>
              </div>
            </h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Nombre:</span> {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Cédula:</span> {solicitud.ciudadano.cedula}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Teléfono:</span> {solicitud.ciudadano.telefono}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Correo:</span> {solicitud.ciudadano.correo}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Dirección:</span> {solicitud.ciudadano.direccion}
                </p>
                <button
                  onClick={handleVerificarResidencia}
                  disabled={verificandoResidencia}
                  className={`ml-2 px-3 py-1 text-xs rounded flex items-center ${
                    verificandoResidencia 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {verificandoResidencia ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verificar residencia
                    </>
                  )}
                </button>
              </div>
              
              {resultadoVerificacion && (
                <div className={`mt-3 p-2 text-sm rounded border ${
                  resultadoVerificacion.verificado 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <p className="font-medium">{resultadoVerificacion.mensaje}</p>
                  {resultadoVerificacion.detalles && (
                    <p className="mt-1 text-xs">{resultadoVerificacion.detalles}</p>
                  )}
                </div>
              )}
              
              {resultadoIdentidad && (
                <div className={`mt-3 p-2 text-sm rounded border ${
                  resultadoIdentidad.verificado 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <p className="font-medium">{resultadoIdentidad.mensaje}</p>
                  <p className="mt-1 text-xs">Confianza: {resultadoIdentidad.confianza}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Descripción de la Solicitud</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">{solicitud.descripcion}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Materiales Solicitados</h2>
            <button
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center"
              onClick={handleEditMateriales}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar materiales
            </button>
          </div>
          {renderMateriales()}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Comentarios</h2>
          <div className="bg-blue-50 p-4 rounded">
            {comentarios.length > 0 ? (
              <div className="space-y-4">
                {comentarios.map(comentario => (
                  <div key={comentario.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700">{comentario.contenido}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span className="font-medium text-blue-600">{comentario.autor}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(comentario.fecha)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay comentarios</p>
            )}
            
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Añadir comentario</h3>
              <textarea
                value={comentarioNuevo}
                onChange={(e) => setComentarioNuevo(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={3}
                placeholder="Escriba su comentario aquí..."
              />
              <button
                onClick={agregarComentario}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Agregar Comentario
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => setShowRechazoModal(true)}
            >
              Rechazar Solicitud
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleAprobar}
            >
              Aprobar y Enviar a Trabajo Social
            </button>
          </div>
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRechazoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Razón del Rechazo</h3>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows={4}
              placeholder="Explique por qué está rechazando esta solicitud..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowRechazoModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleRechazar}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de materiales */}
      {showEditMaterialesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Editar Materiales Solicitados</h3>
              <button 
                onClick={() => setShowEditMaterialesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materialesEdit.map((material, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        <input 
                          type="text" 
                          className="border rounded px-2 py-1 w-full"
                          value={material.nombre}
                          onChange={(e) => {
                            const newMateriales = [...materialesEdit];
                            newMateriales[index].nombre = e.target.value;
                            setMaterialesEdit(newMateriales);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="number" 
                          className="border rounded px-2 py-1 w-24"
                          value={material.cantidad}
                          onChange={(e) => {
                            const newMateriales = [...materialesEdit];
                            newMateriales[index].cantidad = Number(e.target.value);
                            setMaterialesEdit(newMateriales);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          type="text" 
                          className="border rounded px-2 py-1 w-24"
                          value={material.unidad}
                          onChange={(e) => {
                            const newMateriales = [...materialesEdit];
                            newMateriales[index].unidad = e.target.value;
                            setMaterialesEdit(newMateriales);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            const newMateriales = materialesEdit.filter((_, i) => i !== index);
                            setMaterialesEdit(newMateriales);
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mb-4">
              <button 
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                onClick={() => {
                  setMaterialesEdit([...materialesEdit, { nombre: '', cantidad: 0, unidad: '' }]);
                }}
              >
                Añadir Material
              </button>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowEditMaterialesModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSaveMateriales}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para consultar IA */}
      {showIAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full h-3/4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Asistente IA - Análisis de Solicitud
                </span>
              </h3>
              <button 
                onClick={() => setShowIAModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded mb-4">
              <h4 className="font-semibold text-indigo-800 mb-2">Información de la Solicitud</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">ID:</span> {solicitud.id}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Título:</span> {solicitud.titulo}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Estado:</span> {solicitud.estado_display}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Fecha:</span> {formatDate(solicitud.fecha_creacion)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Ciudadano:</span> {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Cédula:</span> {solicitud.ciudadano.cedula}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Dirección:</span> {solicitud.ciudadano.direccion}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-indigo-700">Teléfono:</span> {solicitud.ciudadano.telefono}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto mb-4 border border-gray-200 rounded p-4 bg-white">
              {consultandoIA ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-indigo-700 font-medium">Analizando la solicitud...</p>
                  <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
                </div>
              ) : resultadoConsultaIA ? (
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Análisis de la IA</h4>
                  <div className="whitespace-pre-line text-gray-700">
                    {resultadoConsultaIA}
                  </div>
                  <div className="mt-4 border-t pt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Recomendaciones:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      <li>Verificar que los documentos coincidan con el solicitante</li>
                      <li>Revisar la dirección para confirmar que pertenece a la jurisdicción</li>
                      <li>Consultar el historial de solicitudes previas del ciudadano</li>
                      <li>Aprobar y pasar directamente a Trabajo Social para verificación</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Clic en "Consultar IA" para analizar esta solicitud</p>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 flex justify-between">
              <p className="text-xs text-gray-500 italic">
                Este asistente utiliza IA para analizar la solicitud y proporcionar recomendaciones.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleAprobar}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                  disabled={consultandoIA}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aprobar y Enviar
                </button>
                <button
                  onClick={() => setShowIAModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para verificación con cámara */}
      {showCamaraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Verificación de Identidad
                </span>
              </h3>
              <button 
                onClick={handleCerrarCamara}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
              <h4 className="font-medium text-gray-800 mb-2">Instrucciones:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                <li>Coloque el rostro del ciudadano frente a la cámara</li>
                <li>Asegúrese de que haya buena iluminación</li>
                <li>Verifique que el rostro sea claramente visible</li>
                <li>Haga clic en "Capturar foto" cuando esté listo</li>
              </ol>
            </div>
            
            <div className="mb-4 relative">
              {!fotoCapturada ? (
                <div className="aspect-video bg-black rounded overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  ></video>
                </div>
              ) : (
                <div className="aspect-video bg-black rounded overflow-hidden">
                  <img src={fotoCapturada} alt="Foto capturada" className="w-full h-full object-cover" />
                </div>
              )}
              
              {/* Canvas oculto para procesar la imagen */}
              <canvas ref={canvasRef} className="hidden"></canvas>
              
              {capturandoFoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-center">
                    <svg className="animate-spin mx-auto h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2">Analizando imagen...</p>
                  </div>
                </div>
              )}
            </div>
            
            {resultadoIdentidad && (
              <div className={`mb-4 p-3 rounded border ${
                resultadoIdentidad.verificado 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="font-medium">{resultadoIdentidad.mensaje}</p>
                <p className="mt-1 text-sm">Confianza: {resultadoIdentidad.confianza}%</p>
                {resultadoIdentidad.verificado ? (
                  <p className="mt-2 text-sm">
                    Se ha confirmado que la persona en la imagen coincide con la identidad de {solicitud.ciudadano.nombre} {solicitud.ciudadano.apellido}, titular de la cédula {solicitud.ciudadano.cedula}.
                  </p>
                ) : (
                  <p className="mt-2 text-sm">
                    No se ha podido confirmar que la persona en la imagen coincida con la identidad registrada. Se recomienda intentar nuevamente con mejor iluminación o verificar manualmente.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={handleCerrarCamara}
              >
                Cerrar
              </button>
              {!fotoCapturada ? (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  onClick={handleCapturarFoto}
                  disabled={capturandoFoto}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capturar Foto
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleAbrirCamara}
                  disabled={capturandoFoto}
                >
                  Tomar otra foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetalleRepresentante 