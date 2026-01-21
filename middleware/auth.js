const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Obtenir el token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        // Verificar que el toquen existeix
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No autoritzat, token no proporcionat.'
            });
        }
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Buscar usuari per token id
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuari no trobat, Token invàlid.'
            });
        }
        // Afegir el usuari al request
        req.user = user;
        next();
    } catch (error) {
        if ( error.name === 'JsonWebTokenError' ) {
            return res.status(401).json({
                succes: false,
                error: 'Token Invàlid'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                succes: false,
                error: 'Token expirat.'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error en la autenticació.'
        });
    }
};