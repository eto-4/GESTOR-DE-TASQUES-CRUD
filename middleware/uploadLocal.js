const multer = require('multer');
const path = require('path');

// Configuració d'emmagatzematge local
const storage = multer.diskStorage(
    {
        destination: (
            // Params func Anònima
            req, 
            file, 
            cb
        ) => {
            // Carpeta on es guardaràn les imatges
            cb( null, 'uploads/' );
        },
        filename: (
            // Params func Anònima
            req,
            file,
            cb
        ) => {
            // generar nom únic: timestamp + nom original
            const uniqueName = Date.now() + '-' + file.originalname;
            cb( null, uniqueName );
        }
    }
);

// Filtrar només imatges
const fileFilter = (
    // Params func Anònima
    req,
    file,
    cb
) => {
    if (file.mimetype.startsWith('image/')) {
        cb( null, true );
    } 
    else {
        cb( new Error('Només es permeten arxius d\'imatge'), false )
    }
};

// Configuració de Multer per pujada Local
const uploadLocal = multer(
    {
        storage: storage,
        limits: {
            // Límit de 5MB
            fileSize: 5 * 1024 * 2024
        },
        fileFilter: fileFilter
    }
);

module.exports = uploadLocal;