export interface Ciudadano {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  barrio: string;
  corregimiento: string;
  distrito: string;
}

export interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  aprobado: boolean;
}

export interface Documento {
  id: number;
  nombre: string;
  url: string;
}

export interface Solicitud {
  id: number;
  fecha_creacion: string;
  titulo: string;
  descripcion: string;
  aprobada: boolean;
  en_espera: boolean;
  estado: string;
  estado_display: string;
  prioridad: string;
  categoria: string;
  ciudadano: Ciudadano;
  materiales_solicitados: Material[];
  fotos: string[];
  documentos: Documento[];
  asignado_a: string;
}

export interface Comentario {
  id: number;
  autor: string;
  fecha: string;
  contenido: string;
  tipo: string;
}

export interface Producto {
  codigo: string;
  nombre: string;
  unidad: string;
  stock: number;
}

export interface Entrega {
  id: number;
  fecha: string;
  proveedor: string;
  productos: {
    producto: Producto;
    cantidad: number;
  }[];
  estado: 'pendiente' | 'recibido';
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  rol: 'admin' | 'representante' | 'trabajo_social' | 'almacen' | 'despacho_superior';
  ultimo_acceso: string;
  activo: boolean;
} 