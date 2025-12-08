// config/multer.js
const multer = require('multer');
const path = require('path');

// Emmagatzematge local
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        cb(null, `${base}-${uniqueSuffix}${ext}`);
    }
});

// Emmagatzematge a memòria (per pujar al núvol)
const memoryStorage = multer.memoryStorage();

module.exports = { storage, memoryStorage };
