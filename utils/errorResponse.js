// utils/errorResponse.js
// Classe personalitzada per a errors de l'API
// Permet crear errors amb un codi HTTP específic de forma senzilla
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);          // Crida al constructor d'Error amb el missatge
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;