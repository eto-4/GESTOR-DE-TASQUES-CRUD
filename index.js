// Carregar variables d'entorn (canviar la ruta en cas de trobarse en una altre ruta)
require('dotenv').config({path: './config/.env'});

// Importar llibreries necessàries.
const mongoose = require('mongoose');
const app = require('./app');

// Conectar amb MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connexió a MongoDB establerta exitosament.');

        app.listen(process.env.PORT, () => {
            console.log(`Servidor en funcionament a http://localhost:${process.env.PORT}/`);
        });
    })
    .catch(err => console.error('Error connectant a MongoDB: ', err));