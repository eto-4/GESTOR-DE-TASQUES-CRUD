// middleware/checkPermission.js
const AuditLog = require('../models/AuditLog');

// Middleware que verifica si l'usuari té el permís necessari
// S'usa SEMPRE després del middleware auth
// Exemple: router.delete('/:id', auth, checkPermission('tasks:delete'), deleteTask)
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // req.user el posa el middleware auth
            // Però ara necessitem els rols poblats amb els seus permisos
            const User = require('../models/User');
            const user = await User.findById(req.user._id)
                .populate({
                    path: 'roles',
                    populate: { path: 'permissions' }
                });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuari no trobat'
                });
            }

            // Obtenir tots els permisos efectius de l'usuari
            const userPermissions = user.getEffectivePermissions();

            if (!userPermissions.includes(requiredPermission)) {
                // Registrar intent d'accés denegat a l'auditoria
                await AuditLog.log(
                    req.user._id,
                    requiredPermission,
                    req.params.id || null,
                    null,
                    'error',
                    null,
                    req,
                    'Permission denied'
                );

                return res.status(403).json({
                    success: false,
                    error: 'No tens permís per fer aquesta acció',
                    permission: requiredPermission
                });
            }

            // Afegir permisos a req per si els necessita el controlador
            req.userPermissions = userPermissions;
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error verificant permisos',
                details: error.message
            });
        }
    };
};

module.exports = checkPermission;