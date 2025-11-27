const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { memo } = require('react');

// Assegurar que el directori existeix
const uploadDir = 'uploads/';
if (!fs.existsSync(
    // Directori esperat
    uploadDir
)) {
    fs.mkdirSync(
        uploadDir, 
        { recursive: true }
    );
}

const storage = multer.diskStorage({
    destination: function(
        // destination - Function Params
        req, 
        file,
        cb
    ) {
        // Action
        cb(null, uploadDir);
    },
    filename: function(
        // filename - Function Params
        req,
        file,
        cb
    ){
        // Action
        // Generar nom unic: timeStamp + Nom original
        const baseName = path.basename(file.originalname, extension);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()* 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    }
});

// Configuració per emmagatzematge en memòria (per núvol)
const memoryStorage = multer.memoryStorage();

module.export = {
    storage,
    memoryStorage
};