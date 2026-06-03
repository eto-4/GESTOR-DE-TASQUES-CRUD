// controllers/authController.js
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const TokenBlacklist = require('../models/TokenBlacklist');
const PasswordReset = require('../models/PasswordReset');
const jwtService = require('../services/jwtService');
const { sendPasswordResetEmail } = require('../services/emailService');
const { handleValidationErrors } = require('../middleware/validators/authValidators');
const { getActiveDelegations } = require('../services/delegationService');

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

        const defaultRole = await Role.findOne({ name: 'user' });

        const user = await User.create({
            name,
            email,
            password,
            roles: defaultRole ? [defaultRole._id] : []
        });

        await user.populate({
            path: 'roles',
            populate: { path: 'permissions' }
        });

        const accessToken = jwtService.generateAccessToken(
            user._id,
            user.email,
            user.roles.map(r => r.name)
        );
        const refreshToken = jwtService.generateRefreshToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Usuari registrat correctament',
            data: {
                accessToken,
                refreshToken,
                expiresIn: 900,
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

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Compte desactivat. Contacta amb l\'administrador.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credencials incorrectes'
            });
        }

        // Actualitzar data de last login
        user.lastLogin = new Date();
        await user.save();

        const delegatedPermissions = await getActiveDelegations(user._id);
        const permissions = user.getEffectivePermissions(delegatedPermissions);

        const accessToken = jwtService.generateAccessToken(
            user._id,
            user.email,
            user.roles.map(r => r.name)
        );
        const refreshToken = jwtService.generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Sessió iniciada correctament',
            data: {
                accessToken,
                refreshToken,
                expiresIn: 900,
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

// POST /api/auth/refresh
// Genera un nou access token a partir d'un refresh token vàlid
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token no proporcionat'
            });
        }

        // Comprovar si el refresh token està a la blacklist
        const isBlacklisted = await TokenBlacklist.findOne({ token: refreshToken });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token revocat. Inicia sessió de nou.'
            });
        }

        // Verificar el refresh token
        const decoded = jwtService.verifyRefreshToken(refreshToken);

        if (decoded.tokenType !== 'refresh') {
            return res.status(401).json({
                success: false,
                error: 'Tipus de token invàlid.'
            });
        }

        const user = await User.findById(decoded.userId)
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Usuari no trobat o desactivat.'
            });
        }

        // Generar nou access token
        const newAccessToken = jwtService.generateAccessToken(
            user._id,
            user.email,
            user.roles.map(r => r.name)
        );

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: 900
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Refresh token expirat. Inicia sessió de nou.'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error renovant el token',
            details: error.message
        });
    }
};

// POST /api/auth/logout
// Afegeix els tokens a la blacklist per invalidar-los
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const accessToken = req.token; // posat pel middleware auth

        // Afegir access token a la blacklist
        // expiresAt = 15 minuts des d'ara (durada de l'access token)
        await TokenBlacklist.create({
            token: accessToken,
            userId: req.user._id,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });

        // Afegir refresh token a la blacklist si s'ha proporcionat
        if (refreshToken) {
            await TokenBlacklist.create({
                token: refreshToken,
                userId: req.user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sessió tancada correctament'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error tancant la sessió',
            details: error.message
        });
    }
};

// POST /api/auth/forgot-password
// Envia un email amb el token de reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'L\'email és obligatori'
            });
        }

        const user = await User.findOne({ email });

        // Sempre retornem 200 per no revelar si l'email existeix o no
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Si l\'email existeix, rebràs un correu amb les instruccions'
            });
        }

        // Generar token únic amb crypto
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Guardar token a la BD (expira en 1 hora)
        await PasswordReset.findOneAndDelete({ userId: user._id });
        await PasswordReset.create({
            userId: user._id,
            token: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        // Enviar email
        await sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({
            success: true,
            message: 'Si l\'email existeix, rebràs un correu amb les instruccions'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error enviant l\'email de recuperació',
            details: error.message
        });
    }
};

// POST /api/auth/reset-password/:token
// Restableix la contrasenya amb el token rebut per email
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La nova contrasenya ha de tenir mínim 6 caràcters'
            });
        }

        // Buscar el token a la BD
        const resetRecord = await PasswordReset.findOne({
            token,
            usedAt: null,
            expiresAt: { $gt: new Date() }
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                error: 'Token invàlid o expirat'
            });
        }

        // Actualitzar la contrasenya
        const user = await User.findById(resetRecord.userId);
        user.password = newPassword;
        await user.save();

        // Marcar el token com a usat
        resetRecord.usedAt = new Date();
        await resetRecord.save();

        res.status(200).json({
            success: true,
            message: 'Contrasenya restablerta correctament. Ja pots iniciar sessió.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error restablint la contrasenya',
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
                lastLogin: user.lastLogin,
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

        const user = await User.findById(req.user._id)
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        const delegatedPermissions = await getActiveDelegations(user._id);
        const userPermissions = user.getEffectivePermissions(delegatedPermissions);
        const hasPermission = userPermissions.includes(permission);

        res.status(200).json({
            success: true,
            hasPermission,
            message: hasPermission
                ? 'Tens permís per fer aquesta acció'
                : 'El permís existeix però no el tens assignat'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error verificant el permís',
            details: error.message
        });
    }
};