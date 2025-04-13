import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import { Toast as ToastType, useToast } from '../../context/ToastContext'

interface ToastProps {
  toast: ToastType
}

// Componente individual para cada toast
const ToastItem: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast()
  const [isExiting, setIsExiting] = useState(false)

  // Clases y configuración según el tipo de toast
  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="text-white" size={16} />,
          bgColor: 'bg-green-600',
          borderColor: 'border-green-800'
        }
      case 'error':
        return {
          icon: <FaExclamationCircle className="text-white" size={16} />,
          bgColor: 'bg-red-600',
          borderColor: 'border-red-800'
        }
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-white" size={16} />,
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-700'
        }
      case 'info':
      default:
        return {
          icon: <FaInfoCircle className="text-white" size={16} />,
          bgColor: 'bg-blue-600',
          borderColor: 'border-blue-800'
        }
    }
  }

  const config = getToastConfig()

  // Animación de salida
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 300) // Tiempo de animación
  }

  return (
    <div
      className={`flex items-center ${config.bgColor} text-white px-4 py-3 rounded-md shadow-lg border-l-4 ${
        config.borderColor
      } mb-3 transform transition-all duration-300 ease-in-out ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">{config.icon}</div>
      <div className="flex-1">{toast.message}</div>
      <button
        className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none"
        onClick={handleClose}
      >
        <FaTimes size={14} />
      </button>
    </div>
  )
}

// Contenedor para todos los toasts
const Toast: React.FC = () => {
  const { toasts } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-72 max-w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default Toast 