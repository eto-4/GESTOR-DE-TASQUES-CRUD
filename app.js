// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { roleLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware globals
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir fitxers estàtics
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiter global per a totes les rutes protegides
// S'aplica després del middleware auth perquè necessita req.user
app.use('/api/tasks',  roleLimiter);
app.use('/api/admin',  roleLimiter);

// Ruta de prova
app.get('/', (req, res) => {
    res.json({ message: 'Gestor de tasques en funcionament!' });
});

// Importar rutes
const userRoutes = require('./routes/userRoutes');
const authRoutes        = require('./routes/authRoutes');
const taskRoutes        = require('./routes/taskRoutes');
const uploadRoutes      = require('./routes/uploadRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const roleRoutes        = require('./routes/roleRoutes');
const permissionRoutes  = require('./routes/permissionRoutes');
const auditRoutes       = require('./routes/auditRoutes');
const delegationRoutes  = require('./routes/delegationRoutes');

// Assignar rutes
app.use('/api/users',             userRoutes);
app.use('/api/auth',              authRoutes);
app.use('/api/tasks',             taskRoutes);
app.use('/api/upload',            uploadRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api/admin/roles',       roleRoutes);
app.use('/api/admin/permissions', permissionRoutes);
app.use('/api/admin/audit-logs',  auditRoutes);
app.use('/api/delegations',       delegationRoutes);

// Middleware global d'errors
app.use((err, req, res, next) => {
    res.status(err.statusCode || err.status || 500).json({
        success: false,
        error: err.message || 'Error desconegut'
    });
});

module.exports = app;