// utils/fileUtils.js

const path = require('path');
const fs = require('fs').promises;

/**
 * Classe utilitària per validar i gestionar fitxers.
 * Inclou validació d'extensió, mida, nom, mimetype i generació de noms segurs.
 */
class FileValidator {
    /**
     * Validar extensió d'arxiu
     * @param {string} fileName - Nom del fitxer
     * @param {string[]} allowedExtensions - Llista d'extensions permeses
     * @returns {boolean} - true si és vàlida, false si no
     */
    static validateExtension(fileName, allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']) {
        const ext = path.extname(fileName).toLowerCase();
        return allowedExtensions.includes(ext);
    }

    /**
     * Validar mida del fitxer
     * @param {number} size - mida en bytes
     * @param {number} maxSize - mida màxima permesa (5MB per defecte)
     * @returns {boolean} - true si la mida és vàlida
     */
    static validateSize(size, maxSize = 5 * 1024 * 1024) {
        return size <= maxSize;
    }

    /**
     * Validar nom de fitxer (nom net, sense caràcters especials)
     * @param {string} fileName
     * @returns {boolean}
     */
    static validateFileName(fileName) {
        const regex = /^[a-zA-Z0-9._-]+$/;
        return regex.test(fileName);
    }

    /**
     * Generar un nom de fitxer segur basat en l'original
     * @param {string} originalName
     * @returns {string} - Nom segur amb timestamp i codi aleatori
     */
    static generateSafeFileName(originalName) {
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);

        const timeStamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);

        return `${baseName}_${timeStamp}_${random}${extension}`;
    }

    /**
     * Comprovar si un mimetype correspon a una imatge
     * @param {string} mimetype
     * @returns {boolean}
     */
    static isImage(mimetype) {
        return mimetype.startsWith('image/');
    }

    /**
     * Comprovar si un fitxer existeix al sistema de fitxers
     * @param {string} filePath
     * @returns {Promise<boolean>}
     */
    static fileExists(filePath) {
        return fs.access(filePath)
            .then(() => true)
            .catch(() => false);
    }

    /**
     * Obtenir extensió d'un fitxer
     * @param {string} fileName
     * @returns {string} - extensió amb punt inicial
     */
    static getExtension(fileName) {
        return path.extname(fileName).toLowerCase();
    }

    /**
     * Normalitzar una cadena d'entrada per eliminar caràcters especials
     * @param {string} str
     * @returns {string} - cadena neta
     */
    static sanitizeImputString(str) {
        return str.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0,50);
    }

    /**
     * Validar mimetype segons llista de tipus acceptats
     * @param {string} mimeType
     * @param {string[]} allowedTypes
     * @returns {boolean}
     */
    static validateMimeType(
        mimeType, allowedTypes = ['image/jpg','image/jpeg', 'image/png', 'image/webp'] 
    ) { return allowedTypes.includes(mimeType); }
}

module.exports = FileValidator;