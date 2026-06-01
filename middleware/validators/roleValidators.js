// middleware/validators/roleValidators.js
const { body } = require('express-validator');

const createRoleValidation = [
    body('name')
        .notEmpty().withMessage('El nom del rol és obligatori')
        .trim(),
    body('description')
        .optional()
        .trim(),
    body('permissions')
        .optional()
        .isArray().withMessage('Els permisos han de ser un array')
];

const updateRoleValidation = [
    body('name')
        .optional()
        .trim(),
    body('description')
        .optional()
        .trim(),
    body('permissions')
        .optional()
        .isArray().withMessage('Els permisos han de ser un array')
];

module.exports = { createRoleValidation, updateRoleValidation };