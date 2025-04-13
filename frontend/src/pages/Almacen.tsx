import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaClipboardList, FaTimes } from 'react-icons/fa';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  unidad: string;
  stock: number;
  stockMinimo: number;
  categoria: string;
}

const Almacen: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState<Omit<Producto, 'id'>>({
    codigo: '',
    nombre: '',
    unidad: '',
    stock: 0,
    stockMinimo: 0,
    categoria: ''
  });
  
  // Mock data
  useEffect(() => {
    // Simulación de carga de datos de API
    setTimeout(() => {
      const mockProductos: Producto[] = [
        { id: 1, codigo: 'MAT-001', nombre: 'Cemento', unidad: 'Saco', stock: 15, stockMinimo: 5, categoria: 'Construcción' },
        { id: 2, codigo: 'MAT-002', nombre: 'Arena', unidad: 'M³', stock: 8, stockMinimo: 3, categoria: 'Construcción' },
        { id: 3, codigo: 'MAT-003', nombre: 'Bloques', unidad: 'Unidad', stock: 200, stockMinimo: 50, categoria: 'Construcción' },
        { id: 4, codigo: 'MAT-004', nombre: 'Tubo PVC 4"', unidad: 'Unidad', stock: 25, stockMinimo: 10, categoria: 'Plomería' },
        { id: 5, codigo: 'MAT-005', nombre: 'Zinc 12\'', unidad: 'Lámina', stock: 18, stockMinimo: 8, categoria: 'Techado' },
      ];
      setProductos(mockProductos);
      setFilteredProductos(mockProductos);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar productos
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos]);

  // Función para manejar eliminación (sin implementación real)
  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      setProductos(prevProductos => prevProductos.filter(producto => producto.id !== id));
    }
  };

  // Función para exportar inventario
  const exportarInventario = () => {
    alert('Funcionalidad de exportar inventario pendiente de implementación');
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: name === 'stock' || name === 'stockMinimo' ? parseInt(value) || 0 : value
    });
  };

  // Registrar nuevo producto
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const productoCompleto = {
      ...nuevoProducto,
      id: nuevoId
    };
    
    setProductos([...productos, productoCompleto]);
    
    // Resetear formulario
    setNuevoProducto({
      codigo: '',
      nombre: '',
      unidad: '',
      stock: 0,
      stockMinimo: 0,
      categoria: ''
    });
    
    setShowModal(false);
  };

  // Productos con bajo stock
  const productosConBajoStock = filteredProductos.filter(p => p.stock <= p.stockMinimo);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          <FaBoxOpen className="inline mr-2" /> Gestión de Almacén
        </h1>
        <div className="space-x-2">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="mr-2" /> Registrar Producto
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={exportarInventario}
          >
            <FaClipboardList className="mr-2" /> Exportar Inventario
          </button>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {productosConBajoStock.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">¡Atención! Stock bajo en {productosConBajoStock.length} producto(s)</p>
          <p>Hay productos que están por debajo del nivel mínimo recomendado.</p>
        </div>
      )}

      {/* Filtro de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, código o categoría..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de productos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">Cargando...</td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">No se encontraron productos.</td>
                </tr>
              ) : (
                filteredProductos.map(producto => (
                  <tr key={producto.id} className={producto.stock <= producto.stockMinimo ? "bg-yellow-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.unidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        producto.stock <= producto.stockMinimo 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => alert(`Editar producto: ${producto.nombre}`)}
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(producto.id)}
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Próximas Entregas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximas Entregas</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">No hay entregas programadas próximamente.</p>
        </div>
      </div>

      {/* Modal para registrar nuevo producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Registrar Nuevo Producto</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <input 
                    type="text" 
                    name="codigo" 
                    value={nuevoProducto.codigo} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={nuevoProducto.nombre} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <input 
                    type="text" 
                    name="unidad" 
                    value={nuevoProducto.unidad} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <input 
                    type="text" 
                    name="categoria" 
                    value={nuevoProducto.categoria} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Inicial</label>
                    <input 
                      type="number" 
                      name="stock" 
                      value={nuevoProducto.stock} 
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                    <input 
                      type="number" 
                      name="stockMinimo" 
                      value={nuevoProducto.stockMinimo} 
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Almacen; 