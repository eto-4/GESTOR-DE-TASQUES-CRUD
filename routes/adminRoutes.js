// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Totes les rutes d'admin requereixen:
// 1. auth       → token JWT vàlid
// 2. roleCheck  → rol "admin"
router.get('/users',              auth, roleCheck(['admin']), adminController.getAllUsers);
router.get('/tasks',              auth, roleCheck(['admin']), adminController.getAllTasks);
router.delete('/users/:id',       auth, roleCheck(['admin']), adminController.deleteUser);
router.put('/users/:id/role',     auth, roleCheck(['admin']), adminController.changeUserRole);

module.exports = router;