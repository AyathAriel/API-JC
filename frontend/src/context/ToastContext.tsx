import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextProps {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: number) => void
}

// Crear el contexto
const ToastContext = createContext<ToastContextProps | undefined>(undefined)

// Props para el proveedor
interface ToastProviderProps {
  children: ReactNode
}

// Proveedor del contexto
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Añadir un nuevo toast
  const addToast = (message: string, type: ToastType) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, message, type }])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  // Eliminar un toast por su ID
  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: number) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  removeToast: (id: number) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, removeToast }) => {
  const { id, message, type } = toast

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'info':
        return 'bg-blue-500'
      case 'loading':
        return 'bg-indigo-500'
      default:
        return 'bg-gray-700'
    }
  }

  return (
    <div
      className={`${getBgColor()} text-white p-3 rounded shadow-lg flex justify-between items-center transition-all duration-500 ease-in-out animate-slide-in`}
    >
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="ml-2 text-white opacity-70 hover:opacity-100 focus:outline-none"
      >
        ×
      </button>
    </div>
  )
}

export default ToastProvider 