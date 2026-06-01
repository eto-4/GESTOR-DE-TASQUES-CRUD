// utils/seedRoles.js
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const seedRoles = async () => {
    try {
        // Obtenir tots els permisos de la BD per referenciar-los
        const allPermissions = await Permission.find();

        // Funció auxiliar per obtenir IDs de permisos per nom
        const getPermIds = (names) => {
            return allPermissions
                .filter(p => names.includes(p.name))
                .map(p => p._id);
        };

        const defaultRoles = [
            {
                name: 'admin',
                description: 'Accés total al sistema',
                // Admin té TOTS els permisos
                permissions: allPermissions.map(p => p._id),
                isSystemRole: true
            },
            {
                name: 'user',
                description: 'Usuari estàndard, gestiona les seves pròpies tasques',
                permissions: getPermIds([
                    'tasks:create',
                    'tasks:read',
                    'tasks:update',
                    'tasks:delete'
                ]),
                isSystemRole: true
            },
            {
                name: 'viewer',
                description: 'Només pot veure tasques',
                permissions: getPermIds(['tasks:read']),
                isSystemRole: false
            },
            {
                name: 'editor',
                description: 'Pot crear i editar tasques',
                permissions: getPermIds([
                    'tasks:create',
                    'tasks:read',
                    'tasks:update',
                    'tasks:delete'
                ]),
                isSystemRole: false
            }
        ];

        for (const roleData of defaultRoles) {
            await Role.findOneAndUpdate(
                { name: roleData.name },
                roleData,
                { upsert: true, new: true }
            );
        }
        console.log('Rols del sistema creats/verificats correctament');
    } catch (error) {
        console.error('Error creant rols:', error.message);
    }
};

module.exports = seedRoles;