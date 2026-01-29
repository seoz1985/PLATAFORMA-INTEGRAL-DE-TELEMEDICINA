const { pool } = require('../config/database');

// Obtener estadísticas principales del dashboard
exports.getEstadisticas = async (req, res) => {
  try {
    // Total de usuarios
    const [totalUsuarios] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE activo = true'
    );

    // Usuarios por rol
    const [usuariosPorRol] = await pool.query(
      `SELECT r.nombre as rol, COUNT(u.id) as total
       FROM roles r
       LEFT JOIN usuarios u ON r.id = u.rol_id AND u.activo = true
       GROUP BY r.id, r.nombre
       ORDER BY r.nivel_acceso DESC`
    );

    // Actividad reciente (últimos 7 días)
    const [actividadReciente] = await pool.query(
      `SELECT DATE(fecha_creacion) as fecha, COUNT(*) as cantidad
       FROM logs_actividad
       WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(fecha_creacion)
       ORDER BY fecha DESC`
    );

    // Últimos logins
    const [ultimosLogins] = await pool.query(
      `SELECT u.nombre_completo, u.username, u.ultimo_login, r.nombre as rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.ultimo_login IS NOT NULL
       ORDER BY u.ultimo_login DESC
       LIMIT 10`
    );

    // Módulos más usados
    const [modulosMasUsados] = await pool.query(
      `SELECT modulo, COUNT(*) as total
       FROM logs_actividad
       WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND modulo IS NOT NULL
       GROUP BY modulo
       ORDER BY total DESC
       LIMIT 5`
    );

    // Sesiones activas
    const [sesionesActivas] = await pool.query(
      'SELECT COUNT(*) as total FROM sesiones WHERE activa = true AND fecha_expiracion > NOW()'
    );

    // Integraciones activas
    const [integracionesActivas] = await pool.query(
      'SELECT COUNT(*) as total FROM integraciones WHERE activa = true'
    );

    res.json({
      totalUsuarios: totalUsuarios[0].total,
      usuariosPorRol,
      actividadReciente,
      ultimosLogins,
      modulosMasUsados,
      sesionesActivas: sesionesActivas[0].total,
      integracionesActivas: integracionesActivas[0].total
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
};

// Obtener módulos disponibles para el usuario actual
exports.getModulosUsuario = async (req, res) => {
  try {
    const [modulos] = await pool.query(
      `SELECT DISTINCT m.id, m.nombre, m.descripcion, m.icono, m.ruta, m.orden
       FROM modulos m
       JOIN permisos p ON m.id = p.modulo_id
       JOIN roles_permisos rp ON p.id = rp.permiso_id
       WHERE rp.rol_id = ? AND m.activo = true AND p.accion = 'leer'
       ORDER BY m.orden`,
      [req.user.rol_id]
    );

    res.json(modulos);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({ error: 'Error al obtener módulos.' });
  }
};

// Obtener actividad del usuario actual
exports.getActividadUsuario = async (req, res) => {
  try {
    const { limite = 20, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;

    const [actividad] = await pool.query(
      `SELECT accion, modulo, descripcion, ip_address, fecha_creacion
       FROM logs_actividad
       WHERE usuario_id = ?
       ORDER BY fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limite), offset]
    );

    const [totalCount] = await pool.query(
      'SELECT COUNT(*) as total FROM logs_actividad WHERE usuario_id = ?',
      [req.user.id]
    );

    res.json({
      actividad,
      total: totalCount[0].total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(totalCount[0].total / limite)
    });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({ error: 'Error al obtener actividad.' });
  }
};
