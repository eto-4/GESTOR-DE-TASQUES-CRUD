/**
 * CloudManager.js
 * Gestor d'operacions amb Cloudinary: pujada, esborrat i transformacions.
 * Tots els mètodes utilitzen promeses amb `.then()` per adaptar-se a requisits del projecte.
 */

// const cloudinary = requiere('../config/');
const cloudinary = require('../config/cloudinary');
const FileValidator = require('../utils/fileUtils');

class CloudManager {

    /**
     * Pujar un arxiu a Cloudinary amb opcions opcionals:
     *  - resize: { width, height, crop }
     *  - compress: { quality }
     *  - folder: carpeta de destí
     * 
     * @param {string} filePath - Ruta local del fitxer a pujar
     * @param {object} options - Opcions de transformació i configuració
     * @returns {Promise<object>} - Resultat de Cloudinary
     */
    static uploadImage(filePath, options = {}) 
    {
        return new Promise((resolve, reject) => {

            // Validació bàsica per extensió
            if (!FileValidator.validateExtension(filePath)) {
                return reject(new Error('Extensió de fitxer no permesa!'));
            }

            // Configuració base de pujada
            let uploadOptions = {
                folder: options.folder || 'uploads',
                use_filename: true,
                unique_filename: false,
                overwrite: false
            };

            // Afegir redimensionament si existeix
            if (options.resize) {
                uploadOptions.transformation = [options.resize];
            }

            // Afegir compressió automàtica
            if (options.compress) {
                uploadOptions.quality = options.compress.quality || 'auto';
                uploadOptions.fetch_format = 'auto'; // auto WebP/AVIF si cal
            }

            // Execució de la pujada a Cloudinary
            cloudinary.uploader
                .upload(filePath, uploadOptions)
                .then(result => resolve(result))
                .catch(error => reject(error));
        });
    }

    /**
     * Eliminar imatge del Cloud per ID públic.
     * @param {string} publicId - ID proporcionat per Cloudinary
     * @returns {Promise<object>}
     */
    static deleteImage(publicId) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .destroy(publicId)
                .then(result => resolve(result))
                .catch(err => reject(err));
        });
    }

    /**
     * Generar una URL transformada de forma dinàmica.
     * No fa cap petició a Cloudinary.
     * @param {string} publicId 
     * @param {object} transformations 
     * @returns {string}
     */
    static generateImageUrl(publicId, transformations = {})
    {
        return cloudinary.url(publicId, transformations);
    }

    /**
     * Shortcut per pujar una imatge redimensionada.
     */
    static resizeImage(filePath, width, height) 
    {
        return CloudManager.uploadImage(filePath, {
            resize: { width, height, crop: 'fit' }
        });
    }

    /**
     * Shortcut per pujar una imatge comprimida.
     */
    static compressImage(filePath, quality = 'auto') 
    {
        return CloudManager.uploadImage(filePath, {
            compress: { quality }
        });
    }
}

module.exports = CloudManager;