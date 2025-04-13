import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
// @ts-ignore
import Dashboard from './pages/Dashboard';
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
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/solicitudes" replace />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/solicitud/:id" element={<DetalleSolicitud />} />
          <Route path="/trabajo-social" element={<TrabajoSocial />} />
          <Route path="/representante" element={<Representante />} />
          <Route path="/representante/:id" element={<DetalleRepresentante />} />
          <Route path="/despacho-superior" element={<DespachoSuperior />} />
          <Route path="/despacho-superior/:id" element={<DetalleDespachoSuperior />} />
          <Route path="/nueva-solicitud" element={<NuevaSolicitud />} />
          <Route path="/agente-ia" element={<AgenteIA />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<div>No encontrado</div>} />
        </Routes>
      </Layout>
      
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

export default App; 