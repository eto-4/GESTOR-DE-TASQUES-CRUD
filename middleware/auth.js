// middleware/auth.js
const jwtService = require('../services/jwtService');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No autoritzat, token no proporcionat.'
            });
        }

        // Comprovar si el token està a la blacklist (logout previ)
        const isBlacklisted = await TokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                error: 'Token revocat. Inicia sessió de nou.'
            });
        }

        // Verificar i decodificar el token
        const decoded = jwtService.verifyAccessToken(token);

        // Verificar que és un access token i no un refresh token
        if (decoded.tokenType !== 'access') {
            return res.status(401).json({
                success: false,
                error: 'Tipus de token invàlid.'
            });
        }

        // Buscar l'usuari amb els seus rols populats
        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate({
                path: 'roles',
                populate: { path: 'permissions' }
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuari no trobat, token invàlid.'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token invàlid.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expirat.',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error en la autenticació.'
        });
    }
};

module.exports = auth;