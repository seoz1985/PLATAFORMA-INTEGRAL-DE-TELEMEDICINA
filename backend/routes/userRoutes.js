const express = require('express');
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', (req, res) => {
  res.send('Lista de usuarios');
});

// Ruta para crear un usuario
router.post('/', (req, res) => {
  res.send('Usuario creado');
});

module.exports = router;

