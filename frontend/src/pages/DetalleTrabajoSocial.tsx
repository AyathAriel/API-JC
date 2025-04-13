import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaFileAlt, 
  FaHome,
  FaUserCheck
} from 'react-icons/fa';
import SolicitudesService from '../services/SolicitudesService';
import { Solicitud as SolicitudBase } from '../types/solicitud';

interface Ciudadano {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento?: string;
  correo_electronico?: string;
}

interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  aprobado: boolean;
}

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  url: string;
  fecha_subida: string;
}

interface Visita {
  id?: number;
  fecha_programada: string;
  hora_programada: string;
  realizada: boolean;
  fecha_realizacion?: string;
  informe?: string;
}

// Extender la interfaz de ciudadano para incluir campos adicionales
interface CiudadanoExtendido extends Ciudadano {
  fecha_nacimiento?: string;
  correo_electronico?: string;
}

// Extender la interfaz base para incluir nuestra lógica específica
interface Solicitud extends Omit<SolicitudBase, 'documentos' | 'ciudadano'> {
  prioridad: 'baja' | 'media' | 'alta';
  fecha_actualizacion: string;
  materiales: Material[];
  documentos: Documento[];
  ciudadano: CiudadanoExtendido;
  visita?: Visita;
}

const DetalleTrabajoSocial: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  
  // Estados para programar visita
  const [mostrarModalVisita, setMostrarModalVisita] = useState<boolean>(false);
  const [fechaVisita, setFechaVisita] = useState<string>('');
  const [horaVisita, setHoraVisita] = useState<string>('');
  
  // Estados para registrar visita realizada
  const [mostrarModalInforme, setMostrarModalInforme] = useState<boolean>(false);
  const [informe, setInforme] = useState<string>('');
  const [visitaAprobada, setVisitaAprobada] = useState<boolean>(true);
  
  // Estado para confirmación y mensajes
  const [mensaje, setMensaje] = useState<{tipo: 'exito' | 'error'; texto: string} | null>(null);
  
  // Adaptadores para convertir entre tipos de solicitud
  const adaptSolicitudToService = (solicitud: Solicitud): any => {
    // Crear una versión compatible con el servicio
    return {
      ...solicitud,
      documentos: solicitud.documentos.map(doc => doc.url), // Convertir a array de strings
      materiales_solicitados: solicitud.materiales,
    };
  };

  const adaptSolicitudFromService = (data: any): Solicitud => {
    // Crear visita si existe en los datos adicionales
    let visita = undefined;
    if (data.visita_programada) {
      visita = {
        id: data.visita_id || Date.now(),
        fecha_programada: data.visita_programada,
        hora_programada: data.visita_hora || '10:00',
        realizada: data.visita_realizada || false,
        fecha_realizacion: data.visita_fecha_realizacion,
        informe: data.visita_informe
      };
    }

    // Convertir documentos de strings a objetos Documento si es necesario
    const documentos = Array.isArray(data.documentos) 
      ? data.documentos.map((doc: any, index: number) => {
          if (typeof doc === 'string') {
            return {
              id: index + 1,
              nombre: `Documento ${index + 1}`,
              tipo: doc.endsWith('.pdf') ? 'pdf' : 'imagen',
              url: doc,
              fecha_subida: data.fecha_creacion
            };
          }
          return doc;
        })
      : [];

    // Convertir materiales solicitados a materiales
    const materiales = data.materiales_solicitados || [];

    return {
      ...data,
      prioridad: data.prioridad || 'media',
      fecha_actualizacion: data.fecha_actualizacion || data.fecha_creacion,
      materiales,
      documentos,
      ciudadano: data.ciudadano || {
        id: 0,
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        direccion: '',
      },
      visita
    } as Solicitud;
  };

  // Cargar la solicitud
  useEffect(() => {
    const cargarSolicitud = async () => {
      setLoading(true);
      
      try {
        if (!id) {
          throw new Error('ID de solicitud no proporcionado');
        }
        
        // Intentar cargar la solicitud desde el servicio
        const solicitudId = parseInt(id);
        const solicitudEncontrada = SolicitudesService.getSolicitudById(solicitudId);
        
        if (solicitudEncontrada) {
          console.log('Solicitud cargada correctamente:', solicitudEncontrada);
          
          // Adaptar la solicitud al formato interno
          const solicitudAdaptada = adaptSolicitudFromService(solicitudEncontrada);
          setSolicitud(solicitudAdaptada);
          
          // Preparar datos de la visita si ya existe
          if (solicitudAdaptada.visita) {
            setFechaVisita(solicitudAdaptada.visita.fecha_programada);
            setHoraVisita(solicitudAdaptada.visita.hora_programada);
          }
        } else {
          // Si no se encuentra, usamos datos de ejemplo
          console.warn('No se encontró la solicitud, usando datos de ejemplo');
          
          // Simulación de carga
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Datos de ejemplo
          const mockSolicitud: Solicitud = {
            id: solicitudId,
            titulo: 'Solicitud de materiales para reparación de vivienda',
            descripcion: 'Necesito materiales para reparar el techo de mi vivienda que fue dañado durante las últimas lluvias.',
            fecha_creacion: '2023-04-15T09:30:00',
            fecha_actualizacion: '2023-04-18T14:20:00',
            estado: 'pendiente_ts',
            estado_display: 'Pendiente de Trabajo Social',
            prioridad: 'alta',
            aprobada: false,
            en_espera: true,
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
            documentos: [
              { id: 1, nombre: 'Cédula', tipo: 'imagen', url: '/docs/cedula.jpg', fecha_subida: '2023-04-15T09:30:00' },
              { id: 2, nombre: 'Recibo de luz', tipo: 'pdf', url: '/docs/recibo.pdf', fecha_subida: '2023-04-15T09:30:00' },
              { id: 3, nombre: 'Fotos de daños', tipo: 'imagen', url: '/docs/fotos.jpg', fecha_subida: '2023-04-15T09:30:00' }
            ]
          };
          
          // Guardar en el servicio y actualizar estado (adaptando al formato del servicio)
          const solicitudParaServicio = adaptSolicitudToService(mockSolicitud);
          SolicitudesService.updateSolicitud(solicitudId, solicitudParaServicio);
          setSolicitud(mockSolicitud);
        }
      } catch (error) {
        console.error('Error al cargar la solicitud:', error);
        setErrorCarga('No se pudo cargar la información de la solicitud');
      } finally {
        setLoading(false);
      }
    };
    
    cargarSolicitud();
  }, [id]);
  
  // Programar visita
  const handleProgramarVisita = () => {
    if (!solicitud || !fechaVisita || !horaVisita) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor, complete todos los campos requeridos'
      });
      return;
    }

    try {
      // Validar que la fecha y hora no sean anteriores a la actual
      const fechaSeleccionada = new Date(`${fechaVisita}T${horaVisita}`);
      const ahora = new Date();
      
      if (fechaSeleccionada < ahora) {
        setMensaje({
          tipo: 'error',
          texto: 'La fecha y hora de la visita no pueden ser anteriores a la actual'
        });
        return;
      }
      
      // Mostrar mensaje de procesamiento
      setMensaje({
        tipo: 'exito',
        texto: 'Guardando la programación...'
      });

      // Crear la solicitud actualizada con la nueva visita
      const solicitudActualizada: Solicitud = {
        ...solicitud,
        visita: {
          id: Date.now(),
          fecha_programada: fechaVisita,
          hora_programada: horaVisita,
          realizada: false
        },
        estado: 'visita_programada',
        estado_display: 'Visita Programada',
        fecha_actualizacion: new Date().toISOString()
      };
      
      // Adaptar para el servicio y guardar
      const solicitudParaServicio = adaptSolicitudToService(solicitudActualizada);
      
      // Agregar datos de visita en formato compatible
      solicitudParaServicio.visita_programada = fechaVisita;
      solicitudParaServicio.visita_hora = horaVisita;
      solicitudParaServicio.visita_realizada = false;
      solicitudParaServicio.visita_id = Date.now();
      
      // Guardar mediante el servicio
      const resultado = SolicitudesService.updateSolicitud(solicitud.id, solicitudParaServicio);
      
      if (resultado) {
        // Actualizar estado local
        setSolicitud(solicitudActualizada);
        
        // Cerrar modal
        setMostrarModalVisita(false);
        
        // Formatear fecha para mensaje
        const fechaFormateada = new Date(fechaVisita).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Mostrar mensaje de éxito
        setMensaje({
          tipo: 'exito',
          texto: `Visita programada correctamente para el ${fechaFormateada} a las ${horaVisita}`
        });
        
        // Reiniciar campos
        setFechaVisita('');
        setHoraVisita('');
      } else {
        setMensaje({
          tipo: 'error',
          texto: 'Error al guardar la visita programada. Intente nuevamente.'
        });
      }
      
      // Establecer temporizador para limpiar mensaje
      setTimeout(() => {
        setMensaje(null);
      }, 5000);
    } catch (error) {
      console.error('Error al programar la visita:', error);
      setMensaje({
        tipo: 'error',
        texto: 'Ocurrió un error al programar la visita. Por favor, inténtelo de nuevo.'
      });
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 5000);
    }
  };
  
  // Registrar visita realizada y aprobar
  const handleRegistrarVisita = () => {
    if (!solicitud || !informe.trim()) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor, complete el informe de la visita'
      });
      return;
    }
    
    try {
      // Mostrar mensaje de procesamiento
      setMensaje({
        tipo: 'exito',
        texto: 'Procesando informe de visita...'
      });
      
      // Establecer nuevo estado según la decisión
      const nuevoEstado = visitaAprobada ? 'aprobado_ts' : 'rechazado_ts';
      const nuevoEstadoDisplay = visitaAprobada ? 'Aprobado por Trabajo Social' : 'Rechazado por Trabajo Social';
      
      // Crear solicitud actualizada con el informe de visita
      const solicitudActualizada: Solicitud = {
        ...solicitud,
        visita: {
          ...(solicitud.visita || { 
            id: Date.now(),
            fecha_programada: new Date().toISOString().split('T')[0], 
            hora_programada: '10:00' 
          }),
          realizada: true,
          fecha_realizacion: new Date().toISOString(),
          informe: informe
        },
        estado: nuevoEstado,
        estado_display: nuevoEstadoDisplay,
        fecha_actualizacion: new Date().toISOString(),
        aprobada: visitaAprobada,
        en_espera: false
      };
      
      // Adaptar para el servicio y guardar
      const solicitudParaServicio = adaptSolicitudToService(solicitudActualizada);
      
      // Agregar datos de visita en formato compatible
      solicitudParaServicio.visita_programada = solicitudActualizada.visita?.fecha_programada || '';
      solicitudParaServicio.visita_hora = solicitudActualizada.visita?.hora_programada || '';
      solicitudParaServicio.visita_realizada = true;
      solicitudParaServicio.visita_fecha_realizacion = new Date().toISOString();
      solicitudParaServicio.visita_informe = informe;
      solicitudParaServicio.visita_id = solicitudActualizada.visita?.id || Date.now();
      
      // Guardar mediante el servicio
      const resultado = SolicitudesService.updateSolicitud(solicitud.id, solicitudParaServicio);
      
      if (resultado) {
        // Actualizar estado local
        setSolicitud(solicitudActualizada);
        
        // Cerrar modal
        setMostrarModalInforme(false);
        
        // Limpiar formulario
        setInforme('');
        
        // Mostrar mensaje según resultado
        if (visitaAprobada) {
          setMensaje({
            tipo: 'exito',
            texto: 'Visita registrada y solicitud aprobada. La solicitud ha sido enviada a Despacho Superior.'
          });
          
          // Redirigir después de mostrar mensaje
          setTimeout(() => {
            navigate('/trabajo-social');
          }, 4000);
        } else {
          setMensaje({
            tipo: 'exito',
            texto: 'Visita registrada y solicitud rechazada.'
          });
        }
      } else {
        setMensaje({
          tipo: 'error',
          texto: 'Error al registrar la visita. Intente nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error al registrar la visita:', error);
      setMensaje({
        tipo: 'error',
        texto: 'Ocurrió un error al registrar la visita. Por favor, inténtelo de nuevo.'
      });
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 5000);
    }
  };
  
  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Renderizar error
  if (errorCarga || !solicitud) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto text-yellow-500 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{errorCarga || 'No se encontró la solicitud'}</p>
            <button
              onClick={() => navigate('/trabajo-social')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-6">
      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-md w-full transition-all transform ${
          mensaje.tipo === 'exito' 
            ? 'bg-green-100 border-l-4 border-green-600 text-green-800' 
            : 'bg-red-100 border-l-4 border-red-600 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {mensaje.tipo === 'exito' ? (
                <FaCheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-medium">
                {mensaje.tipo === 'exito' ? 'Operación exitosa' : 'Error'}
              </p>
              <p className="mt-1 text-sm">
                {mensaje.texto}
              </p>
            </div>
            <button 
              onClick={() => setMensaje(null)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/trabajo-social')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Volver a la lista</span>
          </button>
          
          <div className="flex space-x-3">
            {!solicitud.visita ? (
              <button
                onClick={() => setMostrarModalVisita(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                Programar visita
              </button>
            ) : solicitud.visita.realizada ? (
              <button
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md cursor-default"
              >
                <FaCheckCircle className="mr-2" />
                Visita completada
              </button>
            ) : (
              <>
                <button
                  onClick={() => setMostrarModalInforme(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaHome className="mr-2" />
                  Registrar visita
                </button>
                <button
                  onClick={() => setMostrarModalVisita(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCalendarAlt className="mr-2" />
                  Reprogramar
                </button>
              </>
            )}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{solicitud.titulo}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium 
            ${solicitud.estado.includes('aprobado') 
              ? 'bg-green-100 text-green-800' 
              : solicitud.estado.includes('rechazado')
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {solicitud.estado_display}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium 
            ${solicitud.prioridad === 'alta' 
              ? 'bg-red-100 text-red-800' 
              : solicitud.prioridad === 'media'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            Prioridad {solicitud.prioridad.charAt(0).toUpperCase() + solicitud.prioridad.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-700 mb-4">{solicitud.descripcion}</p>
        
        <div className="flex items-center text-sm text-gray-500">
          <span>Creada: {new Date(solicitud.fecha_creacion).toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          })}</span>
        </div>
      </div>
      
      {/* Contenido principal en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Información del Ciudadano */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
            {solicitud.ciudadano.fecha_nacimiento && (
              <div>
                <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                <p className="font-medium">{new Date(solicitud.ciudadano.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
              </div>
            )}
            {solicitud.ciudadano.correo_electronico && (
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-medium">{solicitud.ciudadano.correo_electronico}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Columna 2: Materiales Solicitados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Materiales Solicitados</h2>
          {solicitud.materiales.length === 0 ? (
            <p className="text-gray-500 italic">No hay materiales solicitados</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitud.materiales.map((material) => (
                  <tr key={material.id}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{material.nombre}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{material.cantidad} {material.unidad}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Columna 3: Estado de la Visita o Documentos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {solicitud.visita ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Visita</h2>
              <div className="rounded-md bg-blue-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCalendarAlt className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      {solicitud.visita.realizada ? 'Visita realizada' : 'Visita programada'}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Fecha: {new Date(solicitud.visita.fecha_programada).toLocaleDateString('es-ES')}</p>
                      <p>Hora: {solicitud.visita.hora_programada}</p>
                      {solicitud.visita.realizada && solicitud.visita.fecha_realizacion && (
                        <p>Realizada el: {new Date(solicitud.visita.fecha_realizacion).toLocaleDateString('es-ES')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {solicitud.visita.realizada && solicitud.visita.informe && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Informe de la Visita</h3>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">{solicitud.visita.informe}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h2>
              <div className="space-y-3">
                {solicitud.documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{doc.nombre}</h3>
                      <p className="text-xs text-gray-500">
                        {doc.tipo === 'pdf' ? 'Documento PDF' : 'Imagen'}
                        {' • '}
                        {new Date(doc.fecha_subida).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaFileAlt />
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Modal de programación de visita */}
      {mostrarModalVisita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="text-green-600 mr-2" />
              {solicitud.visita ? 'Reprogramar visita' : 'Programar visita'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de visita <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={fechaVisita}
                  onChange={(e) => setFechaVisita(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {!fechaVisita && <p className="mt-1 text-xs text-red-500">La fecha es obligatoria</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de visita <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={horaVisita}
                  onChange={(e) => setHoraVisita(e.target.value)}
                />
                {!horaVisita && <p className="mt-1 text-xs text-red-500">La hora es obligatoria</p>}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-sm text-blue-800">
                  <FaUserCheck className="inline-block mr-1" /> 
                  La visita será asignada al trabajador social {" "}
                  <span className="font-medium">Actual</span> para la dirección {" "}
                  <span className="font-medium">{solicitud.ciudadano.direccion}</span>
                </p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                <p className="text-sm text-yellow-800 flex items-start">
                  <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    Asegúrese de coordinar con el ciudadano antes de programar la visita para confirmar su disponibilidad.
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModalVisita(false);
                  // Limpiar estados al cancelar
                  if (!solicitud.visita) {
                    setFechaVisita('');
                    setHoraVisita('');
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProgramarVisita}
                disabled={!fechaVisita || !horaVisita}
                className={`px-4 py-2 rounded-md transition-colors ${
                  fechaVisita && horaVisita
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {solicitud.visita ? 'Reprogramar' : 'Programar'} visita
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de registro de visita */}
      {mostrarModalInforme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaHome className="text-green-600 mr-2" />
              Registrar visita realizada
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informe de la visita <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={5}
                  placeholder="Detalle el resultado de la visita, condiciones de la vivienda, situación del solicitante, etc..."
                  value={informe}
                  onChange={(e) => setInforme(e.target.value)}
                ></textarea>
                {!informe.trim() && (
                  <p className="mt-1 text-xs text-red-500">El informe es obligatorio</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Decisión sobre la solicitud</h3>
                
                <div className="flex items-center mb-3">
                  <input
                    id="aprobacion"
                    type="radio"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    checked={visitaAprobada}
                    onChange={() => setVisitaAprobada(true)}
                  />
                  <label htmlFor="aprobacion" className="ml-2 block text-sm text-gray-900">
                    <span className="font-medium">Aprobar solicitud</span> - Enviar a Despacho Superior
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="rechazo"
                    type="radio"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    checked={!visitaAprobada}
                    onChange={() => setVisitaAprobada(false)}
                  />
                  <label htmlFor="rechazo" className="ml-2 block text-sm text-gray-900">
                    <span className="font-medium">Rechazar solicitud</span> - No cumple los requisitos
                  </label>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  {visitaAprobada ? (
                    <p className="text-green-600">
                      Al aprobar, la solicitud pasará automáticamente a Despacho Superior para su revisión final.
                    </p>
                  ) : (
                    <p className="text-red-600">
                      Al rechazar, la solicitud se cerrará y se notificará al ciudadano sobre la decisión.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModalInforme(false);
                  // No limpiar el informe para permitir continuar más tarde
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarVisita}
                disabled={!informe.trim()}
                className={`px-4 py-2 rounded-md transition-colors ${
                  informe.trim()
                    ? visitaAprobada 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {visitaAprobada ? 'Registrar y Aprobar' : 'Registrar y Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleTrabajoSocial; 