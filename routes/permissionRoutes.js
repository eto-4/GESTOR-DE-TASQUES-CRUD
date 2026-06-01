// routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { createPermissionValidation, updatePermissionValidation } = require('../middleware/validators/permissionValidators');

router.post('/',      auth, checkPermission('permissions:manage'), ...createPermissionValidation, permissionController.createPermission);
router.get('/',       auth, checkPermission('permissions:read'),                                  permissionController.getAllPermissions);
router.get('/categories', auth, checkPermission('permissions:read'),                              permissionController.getPermissionsByCategory);
router.put('/:id',    auth, checkPermission('permissions:manage'), ...updatePermissionValidation, permissionController.updatePermission);
router.delete('/:id', auth, checkPermission('permissions:manage'),                                permissionController.deletePermission);

module.exports = router;