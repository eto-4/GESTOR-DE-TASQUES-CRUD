// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { createRoleValidation, updateRoleValidation } = require('../middleware/validators/roleValidators');

router.post('/',                              auth, checkPermission('roles:manage'), ...createRoleValidation, roleController.createRole);
router.get('/',                               auth, checkPermission('roles:read'),                            roleController.getAllRoles);
router.get('/:id',                            auth, checkPermission('roles:read'),                            roleController.getRoleById);
router.put('/:id',                            auth, checkPermission('roles:manage'), ...updateRoleValidation, roleController.updateRole);
router.delete('/:id',                         auth, checkPermission('roles:manage'),                          roleController.deleteRole);
router.post('/:id/permissions',               auth, checkPermission('roles:manage'),                          roleController.addPermissionToRole);
router.delete('/:id/permissions/:permissionId', auth, checkPermission('roles:manage'),                        roleController.removePermissionFromRole);

module.exports = router;