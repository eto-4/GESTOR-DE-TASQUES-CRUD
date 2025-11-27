const { time } = require('console');
const path = require('path');
const fs = require('fs').promises;

class FileValidator {
    // Validar extensió d'arxiu
    static validateExtension(fileName, allowedExtensions = [ '.jpg', '.png', 'pdf' ]) 
    {
        const ext = path.extname(fileName).toLowerCase();
        return allowedExtensions.includes(ext);
    }
    static validateSize(size, maxSize = 5*1024*1024) 
    {
        // 5MB per defecte
        return size <= maxSize;
    }
    static validateFileName(fileName) 
    {
        const regex = /^[a-zA-Z0-9._-]+$/;
        return regex.test(fileName);
    }
    static generateSafeFilename(originalName) 
    {
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension)
            // Canviar tots els valors que no siguin [a-zA-Z0-9] per '_'
            .replace(/[^a-zA-Z0-9]/g, '_')
            // Limitar Longitud
            .substring(0,50)
        
            const timeStamp = Date.now();
            const random = Math.random().toString(36).substring(2,8);

            return `${basename}_${timeStamp}_${random}${extension}`;
    }
}

module.exports = FileValidator;