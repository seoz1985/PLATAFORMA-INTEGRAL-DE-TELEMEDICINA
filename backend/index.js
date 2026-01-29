const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Ruta básica para probar el servidor
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando correctamente!');
});

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://meditelcolombia_db_user:Q80YVPb5t6vx6Q1p@cluster0.qznpbn8.mongodb.net/telemedicina?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});
const userRoutes = require('./routes/userRoutes');
app.use('/api/usuarios', userRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

