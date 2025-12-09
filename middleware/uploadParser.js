// middleware/uploadParser.js
const multer = require('multer');
const { storage } = require('../config/multer');

/**
 * Middleware que NOMÉS parseja el form-data amb multer.
 * No desa ni puja fitxers. Simplement deixa req.file o req.files disponibles.
 */

// Parser per a un sol fitxer
const parseSingle = (fieldName) => {
  return multer({ storage }).single(fieldName);
};

// Parser per a múltiples fitxers
const parseMultiple = (fieldName, maxCount = 5) => {
  return multer({ storage }).array(fieldName, maxCount);
};

module.exports = { parseSingle, parseMultiple };