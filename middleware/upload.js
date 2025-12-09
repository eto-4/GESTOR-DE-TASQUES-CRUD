// middleware/uploadUnified.js
const multer = require('multer');
const { storage } = require('../config/multer');
const LocalFileManager = require('../services/LocalFileManager');
const CloudManager = require('../services/CloudManager');

const localManager = new LocalFileManager('uploads/');

/**
 * Middleware per pujar un sol arxiu
 * @param {string} fieldName - nom del camp
 * @param {object} options - { local: boolean, cloud: boolean }
 */
const uploadSingle = (fieldName, options = { local: true, cloud: false }) => {
    const uploader = multer({ storage }).single(fieldName);

    return (req, res, next) => {
        uploader(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            if (!req.file) return res.status(400).json({ error: 'No s\'ha pujat cap fitxer' });

            const file = req.file;

            let chain = Promise.resolve();

            if (options.local) {
                chain = chain.then(() => localManager.saveFile(file))
                             .then(localFile => { file.localPath = localFile.path; });
            }

            if (options.cloud) {
                chain = chain.then(() => CloudManager.uploadImage(file.path))
                             .then(cloudFile => {
                                 file.cloudUrl = cloudFile.secure_url;
                                 file.cloudPublicId = cloudFile.public_id;
                             });
            }

            chain.then(() => next())
                 .catch(uploadErr => res.status(500).json({
                     error: 'Error pujant el fitxer',
                     details: uploadErr.message
                 }));
        });
    };
};

/**
 * Middleware per pujar multiples arxius
 * @param {string} fieldName - nom del camp
 * @param {number} maxCount - nombre màxim d'arxius
 * @param {object} options - { local: boolean, cloud: boolean }
 */
const uploadMultiple = (fieldName, maxCount = 5, options = { local: true, cloud: false }) => {
    const uploader = multer({ storage }).array(fieldName, maxCount);

    return (req, res, next) => {
        uploader(req, res, (err) => {
            if (err) return res.status(400).json({ error: err.message });
            if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No s\'han pujat fitxers' });

            const files = req.files;

            // Crear cadena de promeses per a cada arxiu
            const promises = files.map(file => {
                let chain = Promise.resolve();

                if (options.local) {
                    chain = chain.then(() => localManager.saveFile(file))
                                 .then(localFile => { file.localPath = localFile.path; });
                }

                if (options.cloud) {
                    chain = chain.then(() => CloudManager.uploadImage(file.path))
                                 .then(cloudFile => {
                                     file.cloudUrl = cloudFile.secure_url;
                                     file.cloudPublicId = cloudFile.public_id;
                                 });
                }

                return chain;
            });

            // Esperar que tots acabin
            Promise.all(promises)
                .then(() => next())
                .catch(uploadErr => res.status(500).json({
                    error: 'Error pujant els fitxers',
                    details: uploadErr.message
                }));
        });
    };
};

module.exports = { uploadSingle, uploadMultiple };