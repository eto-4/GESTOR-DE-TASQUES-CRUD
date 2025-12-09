// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Habilitar CORS per permetre peticions des de qualsevol origen
app.use(cors());

// Parseig de JSON i dades codificades en URL (per formularis)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta de prova per comprovar que el servidor funciona
app.get('/', (req, res) => {
    res.send({ message: 'Gestor de tasques en funcionament!' });
});

// Importar rutes
const taskRoutes = require('./routes/taskRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Servir fitxers estàtics de la carpeta uploads (per accés a imatges locals)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Assignar rutes a paths específics
app.use('/api/tasks', taskRoutes);
app.use('/api/upload', uploadRoutes);
// Middleware global d'errors
app.use((err, req, res, next) => {
  res.status(err.status || 400).json({
    error: err.message || 'Error desconegut'
  });
});

module.exports = app;