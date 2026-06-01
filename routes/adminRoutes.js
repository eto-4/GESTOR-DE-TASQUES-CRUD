// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Gestió d'usuaris
router.get('/users',                        auth, checkPermission('users:read'),   adminController.getAllUsers);
router.get('/tasks',                        auth, checkPermission('users:read'),   adminController.getAllTasks);
router.delete('/users/:id',                 auth, checkPermission('users:manage'), adminController.deleteUser);
router.put('/users/:id/role',               auth, checkPermission('users:manage'), adminController.changeUserRole);

// Assignació de rols a usuaris
router.post('/users/:userId/roles',         auth, checkPermission('users:manage'), adminController.assignRoleToUser);
router.delete('/users/:userId/roles/:roleId', auth, checkPermission('users:manage'), adminController.removeRoleFromUser);
router.get('/users/:userId/permissions',    auth, checkPermission('users:read'),   adminController.getUserPermissions);

module.exports = router;