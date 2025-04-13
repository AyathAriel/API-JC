import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from './context/ConfigContext'
import { ToastProvider } from './context/ToastContext'
import Toast from './components/ui/Toast'
import { AIContextProvider } from './utils/AIContextProvider'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ConfigProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toast />
            <AIContextProvider>
              <App />
            </AIContextProvider>
          </ThemeProvider>
        </ConfigProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 