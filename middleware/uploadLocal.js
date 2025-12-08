// middleware/uploadLocal.js
const multer = require('multer');
const { storage } = require('../config/multer'); // Configuració de emmagatzematge local
const LocalFileManager = require('../services/LocalFileManager');

const localManager = new LocalFileManager('uploads/'); // Carpeta local

// Middleware per a un sol arxiu
const uploadSingle = (fieldName) => {
    const uploader = multer({ storage }).single(fieldName);
    return (req, res, next) => {
        uploader(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            if (!req.file) return res.status(400).json({ error: 'No s\'ha pujat cap fitxer' });
    
            // Guardar arxiu fent servir LocalFileManager
            localManager.saveFile(req.file)
                .then((filePath) => {
                    req.file.localPath = filePath; // Adjuntar ruta real
                    next();
                })
                .catch((saveErr) => {
                    return res.status(500).json({
                        error: 'Error al desar el fitxer',
                        details: saveErr.message
                    });
                });
        });
    };
};

// Middleware per a multiples arxius
const uploadMultiple = (fieldName, maxCount = 5) => {
    const uploader = multer({ storage }).array(fieldName, maxCount);

    return (req, res, next) => {
        uploader(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            if (!req.file || req.files.length === 0) return res.status(400).json({ error: 'No s\'ha pujat fitxers' });

            const savePromises = req.files.map((file) => localManager.saveFile(file));

            Promise.all(savePromises)
                .then((paths) => {
                    req.files = req.files.map((file, idx) => ({
                        ...file,
                        localPath: paths[idx]
                    }));
                    next();
                })
                .catch((saveErr) => {
                    return res.status(500).json({
                        error: 'Error al desar fitxers',
                        detalls: saveErr.message
                    });
                });
        });
    };
};

module.exports = { uploadSingle, uploadMultiple };