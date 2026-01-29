const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que la sesión esté activa
    const [sesiones] = await pool.query(
      'SELECT * FROM sesiones WHERE usuario_id = ? AND token = ? AND activa = true AND fecha_expiracion > NOW()',
      [decoded.userId, token]
    );

    if (sesiones.length === 0) {
      return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }

    // Obtener información del usuario
    const [usuarios] = await pool.query(
      `SELECT u.*, r.nombre as rol_nombre, r.nivel_acceso 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE u.id = ? AND u.activo = true`,
      [decoded.userId]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo.' });
    }

    req.user = usuarios[0];
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

// Middleware de autorización por rol
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!roles.includes(req.user.rol_nombre)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso.' 
      });
    }

    next();
  };
};

// Middleware de autorización por nivel de acceso
const authorizeLevel = (nivelMinimo) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (req.user.nivel_acceso < nivelMinimo) {
      return res.status(403).json({ 
        error: 'Nivel de acceso insuficiente.' 
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const checkPermission = (modulo, accion) => {
  return async (req, res, next) => {
    try {
      const [permisos] = await pool.query(
        `SELECT COUNT(*) as tiene_permiso
         FROM roles_permisos rp
         JOIN permisos p ON rp.permiso_id = p.id
         JOIN modulos m ON p.modulo_id = m.id
         WHERE rp.rol_id = ? AND m.nombre = ? AND p.accion = ?`,
        [req.user.rol_id, modulo, accion]
      );

      if (permisos[0].tiene_permiso === 0) {
        return res.status(403).json({ 
          error: `No tienes permiso para ${accion} en ${modulo}` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar permisos.' });
    }
  };
};

module.exports = { auth, authorize, authorizeLevel, checkPermission };
