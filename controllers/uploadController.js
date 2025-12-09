// controllers/uploadController.js
const LocalFileManager = require('../services/LocalFileManager');
const CloudManager = require('../services/CloudManager');
const FileValidator = require('../utils/fileUtils');

const localManager = new LocalFileManager('uploads/');

class UploadController {

  // Orquestra la pujada d'un arxiu (retorna promesa)
  static handleFile(file, options = {}) {
    return new Promise((resolve, reject) => {
      // Validacions bàsiques
      if (!FileValidator.validateExtension(file.originalname)) {
        return reject(new Error('Extensió de fitxer no permesa!'));
      }
      // size (multer aporta file.size)
      if (!FileValidator.validateSize(file.size)) {
        return reject(new Error('Fitxer massa gran!'));
      }

      const tasks = [];

      if (options.local) {
        // note: localManager.saveFile retorna promesa que resol {fileName, path, url}
        tasks.push(localManager.saveFile(file, options));
      }

      if (options.cloud) {
        // CloudManager.uploadImage espera file.path i retorna l'objecte de Cloudinary
        tasks.push(CloudManager.uploadImage(file.path, options));
      }

      if (tasks.length === 0) {
        return reject(new Error('No s\'ha seleccionat cap destinació per la pujada'));
      }

      Promise.all(tasks)
        .then(results => resolve(results))
        .catch(err => reject(err));
    });
  }

  // Endpoint per a un sol fitxer — options es passen des de la ruta
  static uploadSingle(req, res, next, options = {}) {
    if (!req.file) return res.status(400).json({ error: 'Cap fitxer enviat' });

    UploadController.handleFile(req.file, options)
      .then(results => res.json({ success: true, files: results }))
      .catch(err => next(err));
  }

  // Endpoint per a múltiples fitxers
  static uploadMultiple(req, res, next, options = {}) {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Cap fitxer enviat' });

    const promises = req.files.map(file => UploadController.handleFile(file, options));

    Promise.all(promises)
      .then(results => res.json({ success: true, files: results }))
      .catch(err => next(err));
  }
}

module.exports = UploadController;