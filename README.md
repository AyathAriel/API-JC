# Sistema de Gestión de Solicitudes - Juntas Comunales Panamá

Aplicación Full Stack para la gestión de solicitudes de Juntas Comunales en Panamá.

## Tecnologías

### Backend
- Python con Django y Django REST Framework
- PostgreSQL (Supabase)
- Django ORM
- JWT para autenticación

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase Auth

### Infraestructura
- Docker para desarrollo local
- Railway para despliegue del backend
- Vercel para despliegue del frontend

## Estructura del Proyecto

```
.
├── backend/               # API Django
│   ├── core/              # Configuración principal
│   ├── apps/              # Aplicaciones Django
│   │   ├── users/         # Gestión de usuarios
│   │   ├── solicitudes/   # Gestión de solicitudes
│   │   ├── inspecciones/  # Inspecciones de trabajo social
│   │   └── entregas/      # Gestión de entregas
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── auth/          # Autenticación
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios y API
│   │   └── routes/        # Configuración de rutas
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Configuración Docker
└── README.md
```

## Flujo de la Aplicación

1. El ciudadano ingresa una solicitud (Recepción)
2. El Representante evalúa y aprueba o rechaza la solicitud
3. Si se aprueba, Trabajo Social programa una inspección
4. Tras inspeccionar, Trabajo Social aprueba o rechaza
5. Si se aprueba, Almacén programa y realiza la entrega de recursos

## Instalación y Configuración

### Requisitos
- Docker y Docker Compose
- Node.js 18+
- Python 3.11+
- Cuenta en Supabase

### Configuración Local

1. Clonar el repositorio:
```
git clone https://github.com/tu-usuario/jc-panama.git
cd jc-panama
```

2. Configurar variables de entorno:
```
cp .env.example .env
cp frontend/.env.example frontend/.env
```
Edita los archivos `.env` con tus credenciales.

3. Iniciar los servicios con Docker:
```
docker-compose up -d
```

4. Crear superusuario en Django:
```
docker-compose exec backend python manage.py createsuperuser
```

5. Acceder a la aplicación:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Django: http://localhost:8000/admin

## Desarrollo

### Backend
```
cd backend
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## Despliegue

### Backend (Railway)
1. Configura tu proyecto en Railway
2. Conecta con el repositorio Git
3. Configura las variables de entorno
4. Railway desplegará automáticamente

### Frontend (Vercel)
1. Importa el proyecto en Vercel
2. Configura el directorio de construcción: `frontend`
3. Configura las variables de entorno
4. Vercel desplegará automáticamente

## Licencia
Este proyecto está bajo la Licencia MIT. 