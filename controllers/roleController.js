// controllers/roleController.js
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');

// POST /api/admin/roles
exports.createRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }

    try {

        // Validar jerarquia: el rol pare ha de tenir un nivell inferior
        if (req.body.parentRole) {
            if (!isValidObjectId(req.body.parentRole)) {
                return res.status(400).json({
                    success: false,
                    error: 'Format d\'ID de rol pare invàlid'
                });
            }
        
            const parentRole = await Role.findById(req.body.parentRole);
            if (!parentRole) {
                return res.status(404).json({
                    success: false,
                    error: 'Rol pare no trobat'
                });
            }
        
            // El nivell del rol nou ha de ser superior al del pare
            if (req.body.level && req.body.level <= parentRole.level) {
                return res.status(400).json({
                    success: false,
                    error: `Jerarquia invàlida. El rol pare té nivell ${parentRole.level}, el nou rol ha de tenir un nivell superior`
                });
            }
        }
        
        const { name, description, permissions } = req.body;

        // Comprovar que no existeix un rol amb aquest nom
        const existing = await Role.findOne({ name });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Ja existeix un rol amb aquest nom'
            });
        }

        // Verificar que tots els permisos enviats existeixen a la BD
        if (permissions && permissions.length > 0) {
            const foundPermissions = await Permission.find({
                _id: { $in: permissions }
            });
            if (foundPermissions.length !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Un o més permisos no existeixen'
                });
            }
        }

        const role = await Role.create({ name, description, permissions: permissions || [] });
        await role.populate('permissions');

        res.status(201).json({
            success: true,
            message: 'Rol creat correctament',
            data: role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error creant el rol',
            details: error.message
        });
    }
};

// GET /api/admin/roles
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions').sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els rols',
            details: error.message
        });
    }
};

// GET /api/admin/roles/:id
exports.getRoleById = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const role = await Role.findById(req.params.id).populate('permissions');
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint el rol',
            details: error.message
        });
    }
};

// PUT /api/admin/roles/:id
exports.updateRole = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        // No permetre renombrar rols del sistema
        if (role.isSystemRole && req.body.name && req.body.name !== role.name) {
            return res.status(403).json({
                success: false,
                error: 'No pots renombrar un rol del sistema'
            });
        }

        // Verificar permisos si s'envien
        if (req.body.permissions && req.body.permissions.length > 0) {
            const foundPermissions = await Permission.find({
                _id: { $in: req.body.permissions }
            });
            if (foundPermissions.length !== req.body.permissions.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Un o més permisos no existeixen'
                });
            }
        }

        const updated = await Role.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('permissions');

        res.status(200).json({
            success: true,
            message: 'Rol actualitzat correctament',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error actualitzant el rol',
            details: error.message
        });
    }
};

// DELETE /api/admin/roles/:id
exports.deleteRole = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        // No permetre eliminar rols del sistema
        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                error: 'No pots eliminar un rol del sistema'
            });
        }

        // Reasignar usuaris que tinguin aquest rol al rol "user" per defecte
        const defaultRole = await Role.findOne({ name: 'user' });
        if (defaultRole) {
            // Primer eliminar el rol
            await User.updateMany(
                { roles: req.params.id },
                { $pull: { roles: role._id } }
            );
            // Després afegir el rol per defecte
            await User.updateMany(
                { roles: { $ne: defaultRole._id } },
                { $addToSet: { roles: defaultRole._id } }
            );
        }

        await Role.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Rol eliminat correctament'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error eliminant el rol',
            details: error.message
        });
    }
};

// POST /api/admin/roles/:id/permissions
exports.addPermissionToRole = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id) || !isValidObjectId(req.body.permissionId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        const permission = await Permission.findById(req.body.permissionId);
        if (!permission) {
            return res.status(404).json({
                success: false,
                error: 'Permís no trobat'
            });
        }

        await role.addPermission(permission._id);
        await role.populate('permissions');

        res.status(200).json({
            success: true,
            message: 'Permís afegit al rol correctament',
            data: role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error afegint el permís',
            details: error.message
        });
    }
};

// DELETE /api/admin/roles/:id/permissions/:permissionId
exports.removePermissionFromRole = async (req, res) => {
    try {
        
        if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.permissionId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        await role.removePermission(req.params.permissionId);
        await role.populate('permissions');

        res.status(200).json({
            success: true,
            message: 'Permís eliminat del rol correctament',
            data: role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error eliminant el permís del rol',
            details: error.message
        });
    }
};

// GET /api/admin/roles/:id/hierarchy
// Retorna la cadena de rols pare fins arribar al rol arrel
exports.getRoleHierarchy = async (req, res) => {
    try {
        const buildHierarchy = async (roleId) => {
            const role = await Role.findById(roleId).populate('permissions');
            if (!role) return null;

            const node = {
                id: role._id,
                name: role.name,
                level: role.level,
                permissions: role.permissions.map(p => p.name)
            };

            if (role.parentRole) {
                node.parent = await buildHierarchy(role.parentRole);
            }

            return node;
        };

        const hierarchy = await buildHierarchy(req.params.id);

        if (!hierarchy) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint la jerarquia',
            details: error.message
        });
    }
};

// GET /api/admin/roles/:id/permissions
// Retorna els permisos propis + els heretats de tots els rols pare
exports.getRolePermissions = async (req, res) => {
    try {
        const getAllPermissions = async (roleId, visited = new Set()) => {
            if (visited.has(roleId.toString())) return [];
            visited.add(roleId.toString());

            const role = await Role.findById(roleId)
                .populate('permissions');

            if (!role) return [];

            // Permisos propis del rol
            let permissions = role.permissions.map(p => ({
                name: p.name,
                description: p.description,
                category: p.category,
                inheritedFrom: role.name
            }));

            // Permisos heretats del rol pare
            if (role.parentRole) {
                const parentPermissions = await getAllPermissions(role.parentRole, visited);
                permissions = [...permissions, ...parentPermissions];
            }

            return permissions;
        };

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat'
            });
        }

        const permissions = await getAllPermissions(req.params.id);

        // Eliminar duplicats mantenint el primer (el més específic)
        const unique = permissions.filter((p, index, self) =>
            index === self.findIndex(t => t.name === p.name)
        );

        res.status(200).json({
            success: true,
            data: {
                role: role.name,
                level: role.level,
                totalPermissions: unique.length,
                permissions: unique
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els permisos del rol',
            details: error.message
        });
    }
};