// middleware/validators/authValidators.js
const { body, validationResult } = require('express-validator');

// Validació per al registre d'usuari
const registerValidation = [
    body('email')
        .isEmail().withMessage('Email no vàlid')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contrasenya ha de tenir mínim 6 caràcters'),
    body('name')
        .optional()
        .isLength({ min: 2 }).withMessage('El nom ha de tenir mínim 2 caràcters')
        .trim()
];

// Validació per al login
const loginValidation = [
    body('email')
        .notEmpty().withMessage('L\'email és obligatori')
        .isEmail().withMessage('Email no vàlid')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contrasenya és obligatòria')
];

// Validació per canviar la contrasenya
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('La contrasenya actual és obligatòria'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('La nova contrasenya ha de tenir mínim 6 caràcters')
];

// Validació per actualitzar el perfil
const updateProfileValidation = [
    body('email')
        .optional()
        .isEmail().withMessage('Email no vàlid')
        .normalizeEmail(),
    body('name')
        .optional()
        .isLength({ min: 2 }).withMessage('El nom ha de tenir mínim 2 caràcters')
        .trim()
];

// Funció auxiliar per gestionar errors de validació
// S'usa a l'inici de cada controlador per comprovar si hi ha errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
        return true; // Indica que hi ha errors i el controlador ha d'aturar-se
    }
    return false; // No hi ha errors, continuar
};

module.exports = {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation,
    handleValidationErrors
};