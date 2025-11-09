const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware per gestionar CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware per analitzar JSON i formularis URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// Ruta inicial de prova
app.get('/', (req, res) => {
    res.send({message: 'Gestor de tasques en funcionament!'});
}); 

// Importar rutes
const taskRoutes = require('./routes/taskRoutes');

// Afegir les rutes de les tasques.
app.use('/api/tasks', taskRoutes);

module.exports = app;