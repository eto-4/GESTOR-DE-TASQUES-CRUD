// middleware/roleCheck.js
// Middleware per verificar que l'usuari té el rol necessari per accedir a una ruta
// S'utilitza SEMPRE després del middleware auth (que posa req.user)
// Exemple d'ús: router.get('/admin', auth, roleCheck(['admin']), handler)

const roleCheck = (roles) => {
    return (req, res, next) => {
        // req.user l'afegeix el middleware auth prèviament
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autoritzat'
            });
        }

        // Comprovem si el rol de l'usuari està a la llista de rols permesos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'No tens permisos per accedir a aquest recurs'
            });
        }

        next();
    };
};

module.exports = roleCheck;