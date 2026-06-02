// controllers/authController.js
const User = require('../models/User');
const Role = require('../models/Role');
const generateToken = require('../utils/generateToken');
const { handleValidationErrors } = require('../middleware/validators/authValidators');
const Permission = require('../models/Permission');

// POST /api/auth/register
exports.register = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Aquest email ja està registrat'
            });
        }

        // Buscar el rol "user" per defecte i assignar-lo automàticament
        const defaultRole = await Role.findOne({ name: 'user' });

        const user = await User.create({
            name,
            email,
            password,
            roles: defaultRole ? [defaultRole._id] : []
        });

        await user.populate('roles', 'name');

        const token = generateToken(user._id, user.email, 'user');

        res.status(201).json({
            success: true,
            message: 'Usuari registrat correctament',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles.map(r => r.name),
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al registrar l\'usuari',
            details: error.message
        });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
            .select('+password')
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credencials incorrectes'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credencials incorrectes'
            });
        }

        const token = generateToken(user._id, user.email, user.roles.map(r => r.name));
        const permissions = user.getEffectivePermissions();

        res.status(200).json({
            success: true,
            message: 'Sessió iniciada correctament',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles.map(r => r.name),
                    permissions
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sessió',
            details: error.message
        });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        const permissions = user.getEffectivePermissions();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles.map(r => r.name),
                permissions,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint el perfil',
            details: error.message
        });
    }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { name, email } = req.body;

        if (email && email !== req.user.email) {
            const emailInUse = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (emailInUse) {
                return res.status(400).json({
                    success: false,
                    error: 'Aquest email ja està en ús'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).populate('roles', 'name');

        res.status(200).json({
            success: true,
            message: 'Perfil actualitzat correctament',
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                roles: updatedUser.roles.map(r => r.name),
                createdAt: updatedUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al actualitzar el perfil',
            details: error.message
        });
    }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'La contrasenya actual és incorrecta'
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Contrasenya canviada correctament'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al canviar la contrasenya',
            details: error.message
        });
    }
};

// POST /api/auth/check-permission
// Verifica si l'usuari autenticat té un permís específic
exports.checkPermission = async (req, res) => {
    try {
        const { permission } = req.body;

        if (!permission) {
            return res.status(400).json({
                success: false,
                error: 'Cal especificar un permís'
            });
        }

        const permissionExists = await Permission.findOne({ name: permission });
        if (!permissionExists) {
            return res.status(400).json({
                success: false,
                hasPermission: false,
                message: 'El permís especificat no existeix al sistema'
            });
        }

        // Carregar l'usuari amb els seus rols i permisos populats
        const user = await User.findById(req.user._id)
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        const userPermissions = user.getEffectivePermissions();
        const hasPermission = userPermissions.includes(permission);
        res.status(200).json({
            success: true,
            hasPermission,
            message: hasPermission
                ? 'Tens permís per fer aquesta acció'
                : 'No tens permís per fer aquesta acció'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error verificant el permís',
            details: error.message
        });
    }
};