import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const RecoverPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setIsSent(true)
        toast.success('Se ha enviado un correo para recuperar tu contraseña')
      }
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error)
      toast.error('Ocurrió un error al procesar tu solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Recuperar Contraseña</h1>
          <p className="text-gray-600">
            {isSent 
              ? 'Revisa tu correo electrónico para restablecer tu contraseña' 
              : 'Introduce tu correo para recibir instrucciones'}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 p-4 rounded border border-green-200 mb-6">
            <h2 className="font-bold text-green-700 mb-2">¡Correo enviado!</h2>
            <p className="text-green-600 mb-2">
              Hemos enviado instrucciones para recuperar tu contraseña a: <strong>{email}</strong>
            </p>
            <p className="text-sm text-green-600">
              Revisa tu bandeja de entrada y sigue las instrucciones para completar el proceso.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <Link to="/login" className="text-green-600 hover:text-green-800">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Sistema de Juntas Comunales de Panamá
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecoverPassword 