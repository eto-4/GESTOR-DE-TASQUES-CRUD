// utils/fileUtils.js
const path = require('path');
const fs = require('fs').promises;

class FileValidator {
    // Validar extensió d'arxiu
    static validateExtension(fileName, allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']) {
        const ext = path.extname(fileName).toLowerCase();
        return allowedExtensions.includes(ext);
    }

    // Validar mida (5MB per defecte)
    static validateSize(size, maxSize = 5 * 1024 * 1024) {
        return size <= maxSize;
    }

    // Validar nom d'arxiu
    static validateFileName(fileName) {
        const regex = /^[a-zA-Z0-9._-]+$/;
        return regex.test(fileName);
    }

    // Generar nom segur
    static generateSafeFileName(originalName) {
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);

        const timeStamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);

        return `${baseName}_${timeStamp}_${random}${extension}`;
    }

    // Comprovar si l'arxiu es una imatge a partir del mimetype
    static isImage(mimetype) {
        return mimetype.startsWith('image/');
    }

    // comprovar si un arxiu existeix al sistema de fitxers
    static fileExists(filePath) {
        return fs.access(filePath)
            .then(() => true)
            .catch(() => false);
    }

    // obtenir l'extensió d'un fitxer
    static getExtension(fileName) {
        return path.extname(fileName).toLowerCase();
    }

    // Normalitzar una cadena d'entrada per eliminar caracters especials
    static sanitizeImputString(str) {
        return str.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0,50);
    }

    // Validar mimetype segons tipus acceptats
    static validateMimeType(
        mimeType, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'] 
    ) { return allowedTypes.includes(mimetype); }
}

module.exports = FileValidator;