import React, { useEffect, useState } from 'react';
import { 
  FaRobot, 
  FaInfoCircle, 
  FaQuestionCircle, 
  FaCogs, 
  FaBook, 
  FaRegLightbulb, 
  FaClipboardList
} from 'react-icons/fa';
import AIAgent from '../AIAgent';
import { useAIContext } from '../utils/AIContextProvider';

const AgenteIA: React.FC = () => {
  const [activeTab, setActiveTab] = useState('asistente');
  
  // Asegurarse de que el título de la página sea el correcto
  useEffect(() => {
    document.title = 'Agente IA | Juntas Comunales';
  }, []);

  const { context } = useAIContext();
  
  // Definir pestañas para la navegación horizontal
  const tabs = [
    { id: 'asistente', label: 'Asistente Virtual', icon: <FaRobot /> },
    { id: 'documentacion', label: 'Documentación', icon: <FaBook /> },
    { id: 'capacidades', label: 'Capacidades', icon: <FaRegLightbulb /> },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: <FaQuestionCircle /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaRobot className="mr-3 text-green-600" />
          Agente de Inteligencia Artificial
        </h1>
      </div>
      
      <p className="text-gray-600 mb-6">
        Sistema inteligente que utiliza procesamiento de lenguaje natural para asistir en la gestión de solicitudes
      </p>
      
      {/* Navegación por pestañas - Horizontal */}
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
        
        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'asistente' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel principal del Agente IA */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <FaRobot className="mr-2 text-green-600" />
                    Asistente Virtual Avanzado
                  </h2>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <div className="flex items-start">
                      <FaInfoCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-green-800">Asistente con contexto completo del sistema</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Este asistente cuenta con acceso a información sobre solicitudes, ciudadanos, 
                          procesos y estados del sistema. Puede responder consultas, buscar información 
                          y proporcionar orientación sobre los procedimientos.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      ¿Qué puedes preguntar al asistente?
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Información sobre estados de solicitudes y su procesamiento
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Consultas sobre documentación requerida para trámites
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Ayuda con procesos específicos del sistema
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Búsqueda de información sobre solicitudes y ciudadanos
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Aclaración de dudas sobre flujos de trabajo y requisitos
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-800 mb-2 flex items-center">
                      <FaQuestionCircle className="mr-2 text-green-600" />
                      Inicia una conversación con el asistente
                    </div>
                    <p className="text-gray-600 text-sm">
                      Utiliza el botón flotante del asistente en la esquina inferior derecha para iniciar 
                      una conversación. El asistente está disponible en todas las pantallas del sistema.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Panel lateral de información */}
              <div>
                <div className="bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <FaCogs className="mr-2 text-green-600" />
                    Especificaciones Técnicas
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Modelo de lenguaje</h3>
                      <p className="text-gray-800">Procesamiento de lenguaje natural avanzado</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Base de conocimiento</h3>
                      <p className="text-gray-800">Sistema completo de gestión de solicitudes</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Integración</h3>
                      <p className="text-gray-800">Conectado con todos los módulos del sistema</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-600 font-medium mb-1">Actualizaciones</h3>
                      <p className="text-gray-800">Base de conocimiento actualizada regularmente</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Capacidades del asistente</h3>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Análisis de consultas en lenguaje natural
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Generación de respuestas contextualizadas
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Procesamiento de información del sistema
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Asistencia basada en el historial de la conversación
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'documentacion' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <FaBook className="mr-2 text-green-600" />
                Documentación del Asistente IA
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Arquitectura del sistema</h3>
                  <p className="text-gray-700">
                    El asistente IA está construido sobre una arquitectura moderna que combina el procesamiento 
                    de lenguaje natural con acceso a información contextual. Utiliza Langchain para la gestión de prompts, 
                    LangGraph para la coordinación de flujos y LangSmith para el monitoreo y mejora continua.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Modelos utilizados</h3>
                  <p className="text-gray-700">
                    El sistema implementa modelos de lenguaje avanzados que han sido específicamente entrenados 
                    para entender la terminología y los procesos del sistema de gestión de solicitudes.
                  </p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800">Modelo de base</h4>
                      <p className="text-sm text-gray-600">Procesa consultas generales y proporciona respuestas informativas</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800">Modelo especializado</h4>
                      <p className="text-sm text-gray-600">Optimizado para consultas específicas sobre procesos del sistema</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Integración con el sistema</h3>
                  <p className="text-gray-700">
                    El asistente se integra directamente con la base de datos y APIs del sistema, 
                    permitiéndole acceder a información actualizada sobre solicitudes, estados, usuarios y procesos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'capacidades' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <FaRegLightbulb className="mr-2 text-green-600" />
                Capacidades del Asistente IA
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Procesamiento de Lenguaje Natural</h3>
                  <p className="text-green-700 text-sm">
                    El asistente entiende consultas formuladas en lenguaje natural, identificando intenciones,
                    entidades y contexto para proporcionar respuestas relevantes y precisas.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Análisis Contextual</h3>
                  <p className="text-green-700 text-sm">
                    Mantiene el contexto de la conversación, permitiendo consultas relacionadas sin necesidad
                    de repetir información previamente proporcionada.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Acceso a Base de Conocimiento</h3>
                  <p className="text-green-700 text-sm">
                    Consulta una amplia base de conocimiento sobre procesos, regulaciones, requisitos y
                    mejores prácticas del sistema de gestión de solicitudes.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Resolución de Problemas</h3>
                  <p className="text-green-700 text-sm">
                    Identifica problemas comunes y proporciona soluciones paso a paso, orientando
                    al usuario a través de procesos complejos.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Aprendizaje Continuo</h3>
                  <p className="text-green-700 text-sm">
                    El sistema mejora constantemente basándose en interacciones previas, optimizando
                    su capacidad de respuesta y precisión.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Asistencia Proactiva</h3>
                  <p className="text-green-700 text-sm">
                    Anticipa necesidades y proporciona sugerencias relevantes basadas en el contexto
                    actual del usuario en el sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <FaQuestionCircle className="mr-2 text-green-600" />
                Preguntas Frecuentes
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">¿Qué tipo de preguntas puedo hacer al asistente?</h3>
                  <p className="text-gray-700">
                    Puedes consultar sobre procesos del sistema, estados de solicitudes, documentación requerida,
                    plazos, criterios de aprobación, y cualquier duda relacionada con el funcionamiento del sistema.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">¿El asistente puede acceder a datos específicos de solicitudes?</h3>
                  <p className="text-gray-700">
                    Sí, el asistente tiene acceso a la información de solicitudes dentro del sistema, siempre que
                    tengas los permisos necesarios para ver esa información.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">¿Cómo se mantiene actualizada la información del asistente?</h3>
                  <p className="text-gray-700">
                    El asistente se sincroniza regularmente con la base de datos del sistema y su base de conocimiento
                    se actualiza con nuevos procedimientos, requisitos y mejores prácticas.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">¿El asistente puede ayudarme a completar procesos en el sistema?</h3>
                  <p className="text-gray-700">
                    El asistente puede guiarte paso a paso a través de los procesos, pero actualmente no puede
                    realizar acciones en tu nombre. Te proporcionará instrucciones detalladas para que puedas
                    completar las tareas por ti mismo.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">¿Mis conversaciones con el asistente son privadas?</h3>
                  <p className="text-gray-700">
                    Las conversaciones se almacenan para mejorar el servicio, pero están asociadas a tu cuenta
                    y sólo tú y los administradores autorizados pueden acceder a ellas. La información sensible
                    se maneja de acuerdo con las políticas de privacidad del sistema.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">¿Qué hago si el asistente no puede responder mi pregunta?</h3>
                  <p className="text-gray-700">
                    Si el asistente no puede resolver tu consulta, te recomendará contactar al soporte técnico
                    o dirigirte al departamento correspondiente. También puedes reformular tu pregunta con más detalles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgenteIA; 