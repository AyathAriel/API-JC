export interface Ciudadano {
  id?: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correo?: string;
  barrio?: string;
}

export interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  estado_display: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  aprobada: boolean;
  en_espera: boolean;
  foto_cedula?: string;
  recibo_servicios?: string;
  prioridad?: string;
  categoria?: string;
  tipo?: 'requisicion' | 'orden_compra' | 'cotizacion' | 'solicitud';
  ciudadano: Ciudadano;
  materiales_solicitados?: Material[];
  documentos?: string[];
}

export interface Comentario {
  id: number;
  autor: string;
  fecha: string;
  contenido: string;
  tipo: 'comentario' | 'rechazo' | 'aprobacion';
}

export interface Material {
  id?: number;
  nombre: string;
  cantidad: number;
  unidad: string;
} 