import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaComments, FaSpinner, FaExclamation } from 'react-icons/fa';
import { useAIContext } from './utils/AIContextProvider';
import './AIAgent.css';

/**
 * Agente de Inteligencia Artificial avanzado
 * 
 * Este componente implementa un asistente virtual con capacidad de:
 * - Procesar lenguaje natural
 * - Entender el contexto completo del sistema
 * - Mantener memoria de conversaciones
 * - Proporcionar respuestas contextualizadas
 * - Razonar sobre información disponible
 */
const AIAgent = () => {
  const { context } = useAIContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [errorState, setErrorState] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);
  
  // Focus en el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Análisis semántico de la consulta
  const analyzeQuery = (query) => {
    // Identificar la intención principal de la consulta
    const intentions = {
      consulta_estado: /estado|situación|avance|progreso|solicitud/i,
      documentos: /documento|documentación|papel|archivo|adjunto|cédula|comprobante/i,
      proceso: /proceso|flujo|procedimiento|pasos|cómo funciona|cómo hacer/i,
      tiempos: /tiempo|duración|cuánto tarda|plazo|cuándo/i,
      materiales: /material|materiales|recursos|insumos|kit/i,
      trabajoSocial: /trabajo social|asistente social|visita|trabajador social/i
    };

    // Determinar categorías de la consulta
    const categories = Object.entries(intentions)
      .filter(([_, regex]) => regex.test(query))
      .map(([category, _]) => category);

    return {
      categories: categories.length > 0 ? categories : ['general'],
      keywords: query.toLowerCase().split(/\s+/).filter(word => word.length > 3),
      isQuestion: /\?|cómo|qué|cuál|cuándo|dónde|por qué|quién/i.test(query)
    };
  };

  // Extraer conocimiento específico según análisis
  const extractKnowledge = (analysis) => {
    // Base de conocimiento por categoría
    const knowledgeBase = {
      consulta_estado: [
        "El estado de una solicitud puede ser: Pendiente, Verificado, Aprobado, En Entrega o Completado.",
        "Para verificar el estado, ve a la sección 'Solicitudes' y usa el buscador con el número o DNI.",
        "Cada cambio de estado genera una entrada en el historial de la solicitud para seguimiento.",
        "Las solicitudes con estado 'Pendiente' están esperando verificación de Trabajo Social."
      ],
      documentos: [
        "Los documentos requeridos incluyen: cédula de identidad, comprobante de domicilio, y documentos específicos según el tipo de solicitud.",
        "Los documentos se pueden visualizar en la pestaña 'Documentos' de cada solicitud.",
        "Es posible descargar los documentos desde la interfaz de detalles de la solicitud.",
        "Los documentos deben estar en formato PDF o imágenes (JPG, PNG)."
      ],
      proceso: [
        "El flujo completo del proceso es: Recepción > Trabajo Social > Aprobación > Almacén > Entrega.",
        "Cada solicitud debe pasar por verificación antes de ser aprobada.",
        "El sistema permite dar seguimiento a cada paso del proceso.",
        "Las aprobaciones son gestionadas por diferentes departamentos según el tipo de solicitud."
      ],
      tiempos: [
        "El tiempo promedio de procesamiento es de 7-10 días hábiles para solicitudes regulares.",
        "Las solicitudes urgentes pueden procesarse en 3-5 días hábiles.",
        "La verificación por Trabajo Social toma aproximadamente 2-3 días.",
        "La entrega de materiales puede tardar 1-2 días adicionales después de la aprobación."
      ],
      materiales: [
        "Los materiales se asignan según el tipo de solicitud y necesidad verificada.",
        "El inventario de materiales se gestiona desde el módulo de Almacén.",
        "Se puede solicitar un kit estándar o materiales específicos según el caso.",
        "La entrega de materiales requiere verificación previa de disponibilidad."
      ],
      trabajoSocial: [
        "Trabajo Social realiza visitas para verificar las condiciones y necesidades reales.",
        "Las visitas se programan dentro de los 5 días hábiles siguientes a la solicitud.",
        "El informe de Trabajo Social es determinante para la aprobación.",
        "Se puede reprogramar una visita si el ciudadano no se encuentra disponible."
      ],
      general: [
        "El sistema gestiona el proceso completo desde la solicitud hasta la entrega.",
        "Puedes consultar el estado de solicitudes, programar visitas y gestionar la entrega de materiales.",
        "El historial permite ver todos los cambios y acciones realizadas en cada solicitud.",
        "Los reportes proporcionan estadísticas sobre solicitudes, aprobaciones y entregas."
      ]
    };

    // Seleccionar información relevante según categorías identificadas
    const relevantInfo = analysis.categories.flatMap(category => 
      knowledgeBase[category] || knowledgeBase.general
    );

    return relevantInfo;
  };

  // Generar respuesta estructurada
  const generateStructuredResponse = (query, knowledge) => {
    // Analizar la consulta
    const analysis = analyzeQuery(query);
    
    // Obtener conocimiento relevante
    const relevantKnowledge = extractKnowledge(analysis);
    
    // Seleccionar piezas de información más relevantes (máx. 3)
    const selectedInfo = relevantKnowledge
      .sort((a, b) => {
        const aRelevance = analysis.keywords.filter(kw => a.toLowerCase().includes(kw)).length;
        const bRelevance = analysis.keywords.filter(kw => b.toLowerCase().includes(kw)).length;
        return bRelevance - aRelevance;
      })
      .slice(0, 3);
    
    // Construir respuesta
    let response = "";
    
    // Si es pregunta específica, dar respuesta directa
    if (analysis.isQuestion && selectedInfo.length > 0) {
      response = selectedInfo[0];
      
      // Añadir información complementaria si está disponible
      if (selectedInfo.length > 1) {
        response += "\n\nAdemás, ten en cuenta que: " + selectedInfo[1];
      }
    } 
    // Si no es pregunta específica, combinar información
    else {
      response = "Basado en tu consulta sobre " + 
        analysis.categories.map(c => c.replace('_', ' ')).join(' y ') + 
        ", puedo informarte que:\n\n";
      
      response += selectedInfo.join("\n\n");
    }
    
    // Añadir sugerencia si hay poca información relevante
    if (selectedInfo.length < 2) {
      response += "\n\n¿Necesitas más información específica sobre algún aspecto del proceso?";
    }
    
    return response;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    // Agregamos el mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setThinking(true);
    
    // Proceso de "pensamiento" del agente
    setTimeout(() => {
      try {
        setThinking(false);
        
        // Generar respuesta basada en análisis y razonamiento
        const response = generateStructuredResponse(userMessage.text, context);
        
        // Agregar respuesta del asistente
        const assistantMessage = {
          id: Date.now() + 1,
          text: response,
          sender: 'assistant'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al generar respuesta:', error);
        setErrorState('Ha ocurrido un error al procesar tu consulta');
        
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta de nuevo con una pregunta diferente.',
          sender: 'assistant',
          isError: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        
        // Limpiar error después de mostrarlo
        setTimeout(() => setErrorState(null), 3000);
      }
    }, 1500);
  };
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Si es la primera vez que se abre, mostrar mensaje de bienvenida
    if (!isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: '¡Hola! Soy el Agente IA de la Junta Comunal. Puedo ayudarte con información sobre solicitudes, procesos, documentos y más. ¿En qué puedo asistirte hoy?',
        sender: 'assistant'
      };
      setMessages([welcomeMessage]);
    }
  };
  
  return (
    <div className="ai-agent-container">
      {isOpen && (
        <div className="ai-agent-chat">
          <div className="ai-agent-header">
            <div className="ai-agent-title">
              <FaRobot /> Agente IA
            </div>
            <button className="ai-agent-close" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>
          
          <div className="ai-agent-messages">
            {messages.length === 0 ? (
              <div className="ai-agent-welcome">
                <div className="ai-agent-welcome-icon">
                  <FaRobot />
                </div>
                <h3>¡Bienvenido al Agente IA!</h3>
                <p>Asistente inteligente para la gestión de solicitudes comunitarias</p>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`ai-agent-message ${message.sender} ${message.isError ? 'error' : ''}`}
                  >
                    {message.text}
                  </div>
                ))}
                {thinking && (
                  <div className="ai-agent-message assistant thinking">
                    <div className="thinking-indicator">
                      <FaSpinner className="thinking-spinner" />
                      <span>Analizando consulta...</span>
                    </div>
                  </div>
                )}
                {isLoading && !thinking && (
                  <div className="ai-agent-message assistant">
                    <div className="ai-agent-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                {errorState && (
                  <div className="ai-agent-error">
                    <FaExclamation /> {errorState}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          <form className="ai-agent-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu consulta aquí..."
              disabled={isLoading}
            />
            <button type="submit" disabled={!inputValue.trim() || isLoading}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
      
      <button 
        className={`ai-agent-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Abrir asistente virtual"
      >
        <FaRobot />
      </button>
    </div>
  );
};

export default AIAgent; 