// services/LocalFileManager.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Per compressió i redimensionament
const FileValidator = require("../utils/fileUtils");

// CloudManager serà passat com a opció si volem sincronitzar amb núvol.
class LocalFileManager {
    constructor( uploadDir = 'uploads/', cloudManager = null ) {
        this.uploadDir = uploadDir;
        this.thumbDir = path.join(uploadDir, 'thumbs');
        this.cloudManager = cloudManager;
        
        // Assegurar quie els directoris existeixen
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        if (!fs.existsSync(this.thumbDir)) {
            fs.mkdirSync(this.thumbDir, { recursive: true });
        }
    }

    // Guardar un arxiu
    saveFile(file, options = {}) {
        return new Promise((resolve, reject) => {
            try {                
                if (!FileValidator.validateExtension(file.originalname)) {
                    return reject(new Error('Extensió no permesa'));
                }
                
                if (!FileValidator.validateSize(file.buffer.length)) {
                    return reject(new Error('Arxiu massa gran'));
                }
                
                const fileName = FileValidator.generateSafeFileName(file.originalname);
                const filePath = path.join(this.uploadDir, fileName);


                // Guardar arxiu
                fs.writeFile(filePath, file.buffer, (err) => {
                    if(err) return reject(err);

                    let promiseChain = Promise.resolve();

                    // Redimensionament o compressió si s'indica
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
                        const thumbPath = path.join(this.thumbDir, fileName);
                        promiseChain = promiseChain
                            .then(() => sharp(filePath)
                                .resize(150, 50)
                                .toFile(thumbPath)
                            );
                    }

                    // Sincronització amb núvol si s'indica
                    if ( options.syncCloud && this.cloudManager) {
                        promiseChain = promiseChain.then(() => this.cloudManager.uploadFile(file));
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

    deleteFile(fileName) {
        return new Promise((resolve, reject) => {
            const filePath = path.join(this.uploadDir, fileName);
            const thumbPath = path.join(this.thumbDir, fileName);

            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') return reject(err);
                // També escorrem thumbnail si existeix
                fs.unlink(thumbPath, (errThumb) => {
                    if (errThumb && errThumb.code !== 'ENOENT') return reject(errThumb);
                    resolve(true);
                });
            });
        });
    }

    // Moure o renombrar arxiu
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

    // Comprovar si l'arxiu existeix 
    fileExists(fileName) {
        return new Promise((resolve) => {
            const filePath = path.join(this.uploadDir, fileName);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }

    // Obtenir URL pública (per controller)
    getPublicUrl(fileName) {
        return `/uploads/${fileName}`;
    }
}

module.exports = LocalFileManager;