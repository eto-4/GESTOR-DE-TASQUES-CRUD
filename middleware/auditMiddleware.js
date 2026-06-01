// middleware/auditMiddleware.js
const AuditLog = require('../models/AuditLog');

// Middleware que registra automàticament les accions d'escriptura
// S'aplica globalment a app.js per a POST, PUT i DELETE
const auditMiddleware = (req, res, next) => {
    // Només registrem si hi ha usuari autenticat i és una operació d'escriptura
    if (!req.user || !['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Guardem la funció json original per interceptar la resposta
    const originalJson = res.json.bind(res);

    res.json = function(data) {
        // Determinar l'acció a partir del mètode i la ruta
        const action = getActionFromRequest(req);
        const status = res.statusCode < 400 ? 'success' : 'error';

        // Registrar de forma asíncrona sense bloquejar la resposta
        AuditLog.log(
            req.user._id,
            action,
            req.params.id || null,
            getResourceType(req),
            status,
            null,
            req,
            status === 'error' ? (data.error || null) : null
        ).catch(err => console.error('Error registrant auditoria:', err));

        // Continuar amb la resposta original
        return originalJson(data);
    };

    next();
};

// Determina el nom de l'acció a partir del mètode HTTP i la ruta
const getActionFromRequest = (req) => {
    const method = req.method;
    const path = req.path;

    if (path.includes('/auth/login'))           return 'auth:login';
    if (path.includes('/auth/register'))        return 'auth:register';
    if (path.includes('/auth/change-password')) return 'auth:change-password';
    if (path.includes('/roles'))                return `roles:${method.toLowerCase()}`;
    if (path.includes('/permissions'))          return `permissions:${method.toLowerCase()}`;
    if (path.includes('/users'))                return `users:${method.toLowerCase()}`;
    if (path.includes('/tasks')) {
        if (method === 'POST')   return 'tasks:create';
        if (method === 'PUT')    return 'tasks:update';
        if (method === 'DELETE') return 'tasks:delete';
    }
    return `${method.toLowerCase()}:${path}`;
};

// Determina el tipus de recurs a partir de la ruta
const getResourceType = (req) => {
    if (req.path.includes('/tasks'))       return 'task';
    if (req.path.includes('/users'))       return 'user';
    if (req.path.includes('/roles'))       return 'role';
    if (req.path.includes('/permissions')) return 'permission';
    if (req.path.includes('/auth'))        return 'auth';
    return 'unknown';
};

module.exports = auditMiddleware;