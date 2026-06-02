// services/jwtService.js
const jwt = require('jsonwebtoken');

// Genera un Access Token de curta durada (15 minuts)
// Conté userId, email i rol per evitar consultes a la BD en cada petició
const generateAccessToken = (userId, email, roles) => {
    return jwt.sign(
        { userId, email, roles, tokenType: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// Genera un Refresh Token de llarga durada (7 dies)
// Només conté userId i tipus — menys informació per seguretat
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, tokenType: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

// Verifica i decodifica un Access Token
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Verifica i decodifica un Refresh Token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};