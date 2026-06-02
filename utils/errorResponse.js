// utils/errorResponse.js

const mongoose = require('mongoose');
// Classe personalitzada per a errors de l'API
// Permet crear errors amb un codi HTTP específic de forma senzilla
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);          // Crida al constructor d'Error amb el missatge
        this.statusCode = statusCode;
    }
}

// Valida si un string és un ObjectId vàlid de Mongoose
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = { ErrorResponse, isValidObjectId };