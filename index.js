// index.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const seedPermissions = require('./utils/seedPermissions');
const seedRoles = require('./utils/seedRoles');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connexió a MongoDB establerta exitosament.');

        // Crear permisos i rols per defecte si no existeixen
        await seedPermissions();
        await seedRoles();

        app.listen(process.env.PORT, () => {
            console.log(`Servidor en funcionament a http://localhost:${process.env.PORT}/`);
        });
    })
    .catch(err => console.error('Error connectant a MongoDB: ', err));