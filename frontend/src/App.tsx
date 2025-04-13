import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link, BrowserRouter } from "react-router-dom";
// @ts-ignore
import Dashboard from './pages/Dashboard';
// @ts-ignore
import Login from './pages/Login';
// @ts-ignore
import Register from './pages/Register';
// @ts-ignore
import RecoverPassword from './pages/RecoverPassword';
// @ts-ignore
import ResetPassword from './pages/ResetPassword';
// @ts-ignore
import Solicitudes from './pages/Solicitudes';
// @ts-ignore
import DetalleSolicitud from './pages/DetalleSolicitud';
// @ts-ignore
import TrabajoSocial from './pages/TrabajoSocial';
// @ts-ignore
import DetalleTrabajoSocial from './pages/DetalleTrabajoSocial';
// @ts-ignore
import Representante from './pages/Representante';
// @ts-ignore
import DespachoSuperior from './pages/DespachoSuperior';
// @ts-ignore
import DetalleDespachoSuperior from './pages/DetalleDespachoSuperior';
// @ts-ignore
import NuevaSolicitud from './pages/NuevaSolicitud';
// @ts-ignore
import Layout from './components/Layout';
// @ts-ignore
import DetalleRepresentante from './components/DetalleRepresentante';
// @ts-ignore
import AgenteIA from './pages/AgenteIA';
// @ts-ignore
import AIAgent from './AIAgent';
// @ts-ignore
import Configuracion from './pages/Configuracion';
// @ts-ignore
import AdminUsuarios from './pages/AdminUsuarios';
// @ts-ignore
import AdminSetup from './pages/AdminSetup';
// @ts-ignore
import FixAccount from './pages/FixAccount';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import { UserRole } from './services/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

// Middleware mejorado para protección de rutas
const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const auth = useAuth();
  const { isAuthenticated, loading, user } = auth;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Si la autenticación falló y no está cargando, redirigir al login
    if (!isAuthenticated && !loading) {
      // No mostrar mensaje de error en página de registro o login
      const isAuthPage = location.pathname === '/register' || 
                        location.pathname === '/login';
      
      if (!isAuthPage) {
        toast.error('Debes iniciar sesión para acceder a esta página');
      }
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
    
    // Verificación de roles
    if (isAuthenticated && requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.some(role => {
        // Para IDs específicos, siempre dar acceso
        if (user.id === 'dc425d38-b183-465e-9f68-40bdc0a14e22') {
          return true;
        }
        
        // Verificar roles desde metadatos del usuario
        const userRoles = user.user_metadata?.roles || [];
        return userRoles.includes(role) || (role === UserRole.ADMIN && userRoles.includes(UserRole.ADMIN));
      });
      
      if (!hasRequiredRole) {
        toast.error('No tienes permiso para acceder a esta página');
        navigate('/');
      }
    }
  }, [isAuthenticated, loading, location.pathname, requiredRoles, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-2 text-gray-700">Cargando...</p>
      </div>
    );
  }

  // Si está autenticado, renderizar el contenido
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Mientras se redirecciona
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      <p className="ml-2 text-gray-700">Cargando...</p>
    </div>
  );
};

// Middleware para rutas públicas (que no deben ser accesibles si está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo redirigir si está autenticado y no está cargando
    if (isAuthenticated && !loading) {
      // Redirigir silenciosamente sin mostrar mensajes de error
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-2 text-gray-700">Cargando...</p>
      </div>
    );
  }

  // Para rutas públicas como registro y login, siempre mostrar el contenido
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/recover-password" element={
          <PublicRoute>
            <RecoverPassword />
          </PublicRoute>
        } />
        
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        
        {/* Rutas de acceso directo (sin protección de autenticación) */}
        <Route path="/admin-setup" element={<AdminSetup />} />
        <Route path="/fix-account" element={<FixAccount />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/solicitudes" replace />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/solicitudes" element={
          <ProtectedRoute>
            <Layout>
              <Solicitudes />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/solicitud/:id" element={
          <ProtectedRoute>
            <Layout>
              <DetalleSolicitud />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/trabajo-social" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.TRABAJADOR_SOCIAL]}>
            <Layout>
              <TrabajoSocial />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/representante" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.REPRESENTANTE]}>
            <Layout>
              <Representante />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/representante/:id" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.REPRESENTANTE]}>
            <Layout>
              <DetalleRepresentante />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/despacho-superior" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.DESPACHO]}>
            <Layout>
              <DespachoSuperior />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/despacho-superior/:id" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.DESPACHO]}>
            <Layout>
              <DetalleDespachoSuperior />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/nueva-solicitud" element={
          <ProtectedRoute>
            <Layout>
              <NuevaSolicitud />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/agente-ia" element={
          <ProtectedRoute>
            <Layout>
              <AgenteIA />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/configuracion" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <Layout>
              <Configuracion />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/usuarios" element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
            <Layout>
              <AdminUsuarios />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Ruta para página no encontrada */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Página no encontrada</h1>
              <p className="text-gray-600 mb-6">La página que intentas buscar no existe o ha sido movida.</p>
              <Link to="/" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Volver al inicio
              </Link>
            </div>
          </div>
        } />
      </Routes>
      
      {/* AI Agent - Botón flotante disponible en todas las pantallas */}
      <AIAgent />
      
      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #dcfce7',
              borderLeft: '4px solid #16a34a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #fee2e2',
              borderLeft: '4px solid #ef4444',
            },
          },
          loading: {
            iconTheme: {
              primary: '#2563eb',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #dbeafe',
              borderLeft: '4px solid #2563eb',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 