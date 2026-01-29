-- ESQUEMA DE BASE DE DATOS - PLATAFORMA ADMINISTRATIVA TELEMEDICINA

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_acceso INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Módulos del Sistema
CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    ruta VARCHAR(255),
    orden INT DEFAULT 0,
    modulo_padre_id INT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_padre_id) REFERENCES modulos(id) ON DELETE SET NULL
);

-- Tabla de Permisos
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modulo_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL COMMENT 'crear, leer, actualizar, eliminar, ejecutar',
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_permiso (modulo_id, accion)
);

-- Tabla de Roles - Permisos (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS roles_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rol_permiso (rol_id, permiso_id)
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    avatar_url VARCHAR(255),
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    ultimo_login TIMESTAMP NULL,
    token_recuperacion VARCHAR(255),
    token_expiracion TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de Sesiones
CREATE TABLE IF NOT EXISTS sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_usuario (usuario_id)
);

-- Tabla de Configuraciones Globales
CREATE TABLE IF NOT EXISTS configuraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'string' COMMENT 'string, number, boolean, json',
    descripcion TEXT,
    categoria VARCHAR(50),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Logs de Actividad
CREATE TABLE IF NOT EXISTS logs_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(100),
    descripcion TEXT,
    ip_address VARCHAR(45),
    datos_adicionales JSON,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_creacion)
);

-- Tabla de Integraciones Externas
CREATE TABLE IF NOT EXISTS integraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) COMMENT 'api, webhook, oauth',
    url_base VARCHAR(255),
    api_key VARCHAR(255),
    configuracion JSON,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    metodo VARCHAR(10) DEFAULT 'POST',
    eventos JSON COMMENT 'Array de eventos que disparan el webhook',
    headers JSON,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Logs de Integraciones
CREATE TABLE IF NOT EXISTS logs_integraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    integracion_id INT,
    tipo VARCHAR(50),
    estado VARCHAR(20) COMMENT 'exitoso, fallido, pendiente',
    request_data JSON,
    response_data JSON,
    error_mensaje TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integracion_id) REFERENCES integraciones(id) ON DELETE SET NULL,
    INDEX idx_integracion (integracion_id),
    INDEX idx_fecha (fecha_creacion)
);

-- DATOS INICIALES

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion, nivel_acceso) VALUES
('Super Administrador', 'Acceso completo a toda la plataforma', 5),
('Administrador', 'Gestión de usuarios y configuraciones', 4),
('Moderador', 'Supervisión y moderación de contenido', 3),
('Usuario Premium', 'Acceso a funcionalidades avanzadas', 2),
('Usuario Básico', 'Acceso básico a la plataforma', 1);

-- Insertar módulos principales
INSERT INTO modulos (nombre, descripcion, icono, ruta, orden) VALUES
('Dashboard', 'Panel principal con estadísticas', 'dashboard', '/admin/dashboard', 1),
('Usuarios', 'Gestión de usuarios del sistema', 'users', '/admin/usuarios', 2),
('Roles y Permisos', 'Administración de roles y permisos', 'shield', '/admin/roles', 3),
('Configuración', 'Configuraciones generales del sistema', 'settings', '/admin/configuracion', 4),
('Integraciones', 'Gestión de integraciones externas', 'link', '/admin/integraciones', 5),
('Reportes', 'Informes y análisis de datos', 'chart', '/admin/reportes', 6),
('Logs', 'Registro de actividad del sistema', 'file-text', '/admin/logs', 7);

-- Insertar permisos básicos para cada módulo
INSERT INTO permisos (modulo_id, accion, descripcion)
SELECT id, 'leer', CONCAT('Ver ', nombre) FROM modulos;

INSERT INTO permisos (modulo_id, accion, descripcion)
SELECT id, 'crear', CONCAT('Crear en ', nombre) FROM modulos WHERE nombre != 'Dashboard';

INSERT INTO permisos (modulo_id, accion, descripcion)
SELECT id, 'actualizar', CONCAT('Actualizar ', nombre) FROM modulos WHERE nombre != 'Dashboard';

INSERT INTO permisos (modulo_id, accion, descripcion)
SELECT id, 'eliminar', CONCAT('Eliminar en ', nombre) FROM modulos WHERE nombre != 'Dashboard';

-- Asignar todos los permisos al Super Administrador
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- Insertar configuraciones iniciales
INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria) VALUES
('sitio_nombre', 'Plataforma Telemedicina', 'string', 'Nombre del sitio', 'General'),
('sitio_url', 'https://meditelesalud.com', 'string', 'URL principal del sitio', 'General'),
('session_timeout', '3600', 'number', 'Tiempo de expiración de sesión en segundos', 'Seguridad'),
('max_intentos_login', '5', 'number', 'Máximo de intentos de login fallidos', 'Seguridad'),
('email_notificaciones', 'admin@meditel.com.co', 'string', 'Email para notificaciones', 'Notificaciones'),
('modo_mantenimiento', 'false', 'boolean', 'Activar modo mantenimiento', 'General');
