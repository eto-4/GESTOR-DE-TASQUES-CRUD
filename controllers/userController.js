// controllers/userController.js
const User = require('../models/User');
const Task = require('../models/Task');
const { isValidObjectId } = require('../utils/errorResponse');
const { getActiveDelegations } = require('../services/delegationService');

// GET /api/users
// Accessible per admin i manager
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('roles', 'name level')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                roles: u.roles.map(r => r.name),
                isActive: u.isActive,
                lastLogin: u.lastLogin,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els usuaris',
            details: error.message
        });
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        const delegatedPermissions = await getActiveDelegations(user._id);
        const permissions = user.getEffectivePermissions(delegatedPermissions);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles.map(r => r.name),
                permissions,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint l\'usuari',
            details: error.message
        });
    }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        // No permetre canviar password ni roles des d'aquí
        const { name, email, isActive } = req.body;

        if (email) {
            const emailInUse = await User.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (emailInUse) {
                return res.status(400).json({
                    success: false,
                    error: 'Aquest email ja està en ús'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, isActive },
            { new: true, runValidators: true }
        ).select('-password').populate('roles', 'name');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuari actualitzat correctament',
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                roles: updatedUser.roles.map(r => r.name),
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error actualitzant l\'usuari',
            details: error.message
        });
    }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'No et pots eliminar a tu mateix'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        await Task.deleteMany({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Usuari i les seves tasques eliminats correctament'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error eliminant l\'usuari',
            details: error.message
        });
    }
};

// GET /api/users/:id/permissions
exports.getUserPermissions = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const user = await User.findById(req.params.id)
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        const delegatedPermissions = await getActiveDelegations(user._id);
        const permissions = user.getEffectivePermissions(delegatedPermissions);

        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                name: user.name,
                roles: user.roles.map(r => r.name),
                permissions,
                delegatedPermissions: delegatedPermissions.map(dp => ({
                    permission: dp.permission?.name,
                    from: dp.fromUserId,
                    expiresAt: dp.expiresAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els permisos',
            details: error.message
        });
    }
};