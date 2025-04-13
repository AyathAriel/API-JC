import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-gray-700">
      <FaExclamationTriangle className="text-yellow-500 text-6xl mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Página no encontrada</h2>
      <p className="text-lg mb-8 text-center">
        Lo sentimos, la página que está buscando no existe o ha sido movida.
      </p>
      <Link 
        to="/" 
        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
      >
        <FaHome className="mr-2" />
        Volver al inicio
      </Link>
    </div>
  )
}

export default NotFound 