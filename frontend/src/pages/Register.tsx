import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { UserRole } from '../services/supabase'
import toast from 'react-hot-toast'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  
  // Usar opciones simplificadas para el hook
  const { register } = useAuth({
    redirectAuthenticated: false,
    loadOnMount: false
  })
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    console.log('Iniciando proceso de registro...')

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (!fullName) {
      setError('El nombre completo es requerido')
      setIsLoading(false)
      return
    }

    // Determinar roles basados en el email
    let roles: UserRole[] = [UserRole.USUARIO];
    
    if (email.includes('admin')) {
      roles = [UserRole.ADMIN];
    } else if (email.includes('trabajosocial')) {
      roles = [UserRole.TRABAJADOR_SOCIAL];
    } else if (email.includes('despacho')) {
      roles = [UserRole.DESPACHO];
    } else if (email.includes('representante')) {
      roles = [UserRole.REPRESENTANTE];
    }

    try {
      const { error: registrationError } = await register({
        email,
        password,
        fullName,
        roles,
        meta: {
          registered_at: new Date().toISOString(),
        }
      });
      
      if (registrationError) {
        console.error('Error de registro:', registrationError);
        setError('Error al registrar usuario: ' + (registrationError.message || 'Por favor intente nuevamente.'));
        setIsLoading(false);
        return;
      }
      
      // Marcar como registrado y mostrar mensaje de éxito
      setRegistered(true);
      
      // Redirección simplificada que solo ocurre una vez
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (err) {
      console.error('Error inesperado en registro:', err);
      setError('Error inesperado al registrar usuario. Por favor intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  // Si ya se registró, mostrar mensaje de éxito
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">¡Registro Exitoso!</h1>
          <p className="text-gray-600 mb-6">Tu cuenta ha sido creada correctamente.</p>
          <p className="text-gray-600 mb-8">Serás redirigido en unos segundos...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Registro de Usuario</h1>
          <p className="text-gray-600">Crea tu cuenta para acceder al sistema</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              Nombre Completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
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
            <p className="mt-1 text-xs text-gray-500">
              El rol se asignará automáticamente según el correo:
              <br />
              - admin@... para Administrador
              <br />
              - trabajosocial@... para Trabajador Social
              <br />
              - despacho@... para Despacho Superior
              <br />
              - representante@... para Representante
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
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
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-green-600 hover:text-green-800">Iniciar sesión</Link>
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

export default Register 