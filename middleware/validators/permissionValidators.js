// middleware/validators/permissionValidators.js
const { body } = require('express-validator');

const createPermissionValidation = [
    body('name')
        .notEmpty().withMessage('El nom del permís és obligatori')
        .trim(),
    body('description')
        .notEmpty().withMessage('La descripció és obligatòria')
        .trim(),
    body('category')
        .notEmpty().withMessage('La categoria és obligatòria')
        .trim()
];

const updatePermissionValidation = [
    body('description')
        .optional()
        .trim(),
    body('category')
        .optional()
        .trim()
];

module.exports = { createPermissionValidation, updatePermissionValidation };