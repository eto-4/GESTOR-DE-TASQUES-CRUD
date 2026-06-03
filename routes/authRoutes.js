// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation
} = require('../middleware/validators/authValidators');

// Rutes públiques amb rate limiter específic per autenticació
router.post('/register',        authLimiter, ...registerValidation, authController.register);
router.post('/login',           authLimiter, ...loginValidation,    authController.login);
router.post('/refresh',         authLimiter, authController.refresh);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

// Rutes protegides
router.get('/me',                auth, authController.getMe);
router.put('/profile',           auth, ...updateProfileValidation,   authController.updateProfile);
router.put('/change-password',   auth, ...changePasswordValidation,  authController.changePassword);
router.post('/logout',           auth, authController.logout);
router.post('/check-permission', auth, authController.checkPermission);

module.exports = router;