// controllers/adminController.js
const User = require('../models/User');
const Task = require('../models/Task');

// GET /api/admin/users
// Retorna tots els usuaris del sistema (sense contrasenyes)
exports.getAllUsers = async (req, res) => {
    try {
        // toJSON del model ja elimina la contrasenya, però select('-password')
        // és una capa extra de seguretat
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
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
// Retorna totes les tasques del sistema amb les dades del propietari
exports.getAllTasks = async (req, res) => {
    try {
        // populate('user') substitueix l'ObjectId pel document d'usuari
        // select limita quins camps de l'usuari s'inclouen
        const tasks = await Task.find()
            .populate('user', 'name email role')
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
// Elimina un usuari i totes les seves tasques
exports.deleteUser = async (req, res) => {
    try {
        // Un admin no es pot eliminar a si mateix
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

        // Eliminar primer totes les tasques de l'usuari
        await Task.deleteMany({ user: req.params.id });

        // Eliminar l'usuari
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
// Canvia el rol d'un usuari (user <-> admin)
exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        // Validar que el rol sigui vàlid
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Rol no vàlid. Ha de ser "user" o "admin"'
            });
        }

        // Un admin no es pot canviar el rol a si mateix
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'No pots canviar el teu propi rol'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

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
                role: user.role
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