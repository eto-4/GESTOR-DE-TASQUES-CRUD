// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Ordre important: /permissions i rutes específiques abans de /:id
router.get('/',                     auth, checkPermission('users:read'),   userController.getAllUsers);
router.get('/:id/permissions',      auth, checkPermission('users:read'),   userController.getUserPermissions);
router.get('/:id',                  auth, checkPermission('users:read'),   userController.getUserById);
router.put('/:id',                  auth, checkPermission('users:manage'), userController.updateUser);
router.delete('/:id',               auth, checkPermission('users:manage'), userController.deleteUser);

module.exports = router;