const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Rutas públicas
router.post('/login', authController.validateLogin, authController.login);
router.post('/register', authController.validateRegister, authController.register);

// Rutas protegidas
router.post('/logout', auth, authController.logout);
router.get('/profile', auth, authController.getProfile);

module.exports = router;
