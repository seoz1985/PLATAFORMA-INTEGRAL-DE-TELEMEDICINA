const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de MySQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'nabucom1_TELEMEDICINA2026',
  password: 'Md85155435@1',
  database: 'nabucom1_TELEMEDICINA2026'
};

// Crear pool de conexiones
let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);
  }
}

initDatabase();

// Middleware
app.use(bodyParser.json());

// Ruta básica para probar el servidor
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando correctamente con MySQL!');
});

// Exportar pool para usar en rutas
app.locals.db = pool;

const userRoutes = require('./routes/userRoutes');
app.use('/api/usuarios', userRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

