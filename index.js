// index.js

// Carregar variables d'entorn des del fitxer .env
// Canviar la ruta si el fitxer es troba en un altre directori
require('dotenv').config();

// Importar llibreries necessàries
const mongoose = require('mongoose');
const app = require('./app');

// Connectar amb MongoDB utilitzant les variables d'entorn
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connexió a MongoDB establerta exitosament.');

        // Iniciar servidor Express un cop la connexió a MongoDB és correcta
        app.listen(process.env.PORT, () => {
            console.log(`Servidor en funcionament a http://localhost:${process.env.PORT}/`);
        });
    })
    .catch(err => console.error('Error connectant a MongoDB: ', err));