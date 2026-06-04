// controllers/permissionController.js
const Permission = require('../models/Permission');
const { validationResult } = require('express-validator');

// POST /api/admin/permissions
exports.createPermission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }

    try {
        const { name, description, category } = req.body;

        // Comprovar que no existeix ja un permís amb aquest nom
        const existing = await Permission.findOne({ name });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Ja existeix un permís amb aquest nom'
            });
        }

        const permission = await Permission.create({ name, description, category });

        res.status(201).json({
            success: true,
            message: 'Permís creat correctament',
            data: permission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error creant el permís',
            details: error.message
        });
    }
};

// GET /api/admin/permissions
exports.getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: permissions.length,
            data: permissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els permisos',
            details: error.message
        });
    }
};

// GET /api/admin/permissions/:id
exports.getPermissionById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                error: 'Permís no trobat'
            });
        }

        res.status(200).json({
            success: true,
            data: permission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint el permís',
            details: error.message
        });
    }
};

// GET /api/admin/permissions/categories
// Retorna els permisos agrupats per categoria
exports.getPermissionsByCategory = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ category: 1, name: 1 });

        // Agrupar permisos per categoria
        const grouped = permissions.reduce((acc, permission) => {
            if (!acc[permission.category]) {
                acc[permission.category] = [];
            }
            acc[permission.category].push(permission);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: grouped
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint les categories',
            details: error.message
        });
    }
};

// PUT /api/admin/permissions/:id
exports.updatePermission = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                error: 'Permís no trobat'
            });
        }

        // No permetre modificar permisos del sistema
        if (permission.isSystemPermission) {
            return res.status(403).json({
                success: false,
                error: 'No pots modificar un permís del sistema'
            });
        }

        const updated = await Permission.findByIdAndUpdate(
            req.params.id,
            { description: req.body.description, category: req.body.category },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Permís actualitzat correctament',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error actualitzant el permís',
            details: error.message
        });
    }
};

// DELETE /api/admin/permissions/:id
exports.deletePermission = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                error: 'Permís no trobat'
            });
        }

        // No permetre eliminar permisos del sistema
        if (permission.isSystemPermission) {
            return res.status(403).json({
                success: false,
                error: 'No pots eliminar un permís del sistema'
            });
        }

        await Permission.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Permís eliminat correctament'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error eliminant el permís',
            details: error.message
        });
    }
};