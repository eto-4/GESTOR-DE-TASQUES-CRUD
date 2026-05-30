// controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { handleValidationErrors } = require('../middleware/validators/authValidators');

// POST /api/auth/register
// Registra un nou usuari i retorna un JWT
exports.register = async (req, res) => {
    // 1. Comprovar errors de validació (email, password, name)
    if (handleValidationErrors(req, res)) return;

    try {
        const { name, email, password } = req.body;

        // 2. Comprovar si l'email ja existeix
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Aquest email ja està registrat'
            });
        }

        // 3. Crear l'usuari (el hook pre-save xifra la contrasenya automàticament)
        const user = await User.create({ name, email, password });

        // 4. Generar JWT amb id, email i rol
        const token = generateToken(user._id, user.email, user.role);

        // 5. Retornar token i dades de l'usuari (toJSON elimina la contrasenya)
        res.status(201).json({
            success: true,
            message: 'Usuari registrat correctament',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
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
// Inicia sessió i retorna un JWT
exports.login = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { email, password } = req.body;

        // Buscar l'usuari per email (incloem password perquè té select:false)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credencials incorrectes'
            });
        }

        // Comparar la contrasenya amb bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credencials incorrectes'
            });
        }

        const token = generateToken(user._id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: 'Sessió iniciada correctament',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
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

// GET /api/auth/me  (ruta protegida)
// Retorna les dades de l'usuari autenticat (req.user el posa el middleware auth)
exports.getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt
        }
    });
};

// PUT /api/auth/profile  (ruta protegida)
// Actualitza el nom i/o email de l'usuari autenticat
exports.updateProfile = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { name, email } = req.body;

        // Si canvia l'email, comprovar que no el tingui un altre usuari
        if (email && email !== req.user.email) {
            const emailInUse = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (emailInUse) {
                return res.status(400).json({
                    success: false,
                    error: 'Aquest email ja està en ús'
                });
            }
        }

        // Actualitzar dades (no permetem canviar el rol des d'aquí)
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Perfil actualitzat correctament',
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
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

// PUT /api/auth/change-password  (ruta protegida)
// Canvia la contrasenya de l'usuari autenticat
exports.changePassword = async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    try {
        const { currentPassword, newPassword } = req.body;

        // Obtenir l'usuari amb la contrasenya (select:false per defecte no la retorna)
        const user = await User.findById(req.user._id).select('+password');

        // Verificar la contrasenya actual
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'La contrasenya actual és incorrecta'
            });
        }

        // Assignar nova contrasenya (el hook pre-save la xifrarà automàticament)
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