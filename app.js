const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());

// Rutas que no usan archivos
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de prueba
app.get('/', (req, res) => {
    res.send({ message: 'Gestor de tasques en funcionament!' });
});

// Rutas
const taskRoutes = require('./routes/taskRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/tasks', taskRoutes);
app.use('/api/upload', uploadRoutes);

// Servir uploads estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;