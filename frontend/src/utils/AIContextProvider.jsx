import React, { createContext, useContext } from 'react';

const AIContext = createContext();

export const useAIContext = () => useContext(AIContext);

export const AIContextProvider = ({ children }) => {
  // El contexto completo que usará el agente AI para responder consultas
  const context = `
# Sistema de Gestión de Solicitudes de la Junta Comunal de Panamá

## Descripción del Sistema
Este sistema gestiona solicitudes de ayuda social para ciudadanos de Panamá, permitiendo el seguimiento desde la recepción inicial hasta la entrega de materiales o servicios.

## Entidades Principales
- Ciudadanos: Personas que solicitan ayuda a la Junta Comunal
- Solicitudes: Peticiones de ayuda que siguen un flujo de trabajo definido
- Materiales: Recursos físicos que pueden ser asignados a solicitudes
- Documentos: Archivos adjuntos a las solicitudes como respaldo

## Estados de Solicitud
1. Pendiente: Solicitud recién creada
2. Verificado: Verificada por Trabajo Social
3. Aprobado: Aprobada para entrega
4. En Entrega: Proceso de entrega iniciado
5. Completado: Solicitud finalizada con éxito
6. Rechazado: Solicitud no aprobada

## Módulos del Sistema
- Recepción: Registro inicial de solicitudes
- Trabajo Social: Verificación de solicitudes mediante visitas
- Almacén: Gestión de inventario y preparación de entregas
- Administración: Aprobación y gestión general
- Reportes: Estadísticas e informes de gestión

## Procesos Principales
1. Registro de ciudadano y solicitud
2. Verificación por Trabajo Social
3. Aprobación administrativa
4. Preparación de materiales
5. Entrega al ciudadano
6. Cierre de solicitud

## Documentos Comunes
- Cédula de identidad
- Recibo de servicios
- Fotos de vivienda
- Informe de visita social
- Acta de entrega

## Indicadores Clave (KPIs)
- Tiempo promedio de procesamiento
- Tasa de aprobación
- Cantidad de solicitudes por estado
- Volumen de materiales entregados
- Eficiencia de visitas de Trabajo Social

## Casos de Uso Comunes
- Consulta de estado de solicitud
- Búsqueda de ciudadano por cédula
- Registro de nueva solicitud
- Programación de visita social
- Generación de reportes mensuales
- Preparación de kit de materiales

## Recomendaciones para el Agente
- Proporcionar respuestas claras sobre el proceso de solicitud
- Explicar los requisitos para cada tipo de ayuda
- Ofrecer información sobre tiempos estimados de proceso
- Facilitar información sobre documentación necesaria
- Orientar sobre próximos pasos según el estado de solicitud
`;

  return (
    <AIContext.Provider value={{ context }}>
      {children}
    </AIContext.Provider>
  );
};

export default AIContextProvider; 