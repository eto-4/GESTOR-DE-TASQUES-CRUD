// config/cloudinary.js
/**
 * Configuració de Cloudinary per a la gestió d'imatges al núvol.
 * 
 * Inicialitza la connexió amb Cloudinary utilitzant les variables
 * d'entorn definides al fitxer .env:
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Inicialitzar Cloudinary amb les credencials de l'entorn
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
