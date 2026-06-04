// swagger.js
const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Gestor de Tasques API',
        description: 'API REST per gestionar tasques amb autenticació JWT, rols jeràrquics, permisos granulars i auditoria.',
        version: '1.0.0'
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Introdueix el token amb el format: Bearer <token>'
        }
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: 'Auth',        description: 'Autenticació i gestió de sessió' },
        { name: 'Users',       description: 'Gestió d\'usuaris' },
        { name: 'Tasks',       description: 'Gestió de tasques' },
        { name: 'Roles',       description: 'Gestió de rols' },
        { name: 'Permissions', description: 'Gestió de permisos' },
        { name: 'Delegations', description: 'Delegació de permisos' },
        { name: 'Audit',       description: 'Logs d\'auditoria' },
        { name: 'Admin',       description: 'Administració del sistema' },
        { name: 'Upload',      description: 'Pujada d\'arxius' }
    ]
};

const outputFile = './swagger-output.json';
const routes = [
    './routes/authRoutes.js',
    './routes/userRoutes.js',
    './routes/taskRoutes.js',
    './routes/roleRoutes.js',
    './routes/permissionRoutes.js',
    './routes/delegationRoutes.js',
    './routes/auditRoutes.js',
    './routes/adminRoutes.js',
    './routes/uploadRoutes.js'
];

swaggerAutogen(outputFile, routes, doc);