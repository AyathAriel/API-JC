/**
 * CONTEXTO COMPLETO PARA EL AGENTE DE INTELIGENCIA ARTIFICIAL
 * Sistema de Gestión de Solicitudes para Junta Comunal
 */

const AIAgentContext = {
  /**
   * DESCRIPCIÓN GENERAL DEL SISTEMA
   */
  sistemaDescripcion: `
    Sistema de gestión integral para Juntas Comunales de Panamá, enfocado en la administración 
    y seguimiento de solicitudes ciudadanas de ayuda social, materiales de construcción y otros servicios.
    La aplicación permite digitalizar todo el proceso desde la recepción inicial hasta la entrega
    final de materiales o servicios, con énfasis en transparencia y trazabilidad.
  `,

  /**
   * ARQUITECTURA DE LA APLICACIÓN
   */
  arquitectura: {
    frontend: "React con TypeScript, utilizando TailwindCSS para estilos",
    backend: "Node.js con Express, conectado a base de datos PostgreSQL",
    autenticacion: "JWT (JSON Web Tokens) con roles y permisos específicos",
    almacenamiento: "Archivos en servidor local con respaldo en la nube"
  },

  /**
   * ENTIDADES PRINCIPALES DEL SISTEMA Y SUS RELACIONES
   */
  entidades: {
    Solicitud: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "titulo", tipo: "string", descripcion: "Título descriptivo de la solicitud" },
        { nombre: "descripcion", tipo: "string", descripcion: "Detalle de lo solicitado" },
        { nombre: "fecha_creacion", tipo: "Date", descripcion: "Fecha de registro inicial" },
        { nombre: "fecha_actualizacion", tipo: "Date", descripcion: "Última modificación" },
        { nombre: "estado", tipo: "string", descripcion: "Estado actual del proceso" },
        { nombre: "estado_display", tipo: "string", descripcion: "Texto amigable del estado" },
        { nombre: "prioridad", tipo: "string", descripcion: "Nivel de prioridad (alta/media/baja)" },
        { nombre: "ciudadano_id", tipo: "number", descripcion: "Referencia al ciudadano solicitante" }
      ],
      relaciones: [
        "Una solicitud pertenece a un ciudadano",
        "Una solicitud puede tener múltiples materiales",
        "Una solicitud puede tener múltiples documentos adjuntos",
        "Una solicitud puede tener múltiples eventos en su historial",
        "Una solicitud puede tener una visita de trabajo social asociada"
      ]
    },
    
    Ciudadano: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "nombre", tipo: "string", descripcion: "Nombre del ciudadano" },
        { nombre: "apellido", tipo: "string", descripcion: "Apellido del ciudadano" },
        { nombre: "cedula", tipo: "string", descripcion: "Número de cédula (identificación)" },
        { nombre: "telefono", tipo: "string", descripcion: "Número de contacto" },
        { nombre: "direccion", tipo: "string", descripcion: "Dirección física" },
        { nombre: "correo_electronico", tipo: "string", descripcion: "Email de contacto (opcional)" },
        { nombre: "fecha_nacimiento", tipo: "Date", descripcion: "Fecha de nacimiento" }
      ],
      relaciones: [
        "Un ciudadano puede tener múltiples solicitudes",
        "Un ciudadano puede tener un historial de interacciones con la junta comunal"
      ]
    },
    
    Material: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "solicitud_id", tipo: "number", descripcion: "Referencia a la solicitud" },
        { nombre: "nombre", tipo: "string", descripcion: "Nombre del material" },
        { nombre: "cantidad", tipo: "number", descripcion: "Cantidad solicitada" },
        { nombre: "unidad", tipo: "string", descripcion: "Unidad de medida" },
        { nombre: "aprobado", tipo: "boolean", descripcion: "Si ha sido aprobado" },
        { nombre: "cantidad_aprobada", tipo: "number", descripcion: "Cantidad aprobada" }
      ],
      relaciones: [
        "Cada material pertenece a una solicitud específica",
        "Los materiales pueden estar asociados a inventario en almacén"
      ]
    },
    
    Documento: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "solicitud_id", tipo: "number", descripcion: "Referencia a la solicitud" },
        { nombre: "nombre", tipo: "string", descripcion: "Nombre descriptivo del documento" },
        { nombre: "tipo", tipo: "string", descripcion: "Tipo (imagen/pdf/otro)" },
        { nombre: "url", tipo: "string", descripcion: "Ruta de almacenamiento" },
        { nombre: "fecha_subida", tipo: "Date", descripcion: "Fecha de subida" }
      ],
      relaciones: [
        "Cada documento pertenece a una solicitud específica"
      ]
    },
    
    Visita: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "solicitud_id", tipo: "number", descripcion: "Referencia a la solicitud" },
        { nombre: "fecha_programada", tipo: "Date", descripcion: "Fecha programada para visita" },
        { nombre: "hora_programada", tipo: "string", descripcion: "Hora programada" },
        { nombre: "realizada", tipo: "boolean", descripcion: "Si ya se realizó" },
        { nombre: "fecha_realizacion", tipo: "Date", descripcion: "Fecha real de la visita" },
        { nombre: "informe", tipo: "string", descripcion: "Descripción de hallazgos" },
        { nombre: "trabajador_id", tipo: "number", descripcion: "Trabajador social asignado" }
      ],
      relaciones: [
        "Cada visita pertenece a una solicitud específica",
        "Una visita es realizada por un trabajador social"
      ]
    },
    
    HistorialSolicitud: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "solicitud_id", tipo: "number", descripcion: "Referencia a la solicitud" },
        { nombre: "fecha", tipo: "Date", descripcion: "Fecha del evento" },
        { nombre: "accion", tipo: "string", descripcion: "Descripción de la acción realizada" },
        { nombre: "estado_anterior", tipo: "string", descripcion: "Estado previo" },
        { nombre: "estado_nuevo", tipo: "string", descripcion: "Estado nuevo" },
        { nombre: "usuario_id", tipo: "number", descripcion: "Usuario que realizó el cambio" },
        { nombre: "departamento", tipo: "string", descripcion: "Departamento involucrado" }
      ],
      relaciones: [
        "Cada registro de historial pertenece a una solicitud específica",
        "Cada registro está asociado a un usuario del sistema"
      ]
    },
    
    Usuario: {
      campos: [
        { nombre: "id", tipo: "number", descripcion: "Identificador único" },
        { nombre: "nombre", tipo: "string", descripcion: "Nombre del usuario" },
        { nombre: "apellido", tipo: "string", descripcion: "Apellido del usuario" },
        { nombre: "nombre_usuario", tipo: "string", descripcion: "Username para login" },
        { nombre: "correo", tipo: "string", descripcion: "Email para comunicaciones" },
        { nombre: "rol", tipo: "string", descripcion: "Rol en el sistema" },
        { nombre: "departamento", tipo: "string", descripcion: "Departamento al que pertenece" }
      ],
      relaciones: [
        "Un usuario puede manejar múltiples solicitudes",
        "Un usuario está asociado a acciones en el historial",
        "Un trabajador social está asociado a visitas"
      ]
    }
  },

  /**
   * ESTADOS DE SOLICITUD Y SU FLUJO
   */
  estadosSolicitud: [
    {
      nombre: "pendiente",
      displayName: "Pendiente",
      descripcion: "Solicitud registrada en recepción, pendiente de revisión inicial de documentos",
      departamento: "Recepción",
      siguientesEstados: ["documentos_verificados", "rechazado"]
    },
    {
      nombre: "documentos_verificados",
      displayName: "Documentos Verificados",
      descripcion: "Documentación verificada correctamente, lista para evaluación de trabajo social",
      departamento: "Recepción",
      siguientesEstados: ["pendiente_ts"]
    },
    {
      nombre: "pendiente_ts",
      displayName: "Pendiente de Visita",
      descripcion: "En espera de visita por parte del departamento de trabajo social",
      departamento: "Trabajo Social",
      siguientesEstados: ["visita_programada"]
    },
    {
      nombre: "visita_programada",
      displayName: "Visita Programada",
      descripcion: "Visita de trabajo social programada con fecha específica",
      departamento: "Trabajo Social",
      siguientesEstados: ["verificado_ts", "rechazado_ts"]
    },
    {
      nombre: "verificado_ts",
      displayName: "Verificado",
      descripcion: "Verificado positivamente por trabajo social, pendiente de aprobación final",
      departamento: "Trabajo Social",
      siguientesEstados: ["aprobado_ts", "rechazado_ts"]
    },
    {
      nombre: "aprobado_ts",
      displayName: "Aprobado por Trabajo Social",
      descripcion: "Aprobado por trabajo social, enviado a despacho superior para decisión final",
      departamento: "Trabajo Social",
      siguientesEstados: ["en_despacho"]
    },
    {
      nombre: "rechazado_ts",
      displayName: "Rechazado por Trabajo Social",
      descripcion: "Rechazado después de evaluación de trabajo social",
      departamento: "Trabajo Social",
      siguientesEstados: []
    },
    {
      nombre: "en_despacho",
      displayName: "En Despacho Superior",
      descripcion: "En revisión por el representante o autoridad para aprobación final",
      departamento: "Despacho Superior",
      siguientesEstados: ["aprobado", "rechazado"]
    },
    {
      nombre: "aprobado",
      displayName: "Aprobado",
      descripcion: "Aprobado por despacho superior, listo para procesar entrega",
      departamento: "Despacho Superior",
      siguientesEstados: ["en_entrega"]
    },
    {
      nombre: "rechazado",
      displayName: "Rechazado",
      descripcion: "Rechazado por despacho superior",
      departamento: "Despacho Superior",
      siguientesEstados: []
    },
    {
      nombre: "en_entrega",
      displayName: "En Entrega",
      descripcion: "Materiales o ayuda en proceso de entrega desde almacén",
      departamento: "Almacén",
      siguientesEstados: ["completado"]
    },
    {
      nombre: "completado",
      displayName: "Completado",
      descripcion: "Proceso finalizado, materiales o ayuda entregados al ciudadano",
      departamento: "Almacén",
      siguientesEstados: []
    }
  ],

  /**
   * MÓDULOS DEL SISTEMA Y SUS FUNCIONALIDADES
   */
  modulos: {
    Recepcion: {
      descripcion: "Módulo para el manejo inicial de solicitudes y atención ciudadana",
      pantallas: [
        {
          nombre: "Lista de Solicitudes",
          ruta: "/solicitudes",
          componente: "Solicitudes.tsx",
          funcionalidades: [
            "Visualización de todas las solicitudes registradas",
            "Filtrado por nombre, cédula, estado y fecha",
            "Navegación a detalle de solicitud",
            "Registro de nuevas solicitudes"
          ]
        },
        {
          nombre: "Detalle de Solicitud",
          ruta: "/solicitud/:id",
          componente: "DetalleSolicitud.tsx",
          funcionalidades: [
            "Visualización completa de datos de solicitud",
            "Pestañas para separar detalles, documentos e historial",
            "Visualización de datos del ciudadano",
            "Acceso al historial completo del ciudadano",
            "Visualización de documentos adjuntos",
            "Historial de cambios de la solicitud"
          ]
        },
        {
          nombre: "Registro de Solicitud",
          ruta: "/solicitudes/nueva",
          componente: "NuevaSolicitud.tsx",
          funcionalidades: [
            "Formulario de ingreso de datos básicos",
            "Búsqueda de ciudadano existente o registro de nuevo",
            "Carga de documentos (cédula, recibos, fotos)",
            "Descripción de la solicitud y materiales necesarios"
          ]
        }
      ]
    },
    
    TrabajoSocial: {
      descripcion: "Módulo para la gestión de visitas, verificaciones y evaluaciones sociales",
      pantallas: [
        {
          nombre: "Panel de Trabajo Social",
          ruta: "/trabajo-social",
          componente: "TrabajoSocial.tsx",
          funcionalidades: [
            "Visualización de solicitudes pendientes de visita",
            "Filtrado por estado, prioridad y fecha",
            "Navegación a detalle de solicitud",
            "Programación de nuevas visitas"
          ]
        },
        {
          nombre: "Detalle de Trabajo Social",
          ruta: "/solicitud/:id",
          componente: "DetalleSolicitud.tsx",
          funcionalidades: [
            "Visualización de detalles de solicitud",
            "Programación de visita con fecha y hora",
            "Registro de informe de visita realizada",
            "Aprobación o rechazo basado en la visita",
            "Modificación de cantidades de materiales aprobados"
          ]
        },
        {
          nombre: "Calendario de Visitas",
          ruta: "/trabajo-social/calendario",
          componente: "CalendarioVisitas.tsx",
          funcionalidades: [
            "Vista de calendario con visitas programadas",
            "Organización de visitas por día y hora",
            "Reasignación de fechas de visita",
            "Exportación de calendario de visitas"
          ]
        }
      ]
    },
    
    DespachoSuperior: {
      descripcion: "Módulo para la aprobación final y toma de decisiones por autoridades",
      pantallas: [
        {
          nombre: "Panel de Despacho",
          ruta: "/despacho-superior",
          componente: "DespachoSuperior.tsx",
          funcionalidades: [
            "Visualización de solicitudes aprobadas por trabajo social",
            "Revisión de informes y documentación",
            "Aprobación o rechazo final de solicitudes",
            "Priorización de solicitudes urgentes"
          ]
        },
        {
          nombre: "Presupuesto y Asignaciones",
          ruta: "/despacho-superior/presupuesto",
          componente: "PresupuestoAsignaciones.tsx",
          funcionalidades: [
            "Control de presupuesto asignado por categoría",
            "Seguimiento de gastos y recursos utilizados",
            "Proyecciones y estadísticas de uso"
          ]
        },
        {
          nombre: "Reportes Ejecutivos",
          ruta: "/despacho-superior/reportes",
          componente: "ReportesEjecutivos.tsx",
          funcionalidades: [
            "Generación de reportes de gestión",
            "Estadísticas de atención ciudadana",
            "Métricas de eficiencia y tiempo de respuesta",
            "Exportación a PDF y Excel"
          ]
        }
      ]
    },
    
    Almacen: {
      descripcion: "Módulo para la gestión de inventario y entrega de materiales",
      pantallas: [
        {
          nombre: "Inventario",
          ruta: "/almacen/inventario",
          componente: "Inventario.tsx",
          funcionalidades: [
            "Visualización de existencias actuales",
            "Registro de entradas y salidas",
            "Alertas de stock bajo",
            "Registro de proveedores"
          ]
        },
        {
          nombre: "Entregas Pendientes",
          ruta: "/almacen/entregas",
          componente: "EntregasPendientes.tsx",
          funcionalidades: [
            "Lista de solicitudes aprobadas pendientes de entrega",
            "Programación de fechas de entrega",
            "Generación de comprobantes de entrega",
            "Registro de entrega con firma digital"
          ]
        },
        {
          nombre: "Historial de Movimientos",
          ruta: "/almacen/movimientos",
          componente: "MovimientosAlmacen.tsx",
          funcionalidades: [
            "Registro histórico de todas las operaciones",
            "Filtrado por tipo de operación y material",
            "Reportes de uso y entregas",
            "Trazabilidad completa de materiales"
          ]
        }
      ]
    },
    
    Administracion: {
      descripcion: "Módulo para la configuración y administración del sistema",
      pantallas: [
        {
          nombre: "Usuarios",
          ruta: "/admin/usuarios",
          componente: "GestionUsuarios.tsx",
          funcionalidades: [
            "Creación y edición de usuarios",
            "Asignación de roles y permisos",
            "Reseteo de contraseñas",
            "Auditoría de actividad"
          ]
        },
        {
          nombre: "Configuración",
          ruta: "/admin/configuracion",
          componente: "Configuracion.tsx",
          funcionalidades: [
            "Parámetros generales del sistema",
            "Configuración de notificaciones",
            "Personalización de estados y flujos",
            "Ajustes de seguridad"
          ]
        },
        {
          nombre: "Auditoría",
          ruta: "/admin/auditoria",
          componente: "Auditoria.tsx",
          funcionalidades: [
            "Registro completo de actividades",
            "Filtrado por usuario, acción y fecha",
            "Reportes de seguridad",
            "Detección de anomalías"
          ]
        }
      ]
    }
  },

  /**
   * PROCESOS PRINCIPALES DEL SISTEMA
   */
  procesosPrincipales: [
    {
      nombre: "Registro de Nueva Solicitud",
      pasos: [
        "1. Recepcionista recibe al ciudadano y verifica su identificación",
        "2. Busca si el ciudadano ya existe en el sistema o crea un nuevo registro",
        "3. Registra los detalles de la solicitud (título, descripción, tipo)",
        "4. Digitaliza y adjunta documentos necesarios (cédula, recibos, fotos)",
        "5. Si es solicitud de materiales, registra los materiales requeridos",
        "6. El sistema asigna automáticamente el estado 'pendiente'",
        "7. Se entrega un comprobante al ciudadano con número de seguimiento"
      ]
    },
    {
      nombre: "Verificación y Visita de Trabajo Social",
      pasos: [
        "1. Trabajador social revisa solicitudes en estado 'pendiente_ts'",
        "2. Programa una visita asignando fecha y hora",
        "3. El sistema notifica al ciudadano sobre la visita programada",
        "4. Se realiza la visita en la fecha programada",
        "5. Se registra el informe de la visita con hallazgos y fotografías",
        "6. Se determina si la solicitud cumple con los requisitos",
        "7. Se aprueba o rechaza la solicitud basado en la evaluación",
        "8. Si es aprobada, se actualiza a estado 'aprobado_ts' y pasa a Despacho Superior"
      ]
    },
    {
      nombre: "Aprobación en Despacho Superior",
      pasos: [
        "1. Representante o autoridad revisa solicitudes en estado 'en_despacho'",
        "2. Verifica informe de trabajo social y documentación adjunta",
        "3. Revisa presupuesto disponible y prioridades",
        "4. Decide aprobar o rechazar la solicitud",
        "5. Si aprueba, especifica cantidades y recursos asignados",
        "6. El sistema actualiza el estado a 'aprobado' o 'rechazado'",
        "7. Si es aprobada, genera automáticamente orden para almacén"
      ]
    },
    {
      nombre: "Entrega de Materiales o Ayuda",
      pasos: [
        "1. Almacenista recibe notificaciones de solicitudes aprobadas",
        "2. Verifica disponibilidad de materiales en inventario",
        "3. Prepara los materiales para entrega",
        "4. Programa fecha de entrega o retiro",
        "5. Notifica al ciudadano cuando los materiales están listos",
        "6. Registra la entrega con firma del ciudadano",
        "7. Actualiza el inventario automáticamente",
        "8. El sistema cambia el estado a 'completado'"
      ]
    }
  ],

  /**
   * INDICADORES CLAVE DE DESEMPEÑO (KPIs)
   */
  kpis: [
    { 
      nombre: "Tiempo promedio de aprobación", 
      descripcion: "Días desde la creación hasta la aprobación final",
      objetivo: "Menos de 15 días"
    },
    { 
      nombre: "Tasa de aprobación", 
      descripcion: "Porcentaje de solicitudes aprobadas vs. rechazadas",
      objetivo: "Mantener transparencia en criterios de aprobación"
    },
    { 
      nombre: "Eficiencia en visitas", 
      descripcion: "Número de visitas completadas por día por trabajador social",
      objetivo: "4-5 visitas diarias"
    },
    { 
      nombre: "Tiempo de entrega", 
      descripcion: "Días desde aprobación hasta entrega efectiva",
      objetivo: "Menos de 7 días"
    },
    { 
      nombre: "Satisfacción ciudadana", 
      descripcion: "Evaluación del servicio por parte de los ciudadanos",
      objetivo: "Puntuación superior a 4.5/5"
    }
  ],

  /**
   * CASOS DE USO COMUNES
   */
  casosDeUso: [
    {
      titulo: "Ciudadano solicita materiales para reparación de vivienda",
      descripcion: "Proceso típico de solicitud de materiales de construcción",
      actores: ["Ciudadano", "Recepcionista", "Trabajador Social", "Representante", "Almacenista"],
      flujo: [
        "Ciudadano presenta solicitud con documentos y fotos del daño",
        "Recepcionista verifica documentación y registra solicitud",
        "Trabajo Social programa y realiza visita para verificar necesidad",
        "Trabajador Social aprueba y detalla materiales necesarios",
        "Representante revisa y da aprobación final",
        "Almacén prepara y entrega materiales",
        "Ciudadano recibe materiales y firma constancia de entrega"
      ]
    },
    {
      titulo: "Solicitud de ayuda económica para tratamiento médico",
      descripcion: "Proceso para ayudas económicas por emergencia médica",
      actores: ["Ciudadano", "Recepcionista", "Trabajador Social", "Representante"],
      flujo: [
        "Ciudadano presenta solicitud con diagnóstico médico y cotización",
        "Recepcionista verifica documentación y marca como prioritaria",
        "Trabajo Social realiza evaluación rápida de la situación",
        "Representante aprueba ayuda por vía rápida",
        "Se genera cheque o transferencia para cubrir gastos médicos",
        "Ciudadano presenta comprobantes de uso de los fondos"
      ]
    },
    {
      titulo: "Seguimiento de solicitud por parte del ciudadano",
      descripcion: "Proceso para que ciudadanos verifiquen el estado de su solicitud",
      actores: ["Ciudadano", "Recepcionista"],
      flujo: [
        "Ciudadano se presenta con número de solicitud",
        "Recepcionista consulta estado actual en el sistema",
        "Sistema muestra historial completo de la solicitud",
        "Recepcionista informa estado y próximos pasos",
        "Si hay retrasos, se registra una nota para agilizar el proceso"
      ]
    }
  ],

  /**
   * RECOMENDACIONES PARA EL AGENTE DE IA
   */
  recomendacionesAI: [
    "Utilizar lenguaje sencillo al explicar los procesos a los usuarios",
    "Siempre verificar el estado actual de una solicitud antes de sugerir acciones",
    "Conocer los diferentes roles y sus capacidades dentro del sistema",
    "Entender el flujo completo de trabajo para dar orientación adecuada",
    "Identificar las funcionalidades específicas de cada módulo para direccionar correctamente",
    "Considerar las relaciones entre entidades al responder sobre datos relacionados",
    "Recordar que el objetivo final es ayudar a los ciudadanos y hacer más eficiente la gestión"
  ]
};

export default AIAgentContext; 