// controllers/adminController.js
const User = require('../models/User');
const Task = require('../models/Task');
const Role = require('../models/Role');
const { isValidObjectId } = require('mongoose');

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('roles', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                roles: u.roles,
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

// GET /api/admin/tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint les tasques',
            details: error.message
        });
    }
};

// DELETE /api/admin/users/:id
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

// PUT /api/admin/users/:id/role
// Manteniment de compatibilitat amb T7 — canvia rol per nom
exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Rol no vàlid. Ha de ser "user" o "admin"'
            });
        }
        
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'No pots canviar el teu propi rol'
            });
        }

        // Buscar el rol per nom i assignar-lo a l'usuari
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
            return res.status(404).json({
                success: false,
                error: 'Rol no trobat a la base de dades'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { roles: [roleDoc._id] },
            { new: true }
        ).select('-password').populate('roles', 'name');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        res.status(200).json({
            success: true,
            message: `Rol actualitzat correctament a "${role}"`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error canviant el rol',
            details: error.message
        });
    }
};

// POST /api/admin/users/:userId/roles
exports.assignRoleToUser = async (req, res) => {
    try {
        const { roleId } = req.body;

        if (!isValidObjectId(req.params.roleId) || !isValidObjectId(req.params.userId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'El rol no existeix'
            });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        await user.addRole(roleId);
        await user.populate('roles', 'name description permissions');

        res.status(200).json({
            success: true,
            message: 'Rol assignat correctament',
            data: {
                userId: user._id,
                roles: user.roles
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error assignant el rol',
            details: error.message
        });
    }
};

// DELETE /api/admin/users/:userId/roles/:roleId
exports.removeRoleFromUser = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.userId) || !isValidObjectId(req.params.roleId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const user = await User.findById(req.params.userId).populate('roles');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuari no trobat'
            });
        }

        // No permetre que l'usuari quedi sense cap rol
        if (user.roles.length <= 1) {
            return res.status(400).json({
                success: false,
                error: 'L\'usuari ha de tenir almenys un rol'
            });
        }

        await user.removeRole(req.params.roleId);

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

// GET /api/admin/users/:userId/permissions
exports.getUserPermissions = async (req, res) => {
    try {
        
        if (!isValidObjectId(req.params.userId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const user = await User.findById(req.params.userId)
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

        const permissions = user.getEffectivePermissions();

        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                name: user.name,
                roles: user.roles.map(r => r.name),
                permissions
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