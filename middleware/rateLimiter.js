// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Límits de peticions per rol (peticions per minut)
// Com més alt el rol, més peticions permet
const RATE_LIMITS = {
    super_admin: 1000,
    admin: 500,
    manager: 200,
    user: 100,
    viewer: 50,
    default: 50 // per si no té rol reconegut
};

// Middleware de rate limiting dinàmic per rol
// Llegeix el rol de req.user (posat pel middleware auth)
const roleLimiter = rateLimit({
    windowMs: 60 * 1000, // finestra de 1 minut
    max: (req) => {
        if (!req.user) return RATE_LIMITS.default;

        // Obtenir el rol de més alt nivell de l'usuari
        const userRoles = req.user.roles || [];
        if (userRoles.some(r => r.name === 'super_admin')) return RATE_LIMITS.super_admin;
        if (userRoles.some(r => r.name === 'admin'))       return RATE_LIMITS.admin;
        if (userRoles.some(r => r.name === 'manager'))     return RATE_LIMITS.manager;
        if (userRoles.some(r => r.name === 'viewer'))      return RATE_LIMITS.viewer;
        return RATE_LIMITS.user;
    },
    // Retorna headers X-RateLimit-* a la resposta
    standardHeaders: true,
    legacyHeaders: false,
    // Missatge quan es supera el límit
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Massa peticions. Torna-ho a intentar més tard.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Rate limiter específic per als endpoints d'autenticació
// Més restrictiu per prevenir atacs de força bruta
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // finestra de 15 minuts
    max: 10, // màxim 10 intents per finestra
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Massa intents d\'autenticació. Torna-ho a intentar en 15 minuts.'
        });
    }
});

module.exports = { roleLimiter, authLimiter };