// utils/seedRoles.js
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const seedRoles = async () => {
    try {
        const allPermissions = await Permission.find();

        const getPermIds = (names) => {
            return allPermissions
                .filter(p => names.includes(p.name))
                .map(p => p._id);
        };

        // Crear rols en ordre jeràrquic (de menor a major nivell)
        // perquè els rols superiors necessiten referenciar els inferiors

        // Nivell 1 - VIEWER
        const viewer = await Role.findOneAndUpdate(
            { name: 'viewer' },
            {
                name: 'viewer',
                description: 'Només pot veure tasques',
                level: 1,
                parentRole: null,
                permissions: getPermIds(['tasks:read']),
                isSystemRole: false
            },
            { upsert: true, new: true }
        );

        // Nivell 2 - USER (hereta de viewer)
        const user = await Role.findOneAndUpdate(
            { name: 'user' },
            {
                name: 'user',
                description: 'Usuari estàndard',
                level: 2,
                parentRole: viewer._id,
                permissions: getPermIds([
                    'tasks:create',
                    'tasks:update',
                    'tasks:delete'
                ]),
                isSystemRole: true
            },
            { upsert: true, new: true }
        );

        // Nivell 2 - EDITOR (hereta de viewer, igual que user)
        await Role.findOneAndUpdate(
            { name: 'editor' },
            {
                name: 'editor',
                description: 'Pot crear i editar tasques',
                level: 2,
                parentRole: viewer._id,
                permissions: getPermIds([
                    'tasks:create',
                    'tasks:update',
                    'tasks:delete'
                ]),
                isSystemRole: false
            },
            { upsert: true, new: true }
        );

        // Nivell 3 - MANAGER (hereta de user)
        const manager = await Role.findOneAndUpdate(
            { name: 'manager' },
            {
                name: 'manager',
                description: 'Manager de projectes',
                level: 3,
                parentRole: user._id,
                permissions: getPermIds(['users:read', 'audit:read']),
                isSystemRole: false
            },
            { upsert: true, new: true }
        );

        // Nivell 4 - ADMIN (hereta de manager)
        const admin = await Role.findOneAndUpdate(
            { name: 'admin' },
            {
                name: 'admin',
                description: 'Administrador del sistema',
                level: 4,
                parentRole: manager._id,
                permissions: allPermissions.map(p => p._id),
                isSystemRole: true
            },
            { upsert: true, new: true }
        );

        // Nivell 5 - SUPER_ADMIN (hereta d'admin)
        await Role.findOneAndUpdate(
            { name: 'super_admin' },
            {
                name: 'super_admin',
                description: 'Super administrador amb accés total',
                level: 5,
                parentRole: admin._id,
                permissions: allPermissions.map(p => p._id),
                isSystemRole: true
            },
            { upsert: true, new: true }
        );

        console.log('Rols del sistema creats/verificats correctament');
    } catch (error) {
        console.error('Error creant rols:', error.message);
    }
};

module.exports = seedRoles;