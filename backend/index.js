require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { testConnection } = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', userRoutes);

// Ruta principal - sirve el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mensaje: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejador de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a base de datos
    await testConnection();
    
    app.listen(port, () => {
      console.log(`\n🚀 Servidor iniciado exitosamente`);
      console.log(`📡 Puerto: ${port}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${port}`);
      console.log(`📚 API: http://localhost:${port}/api`);
      console.log(`\n✅ Sistema listo para usar\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

startServer();

