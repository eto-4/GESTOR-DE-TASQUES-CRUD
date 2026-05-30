// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation
} = require('../middleware/validators/authValidators');

// Rutes públiques
router.post('/register', ...registerValidation, authController.register);
router.post('/login',    ...loginValidation,    authController.login);

// Rutes protegides
router.get('/me',                auth,                                      authController.getMe);
router.put('/profile',           auth, ...updateProfileValidation,          authController.updateProfile);
router.put('/change-password',   auth, ...changePasswordValidation,         authController.changePassword);

module.exports = router;