import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResetComplete, setIsResetComplete] = useState(false)
  const [hasResetToken, setHasResetToken] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Comprobar si la URL actual contiene parámetros de restablecimiento de contraseña
    const hash = window.location.hash
    setHasResetToken(hash.includes('type=recovery'))
    
    if (!hash.includes('type=recovery')) {
      toast.error('Enlace de restablecimiento inválido o expirado')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error(error.message)
      } else {
        setIsResetComplete(true)
        toast.success('Tu contraseña ha sido actualizada correctamente')
        // Redirigir después de un breve período
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error)
      toast.error('Ocurrió un error al restablecer tu contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Restablecer Contraseña</h1>
          <p className="text-gray-600">Crea una nueva contraseña para tu cuenta</p>
        </div>

        {!hasResetToken && (
          <div className="bg-red-50 p-4 rounded border border-red-200 mb-6">
            <h2 className="font-bold text-red-700 mb-2">Enlace inválido</h2>
            <p className="text-red-600 mb-2">
              El enlace de restablecimiento es inválido o ha expirado.
            </p>
            <p className="text-sm text-red-600">
              Por favor, solicita un nuevo enlace de restablecimiento.
            </p>
          </div>
        )}

        {isResetComplete ? (
          <div className="bg-green-50 p-4 rounded border border-green-200 mb-6">
            <h2 className="font-bold text-green-700 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-green-600 mb-2">
              Tu contraseña ha sido restablecida correctamente.
            </p>
            <p className="text-sm text-green-600">
              Serás redirigido a la página de inicio de sesión en unos segundos...
            </p>
          </div>
        ) : (
          hasResetToken && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Nueva Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )
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

export default ResetPassword 