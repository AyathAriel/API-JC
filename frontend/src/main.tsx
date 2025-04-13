import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ConfigProvider } from './context/ConfigContext'
import { ToastProvider } from './context/ToastContext'
import Toast from './components/ui/Toast'
import { AIContextProvider } from './utils/AIContextProvider'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './context/AuthContext'

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#16a34a', // verde de la app
    },
    secondary: {
      main: '#4f46e5', // indigo
    },
    error: {
      main: '#ef4444', // rojo
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

// Configuración de errores no capturados para facilitar depuración
window.addEventListener('error', (event) => {
  console.error('Error no capturado:', event.error)
})

// Configuración para autenticación y entorno de desarrollo
if (import.meta.env.DEV) {
  // Permitir más tiempo para operaciones asíncronas (útil para autenticación)
  setTimeout(() => {}, 100)
  
  // Configuración especial para autenticación en desarrollo
  const authOverrides = {
    allowRegistrationWithoutVerification: true,
    specialUserIds: ['dc425d38-b183-465e-9f68-40bdc0a14e22'],
  }
  
  // Almacenar en localStorage para acceso global
  localStorage.setItem('dev.auth.config', JSON.stringify(authOverrides))
  
  console.info('Configuración de desarrollo activada')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ConfigProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Toast />
              <AIContextProvider>
                <App />
              </AIContextProvider>
            </ThemeProvider>
          </ConfigProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 