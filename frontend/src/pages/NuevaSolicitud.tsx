import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimesCircle } from 'react-icons/fa';

const NuevaSolicitud = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una aplicación real, aquí enviaríamos los datos al servidor
    alert('Solicitud creada correctamente');
    navigate('/solicitudes');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/solicitudes')}
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Volver a solicitudes
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Solicitud</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
              Información de la Solicitud
            </h2>
            
            <div className="mb-4">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la solicitud
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                required
                placeholder="Ej: Solicitud de materiales para reparación de vivienda"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.titulo}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                rows={4}
                placeholder="Detalle su solicitud"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
              Información del Ciudadano
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula
                </label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  required
                  placeholder="Ej: 8-123-456"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.cedula}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  placeholder="Nombre"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  required
                  placeholder="Apellido"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  required
                  placeholder="Ej: 6123-4567"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  required
                  placeholder="Dirección completa"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/solicitudes')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center"
            >
              <FaTimesCircle className="mr-2" /> Cancelar
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaSave className="mr-2" /> Guardar solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaSolicitud; 