const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Registrar actividad en logs
async function registrarLog(usuarioId, accion, modulo, descripcion, ipAddress, datosAdicionales = null) {
  try {
    await pool.query(
      'INSERT INTO logs_actividad (usuario_id, accion, modulo, descripcion, ip_address, datos_adicionales) VALUES (?, ?, ?, ?, ?, ?)',
      [usuarioId, accion, modulo, descripcion, ipAddress, datosAdicionales ? JSON.stringify(datosAdicionales) : null]
    );
  } catch (error) {
    console.error('Error al registrar log:', error);
  }
}

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Buscar usuario
    const [usuarios] = await pool.query(
      'SELECT u.*, r.nombre as rol_nombre, r.nivel_acceso FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE (u.username = ? OR u.email = ?) AND u.activo = true',
      [username, username]
    );

    if (usuarios.length === 0) {
      await registrarLog(null, 'login_fallido', 'auth', `Intento de login con usuario inexistente: ${username}`, ipAddress);
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      await registrarLog(usuario.id, 'login_fallido', 'auth', 'Contraseña incorrecta', ipAddress);
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: usuario.id, rol: usuario.rol_nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Calcular fecha de expiración
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const horasExpiracion = parseInt(expiresIn.replace('h', ''));
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + horasExpiracion);

    // Guardar sesión
    await pool.query(
      'INSERT INTO sesiones (usuario_id, token, ip_address, user_agent, fecha_expiracion) VALUES (?, ?, ?, ?, ?)',
      [usuario.id, token, ipAddress, req.get('user-agent'), fechaExpiracion]
    );

    // Actualizar último login
    await pool.query(
      'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
      [usuario.id]
    );

    await registrarLog(usuario.id, 'login_exitoso', 'auth', 'Login exitoso', ipAddress);

    // Obtener permisos del usuario
    const [permisos] = await pool.query(
      `SELECT m.nombre as modulo, p.accion 
       FROM roles_permisos rp
       JOIN permisos p ON rp.permiso_id = p.id
       JOIN modulos m ON p.modulo_id = m.id
       WHERE rp.rol_id = ?`,
      [usuario.rol_id]
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombreCompleto: usuario.nombre_completo,
        rol: usuario.rol_nombre,
        nivelAcceso: usuario.nivel_acceso,
        avatar: usuario.avatar_url
      },
      permisos,
      expiresIn: fechaExpiracion
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

// Registro de nuevo usuario
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, nombreCompleto, telefono, rolId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Verificar si el usuario ya existe
    const [usuariosExistentes] = await pool.query(
      'SELECT id FROM usuarios WHERE username = ? OR email = ?',
      [username, email]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({ error: 'El usuario o email ya existe.' });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (username, email, password_hash, nombre_completo, telefono, rol_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, nombreCompleto, telefono, rolId || 5] // 5 = Usuario Básico por defecto
    );

    await registrarLog(resultado.insertId, 'registro_usuario', 'auth', 'Nuevo usuario registrado', ipAddress);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuarioId: resultado.insertId
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Desactivar sesión actual
    await pool.query(
      'UPDATE sesiones SET activa = false WHERE token = ?',
      [req.token]
    );

    await registrarLog(req.user.id, 'logout', 'auth', 'Sesión cerrada', ipAddress);

    res.json({ mensaje: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error al cerrar sesión.' });
  }
};

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.username, u.email, u.nombre_completo, u.telefono, u.avatar_url,
              u.ultimo_login, u.fecha_creacion, r.nombre as rol, r.nivel_acceso
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil.' });
  }
};

// Validaciones
exports.validateLogin = [
  body('username').notEmpty().withMessage('El usuario es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

exports.validateRegister = [
  body('username').isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombreCompleto').notEmpty().withMessage('El nombre completo es requerido')
];
