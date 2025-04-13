# Arquitectura de Autenticación del Sistema

## Componentes Principales

### 1. Servicio de Autenticación (supabase.ts)
- **Implementación**: Utiliza Supabase como proveedor de autenticación
- **Funcionalidades**:
  - Login con email y contraseña
  - Registro de usuarios
  - Cierre de sesión
  - Verificación de sesión
  - Carga y gestión de archivos (storage)

### 2. Contexto de Autenticación (AuthContext.tsx)
- **Propósito**: Provee el estado de autenticación a toda la aplicación a través de React Context
- **Estado gestionado**:
  - Usuario actual (user)
  - Estado de carga (loading)
  - Indicador de autenticación (isAuthenticated)
- **Métodos**:
  - login(email, password)
  - logout()
  - register(userData)

### 3. Hook personalizado (useAuth.ts)
- **Extiende** la funcionalidad del contexto de autenticación
- **Características adicionales**:
  - Verificación de autenticación
  - Comprobación de permisos/roles
  - Redirecciones automáticas
  - Manejo de mensajes de error (toast)

### 4. Middleware de Autenticación (authMiddleware.ts)
- **Funcionalidades**:
  - Verificación de sesión con Supabase
  - Validación de roles/permisos
  - Redirecciones basadas en autenticación/permisos
  - Middleware específico para API (apiAuthMiddleware)

## Flujo de Autenticación

1. **Inicio de Sesión**:
   - El usuario introduce credenciales en la página de Login
   - Se llama a `login()` del hook useAuth
   - El hook llama al servicio de autenticación (supabase)
   - Si es exitoso, actualiza el contexto con la información del usuario
   - Redirecciona a la ruta protegida

2. **Verificación de Rutas Protegidas**:
   - Componentes `ProtectedRoute` y `PublicRoute` en App.tsx
   - Comprueban el estado de autenticación usando useAuth
   - Redirigen según el estado y los permisos requeridos
   - Muestran indicadores de carga durante las transiciones

3. **Cierre de Sesión**:
   - El usuario hace clic en "Cerrar Sesión"
   - Se llama a `logout()` del hook useAuth
   - El hook llama al servicio para cerrar sesión en Supabase
   - Limpia el estado del usuario en el contexto
   - Redirecciona a la página de login

## Gestión de Roles

- Se infiere el rol del usuario a partir del correo electrónico:
  - admin: email contiene "admin"
  - trabajador_social: email contiene "trabajosocial"
  - despacho: email contiene "despacho"
  - representante: email contiene "representante"
  - Por defecto: "usuario"

- Las rutas protegidas pueden especificar roles requeridos:
  ```jsx
  <ProtectedRoute requiredRoles={['admin', 'trabajador_social']}>
    <Component />
  </ProtectedRoute>
  ```

## Puntos de Mejora Potenciales

1. Implementar gestión de roles más robusta en base de datos
2. Añadir autenticación con proveedores sociales (Google, Facebook)
3. Implementar verificación de correo electrónico
4. Añadir recuperación de contraseña
5. Mejorar la gestión de tokens (refresh tokens)
6. Implementar autenticación de dos factores (2FA) 