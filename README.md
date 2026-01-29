# 🏥 PLATAFORMA ADMINISTRATIVA DE TELEMEDICINA

## 📋 Descripción
Plataforma administrativa completa con sistema de roles, autenticación JWT, y dashboard moderno para gestión de telemedicina.

## 🎯 Características Principales

### 1. **Capa de Administración**
- ✅ Sistema de roles y permisos granulares
- ✅ Gestión completa de usuarios
- ✅ Configuraciones globales del sistema
- ✅ Registro de actividad (logs)

### 2. **Capa de Dashboard/Datos**
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gráficos interactivos (Chart.js)
- ✅ Métricas de usuarios y actividad
- ✅ Visualización de datos por rol

### 3. **Capa de Usuarios**
- ✅ Autenticación JWT segura
- ✅ 5 niveles de roles predefinidos:
  - Super Administrador
  - Administrador
  - Moderador
  - Usuario Premium
  - Usuario Básico
- ✅ Permisos configurables por módulo

### 4. **Capa de Interconexión**
- ✅ Sistema de integraciones externas
- ✅ Webhooks configurables
- ✅ API RESTful completa
- ✅ Logs de integraciones

## 🚀 Instalación

### Requisitos
- Node.js v14 o superior
- MySQL 5.7 o superior
- Git

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/seoz1985/PLATAFORMA-INTEGRAL-DE-TELEMEDICINA.git
cd PLATAFORMA-INTEGRAL-DE-TELEMEDICINA
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
- Crear la base de datos en MySQL
- Importar el esquema: `database/schema.sql`
```bash
mysql -u usuario -p nombre_base_datos < database/schema.sql
```

4. **Configurar variables de entorno**
- Copiar `.env.example` a `.env`
- Configurar las credenciales de MySQL
```bash
cp .env.example .env
```

5. **Iniciar el servidor**
```bash
node backend/index.js
```

El servidor estará disponible en: `http://localhost:3000`

## 📊 Estructura del Proyecto

```
telemedicina/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración MySQL
│   ├── controllers/
│   │   ├── authController.js    # Autenticación
│   │   └── dashboardController.js # Dashboard
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación
│   ├── routes/
│   │   ├── authRoutes.js        # Rutas de auth
│   │   ├── dashboardRoutes.js   # Rutas de dashboard
│   │   └── userRoutes.js        # Rutas de usuarios
│   └── index.js                 # Servidor principal
├── frontend/
│   ├── css/
│   │   ├── styles.css           # Estilos globales
│   │   └── dashboard.css        # Estilos del dashboard
│   ├── js/
│   │   ├── api.js               # Cliente API
│   │   ├── login.js             # Login
│   │   └── dashboard.js         # Dashboard
│   ├── index.html               # Página de login
│   └── dashboard.html           # Dashboard principal
├── database/
│   └── schema.sql               # Esquema de base de datos
├── .env                         # Variables de entorno
└── package.json                 # Dependencias

```

## 🔐 Seguridad

- **JWT** para autenticación
- **Bcrypt** para encriptación de contraseñas
- **Middleware** de autorización por roles y permisos
- **Logs** de todas las acciones del sistema
- **Sesiones** con expiración automática

## 🎨 Tecnologías Utilizadas

### Backend
- Node.js + Express
- MySQL2 (conexión a MySQL)
- JWT (autenticación)
- Bcrypt (encriptación)
- CORS
- Express Validator

### Frontend
- HTML5 + CSS3
- JavaScript (Vanilla)
- Chart.js (gráficos)
- Font Awesome (iconos)
- Diseño responsive

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil

### Dashboard
- `GET /api/dashboard/estadisticas` - Estadísticas generales
- `GET /api/dashboard/modulos` - Módulos disponibles
- `GET /api/dashboard/actividad` - Actividad del usuario

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

## 👥 Roles y Permisos

### Roles Predefinidos

1. **Super Administrador** (Nivel 5)
   - Acceso total a la plataforma
   - Gestión de todos los módulos
   - Configuración del sistema

2. **Administrador** (Nivel 4)
   - Gestión de usuarios
   - Acceso a reportes
   - Configuraciones limitadas

3. **Moderador** (Nivel 3)
   - Supervisión de actividad
   - Moderación de contenido

4. **Usuario Premium** (Nivel 2)
   - Acceso a funcionalidades avanzadas

5. **Usuario Básico** (Nivel 1)
   - Acceso básico a la plataforma

### Permisos por Módulo
Cada módulo puede tener permisos para:
- `leer` - Ver información
- `crear` - Crear nuevos registros
- `actualizar` - Modificar registros
- `eliminar` - Eliminar registros
- `ejecutar` - Ejecutar acciones especiales

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de Datos
DB_HOST=127.0.0.1
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_datos
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3000/api
```

## 📱 Responsive Design

La plataforma es completamente responsive y funciona en:
- 💻 Desktop
- 📱 Tablets
- 📱 Móviles

## 🔄 Actualizaciones Futuras

- [ ] Panel de gestión de módulos
- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat integrado
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Panel de configuración de integraciones
- [ ] Sistema de permisos avanzados
- [ ] Auditoría de cambios
- [ ] Autenticación de dos factores (2FA)

## 📞 Soporte

Para soporte o consultas:
- Email: admin@meditel.com.co
- Web: https://meditel.com.co

## 📄 Licencia

© 2026 Plataforma Telemedicina. Todos los derechos reservados.

---

**Creado con ❤️ para Meditel Colombia**
