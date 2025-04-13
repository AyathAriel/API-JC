import { Solicitud } from '../types/solicitud';

// Clave para almacenar en localStorage
const SOLICITUDES_KEY = 'solicitudes';

// Si no hay datos, usamos estos como iniciales
const solicitudesMock: Solicitud[] = [
  {
    id: 1,
    titulo: 'Solicitud de materiales para vivienda',
    descripcion: 'Necesito materiales para reparar mi techo después de las lluvias.',
    fecha_creacion: '2023-04-15T09:00:00Z',
    estado: 'pendiente',
    ciudadano: {
      id: 101,
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '8-123-456',
      telefono: '6123-4567',
      direccion: 'Barrio San Miguel, Casa #123, El Porvenir'
    }
  },
  {
    id: 2,
    titulo: 'Solicitud de apoyo para medicamentos',
    descripcion: 'Requiero apoyo para la compra de medicamentos de alta especialidad.',
    fecha_creacion: '2023-04-10T15:30:00Z',
    estado: 'aprobado_representante',
    ciudadano: {
      id: 102,
      nombre: 'María',
      apellido: 'González',
      cedula: '9-876-543',
      telefono: '6987-6543',
      direccion: 'Calle Principal, San Antonio'
    }
  },
  {
    id: 3,
    titulo: 'Permiso para feria artesanal',
    descripcion: 'Solicito permiso para realizar una feria artesanal en la plaza del barrio.',
    fecha_creacion: '2023-04-05T11:45:00Z',
    estado: 'rechazado',
    ciudadano: {
      id: 103,
      nombre: 'Pedro',
      apellido: 'Rodríguez',
      cedula: '7-789-123',
      telefono: '6789-1234',
      direccion: 'Urbanización Las Flores, Casa 45'
    }
  }
];

// Función para inicializar datos si no existen
const initializeData = () => {
  if (!localStorage.getItem(SOLICITUDES_KEY)) {
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudesMock));
  }
};

// Servicio para manejar las solicitudes
const SolicitudesService = {
  // Obtener todas las solicitudes
  getSolicitudes: (): Solicitud[] => {
    initializeData();
    const data = localStorage.getItem(SOLICITUDES_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Obtener una solicitud por ID
  getSolicitudById: (id: number): Solicitud | undefined => {
    const solicitudes = SolicitudesService.getSolicitudes();
    return solicitudes.find(s => s.id === id);
  },

  // Simular creación de solicitud con FormData (para subir archivos)
  createSolicitud: (formData: FormData) => {
    // En una app real, esto sería una petición HTTP
    // Pero aquí simularemos la respuesta

    const solicitudes = SolicitudesService.getSolicitudes();
    
    // Generar id único
    const newId = solicitudes.length > 0 
      ? Math.max(...solicitudes.map(s => s.id)) + 1 
      : 1;

    // Crear nueva solicitud con los datos del FormData
    const newSolicitud: Solicitud = {
      id: newId,
      titulo: formData.get('titulo') as string,
      descripcion: formData.get('descripcion') as string,
      fecha_creacion: new Date().toISOString(),
      estado: 'pendiente',
      ciudadano: {
        id: newId + 100, // id único para el ciudadano
        nombre: formData.get('nombre') as string,
        apellido: formData.get('apellido') as string,
        cedula: formData.get('cedula') as string,
        telefono: formData.get('telefono') as string,
        direccion: formData.get('direccion') as string
      }
    };

    // Actualizar localStorage
    solicitudes.push(newSolicitud);
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));

    return {
      success: true,
      data: newSolicitud
    };
  },
  
  // Añadir una solicitud directamente con datos e imágenes
  addSolicitud: (solicitudData: {
    titulo: string;
    descripcion: string;
    fotoCedula: string | null;
    fotoSolicitud: string | null;
    ciudadano: {
      nombre: string;
      apellido: string;
      cedula: string;
      telefono: string;
      direccion: string;
      barrio?: string;
    }
  }): Solicitud => {
    const solicitudes = SolicitudesService.getSolicitudes();
    
    // Generar id único
    const newId = solicitudes.length > 0 
      ? Math.max(...solicitudes.map((s: Solicitud) => s.id)) + 1 
      : 1;
    
    // Crear nueva solicitud con los datos proporcionados
    const newSolicitud: Solicitud = {
      id: newId,
      titulo: solicitudData.titulo,
      descripcion: solicitudData.descripcion,
      fecha_creacion: new Date().toISOString(),
      estado: 'pendiente',
      estado_display: 'Pendiente',
      aprobada: false,
      en_espera: true,
      foto_cedula: solicitudData.fotoCedula || undefined,
      recibo_servicios: solicitudData.fotoSolicitud || undefined,
      ciudadano: {
        id: newId + 100, // id único para el ciudadano
        nombre: solicitudData.ciudadano.nombre,
        apellido: solicitudData.ciudadano.apellido,
        cedula: solicitudData.ciudadano.cedula,
        telefono: solicitudData.ciudadano.telefono,
        direccion: solicitudData.ciudadano.direccion
      }
    };
    
    // Actualizar localStorage
    solicitudes.push(newSolicitud);
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
    
    return newSolicitud;
  },

  // Aprobar solicitud
  aprobarSolicitud: (id: number) => {
    const solicitudes = SolicitudesService.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    
    if (index !== -1) {
      solicitudes[index].estado = 'aprobado_representante';
      localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
      return true;
    }
    return false;
  },

  // Rechazar solicitud
  rechazarSolicitud: (id: number) => {
    const solicitudes = SolicitudesService.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    
    if (index !== -1) {
      solicitudes[index].estado = 'rechazado';
      localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
      return true;
    }
    return false;
  },

  // Enviar a trabajo social
  enviarTrabajoSocial: (id: number) => {
    const solicitudes = SolicitudesService.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    
    if (index !== -1) {
      solicitudes[index].estado = 'pendiente_ts';
      localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
      return true;
    }
    return false;
  },

  // Marcar como entregada
  marcarEntregada: (id: number): boolean => {
    const solicitudes = SolicitudesService.getSolicitudes();
    const index = solicitudes.findIndex((s: Solicitud) => s.id === id);
    
    if (index !== -1) {
      solicitudes[index].estado = 'entregado';
      localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
      return true;
    }
    return false;
  },

  // Buscar solicitudes por término (nombre, cédula, título)
  buscarSolicitudes: (termino: string): Solicitud[] => {
    const solicitudes = SolicitudesService.getSolicitudes();
    const searchTerm = termino.toLowerCase();
    
    return solicitudes.filter(s => 
      s.titulo.toLowerCase().includes(searchTerm) ||
      s.descripcion.toLowerCase().includes(searchTerm) ||
      s.ciudadano.nombre.toLowerCase().includes(searchTerm) ||
      s.ciudadano.apellido.toLowerCase().includes(searchTerm) ||
      s.ciudadano.cedula.includes(searchTerm)
    );
  },

  // Actualizar solicitud completa
  updateSolicitud: (id: number, solicitudActualizada: Solicitud): boolean => {
    const solicitudes = SolicitudesService.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    
    if (index !== -1) {
      solicitudes[index] = {
        ...solicitudes[index],
        ...solicitudActualizada
      };
      localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
      return true;
    }
    return false;
  }
};

export default SolicitudesService; 