// controllers/uploadController.js
const LocalFileManager = require('../services/LocalFileManager');
const CloudManager = require('../services/CloudManager');
const FileValidator = require('../utils/fileUtils');

const localManager = new LocalFileManager('uploads/');

/**
 * Controlador per a la gestió de pujades d'arxius.
 * Proporciona mètodes per pujar arxius locals, al núvol, o ambdues opcions.
 */
class UploadController {

  /**
   * Orquestra la pujada d'un arxiu segons les opcions especificades.
   * @param {object} file - Fitxer obtingut de multer (req.file)
   * @param {object} options - Opcions de pujada { local: boolean, cloud: boolean, folder: string, resize: {...}, compress: {...} }
   * @returns {Promise<Array>} Resol amb un array amb els resultats de cada pujada (local i/o cloud)
   */
  static handleFile(file, options = {}) {
    return new Promise((resolve, reject) => {
      // Validacions bàsiques
      if (!FileValidator.validateExtension(file.originalname)) {
        return reject(new Error('Extensió de fitxer no permesa!'));
      }
      if (!FileValidator.validateSize(file.size)) {
        return reject(new Error('Fitxer massa gran!'));
      }

      const tasks = [];

      // Pujar a local si s'indica
      if (options.local) {
        // localManager.saveFile retorna promesa que resol {fileName, path, url}
        tasks.push(localManager.saveFile(file, options));
      }

      // Pujar al núvol si s'indica
      if (options.cloud) {
        // CloudManager.uploadImage espera file.path i retorna l'objecte de Cloudinary
        tasks.push(CloudManager.uploadImage(file.path, options));
      }

      // Comprovació que almenys s'ha seleccionat una destinació
      if (tasks.length === 0) {
        return reject(new Error('No s\'ha seleccionat cap destinació per la pujada'));
      }

      // Executar totes les pujades i esperar que finalitzin
      Promise.all(tasks)
        .then(results => resolve(results))
        .catch(err => reject(err));
    });
  }

  /**
   * Endpoint per a pujar un sol fitxer.
   * @param {object} req - Objeto de la petició Express
   * @param {object} res - Objeto de la resposta Express
   * @param {function} next - Funció next() de Express per passar errors
   * @param {object} options - Opcions de pujada (local/cloud, carpeta, redimensionament, compressió)
   */
  static uploadSingle(req, res, next, options = {}) {
    if (!req.file) return res.status(400).json({ error: 'Cap fitxer enviat' });

    UploadController.handleFile(req.file, options)
      .then(results => res.json({ success: true, files: results }))
      .catch(err => next(err));
  }

  /**
   * Endpoint per a pujar múltiples fitxers.
   * @param {object} req - Objeto de la petició Express
   * @param {object} res - Objeto de la resposta Express
   * @param {function} next - Funció next() de Express per passar errors
   * @param {object} options - Opcions de pujada (local/cloud, carpeta, redimensionament, compressió)
   */
  static uploadMultiple(req, res, next, options = {}) {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Cap fitxer enviat' });

    const promises = req.files.map(file => UploadController.handleFile(file, options));

    Promise.all(promises)
      .then(results => res.json({ success: true, files: results }))
      .catch(err => next(err));
  }
}

module.exports = UploadController;