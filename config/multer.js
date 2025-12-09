// config/multer.js
const multer = require('multer');
const path = require('path');

/**
 * Configuració per a emmagatzematge de fitxers amb multer.
 * Es defineixen dues opcions:
 * 1. Emmagatzematge local a disc.
 * 2. Emmagatzematge a memòria (per pujar a la núvol).
 */

// Emmagatzematge local a disc
const storage = multer.diskStorage({
    /**
     * Defineix el directori de destinació on es guardaran els fitxers.
     * @param {object} req - Objecte de la petició Express
     * @param {object} file - Fitxer de multer
     * @param {function} cb - Callback per retornar la destinació
     */
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    /**
     * Defineix el nom del fitxer guardat, afegint un sufix únic
     * per evitar col·lisions de noms.
     * @param {object} req - Objecte de la petició Express
     * @param {object} file - Fitxer de multer
     * @param {function} cb - Callback per retornar el nom del fitxer
     */
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        cb(null, `${base}-${uniqueSuffix}${ext}`);
    }
});

// Emmagatzematge en memòria (per pujar directament al núvol)
const memoryStorage = multer.memoryStorage();

module.exports = { storage, memoryStorage };