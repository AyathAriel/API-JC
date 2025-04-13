import { Link } from 'react-router-dom'

const NoEncontrado = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">¡Página no encontrada!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <Link 
          to="/"
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NoEncontrado 