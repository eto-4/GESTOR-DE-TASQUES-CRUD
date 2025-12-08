// controllers/uploadController.js
// Controlador per a la gestió de pujades d'arxius

const LocalFileManager = require('../services/LocalFileManager');
const CloudManager = require('../services/CloudManager');
const FileValidator = require('../utils/fileUtils');

class UploadController {

    /**
     * Processar un únic fitxer
     * @param {object} file - Fitxer de multer
     * @param {object} options - Opcions addicionals { local: bool, cloud: bool, folder: string, resize: {...}, compress: {...} }
     * @returns {Promise<object>} Resultat de la pujada
     */
    static handleFile(file, options = {}) {

        return new Promise((resolve, reject) => {            
            // Validació del fitxer
            if (!FileValidator.validateExtension(file.originalname)) {
                return reject(new Error('Extensió de fitxer no permesa!'));
            }
            if (!FileValidator.validateSize(file.size)) {
                return reject(new Error('Fitxer massa gran!'));
            }
    
            const tasks = [];
    
            // pujar local si s'indica
            if (options.local) {
                tasks.push(
                    LocalFileManager.saveFile(file.path, options.folder || 'uploads')
                );
            }
    
            // Pujar al núvol si s'indica
            if (options.cloud) {
                tasks.push(
                    CloudManager.uploadImage( file.path, {
                        folder: options.folder,
                        resize: options.resize,
                        compress: options.compress
                    })
                );
            }
    
            // Esperar a totes les pujades
            Promise.all(tasks)
                .then(results => resolve(results))
                .catch(err => reject(err));
        });
    }

    // Endpoint per pujar un fitxer
    static uploadSingle(req, res, next) {
        if (!req.file) {
            return res.status(400).json({ error: 'Cap fitxer enviat' });
        }

        UploadController.handleFile(req.file, { local: true, cloud: true })
            .then(results => res.json({ success: true, files: results }))
            .catch(err => next(err));
    }

    // Endpoint per pujar varis fitxers
    static uploadMultiple(req, res, next) {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Cap fitxer enviat' });
        }

        const promises = req.files.map(file => 
            UploadController.handleFile(file, { local: true, cloud: true })
        );

        Promise.all(promises)
            .then(results => req.json({ success: true, files: results }))
            .catch(err => next(err));
    }
}

module.exports = UploadController;