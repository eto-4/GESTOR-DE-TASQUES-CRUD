// services/LocalFileManager.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Per compressió i redimensionament d'imatges
const FileValidator = require("../utils/fileUtils");

/**
 * Classe per gestionar arxius locals.
 * Permet guardar, eliminar, moure, comprovar i obtenir URL pública d'arxius.
 * Opcionalment pot sincronitzar amb un CloudManager passat al constructor.
 */
class LocalFileManager {
    /**
     * Constructor
     * @param {string} uploadDir - Directori on es guardaran els arxius (per defecte 'uploads/')
     * @param {object|null} cloudManager - Objecte CloudManager opcional per sincronitzar arxius
     */
    constructor(uploadDir = 'uploads/', cloudManager = null) {
        this.uploadDir = uploadDir;
        this.cloudManager = cloudManager;
        
        // Assegurar que els directoris existeixen
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Guardar un arxiu al sistema local
     * @param {object} file - Objecte multer amb informació del fitxer
     * @param {object} options - Opcions: resize, compress, createThumbnail, folder, etc.
     * @returns {Promise<object>} - Resol amb {fileName, path, url}
     */
    saveFile(file, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                // Validar extensió
                if (!FileValidator.validateExtension(file.originalname)) {
                    return reject(new Error('Extensió no permesa'));
                }
                
                // Validar mida
                if (!FileValidator.validateSize(file.size)) {
                    return reject(new Error('Arxiu massa gran'));
                }

                // Nom net de fitxer
                const fileName = FileValidator.generateSafeFileName(file.originalname);

                // Destinació: multer pot aportar destination, si no es fa servir uploadDir
                const destDir = file.destination || this.uploadDir;
                const filePath = path.join(destDir, fileName);

                // Guardar arxiu al sistema local
                fs.copyFile(file.path, filePath, (err) => {
                    if(err) return reject(err);

                    let promiseChain = Promise.resolve();

                    // Redimensionament o compressió amb sharp si s'indica
                    if (options.resize || options.compress) {
                        let sharpInstance = sharp(filePath);
                        if (options.resize) {
                            sharpInstance = sharpInstance.resize(options.resize.width, options.resize.height);
                        }
                        if (options.compress) {
                            sharpInstance = sharpInstance.jpeg({ quality: 80 });
                        }
                        promiseChain = sharpInstance.toBuffer().then(data => fs.promises.writeFile(filePath, data));
                    }

                    // Creació de thumbnail si s'indica
                    if (options.createThumbnail) {
                        const thumbDir = path.join(destDir, 'thumbs');
                        
                        // Crear directori de thumbnails si no existeix
                        if (!fs.existsSync(thumbDir)) {
                            fs.mkdirSync(thumbDir, { recursive: true });
                        }

                        const thumbPath = path.join(thumbDir, fileName);

                        promiseChain = promiseChain
                            .then(() => sharp(filePath)
                                .resize(150, 50)
                                .toFile(thumbPath)
                            );
                    }

                    promiseChain
                        .then(() => resolve({
                            fileName,
                            path: filePath,
                            url: `/uploads/${fileName}`
                        }))
                        .catch(err => reject(err));
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Eliminar un fitxer i el seu thumbnail opcional
     * @param {string} fileName - Nom de l'arxiu a eliminar
     * @returns {Promise<boolean>}
     */
    deleteFile(fileName) {
        return new Promise((resolve, reject) => {
            const filePath = path.join(this.uploadDir, fileName);
            const thumbPath = path.join(this.thumbDir, fileName);

            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') return reject(err);
                // També eliminar thumbnail si existeix
                fs.unlink(thumbPath, (errThumb) => {
                    if (errThumb && errThumb.code !== 'ENOENT') return reject(errThumb);
                    resolve(true);
                });
            });
        });
    }

    /**
     * Moure o renombrar un arxiu
     * @param {string} oldName - Nom actual del fitxer
     * @param {string} newName - Nou nom del fitxer
     * @returns {Promise<string>} - Resol amb el nou path
     */
    moveFile(oldName, newName) {
        return new Promise((resolve, reject) => {
            const oldPath = path.join(this.uploadDir, oldName);
            const newPath = path.join(this.uploadDir, newName);
            fs.rename(oldPath, newPath, (err) => {
                if (err) return reject(err);
                resolve(newPath);
            });
        });
    }

    /**
     * Comprovar si un fitxer existeix
     * @param {string} fileName - Nom del fitxer
     * @returns {Promise<boolean>} - true si existeix, false si no
     */
    fileExists(fileName) {
        return new Promise((resolve) => {
            const filePath = path.join(this.uploadDir, fileName);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }

    /**
     * Obtenir URL pública per a servir arxius des del servidor
     * @param {string} fileName - Nom del fitxer
     * @returns {string} - URL pública relativa
     */
    getPublicUrl(fileName) {
        return `/uploads/${fileName}`;
    }
}

module.exports = LocalFileManager;