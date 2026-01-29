const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, checkPermission } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Estadísticas del dashboard
router.get('/estadisticas', checkPermission('Dashboard', 'leer'), dashboardController.getEstadisticas);

// Módulos disponibles
router.get('/modulos', dashboardController.getModulosUsuario);

// Actividad del usuario
router.get('/actividad', dashboardController.getActividadUsuario);

module.exports = router;
