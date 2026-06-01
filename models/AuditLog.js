// models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // Qui ha fet l'acció
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Què ha fet: "tasks:create", "users:manage", etc.
    action: {
        type: String,
        required: true
    },
    // ID del recurs afectat (tasca, usuari, rol...)
    resource: {
        type: String
    },
    // Tipus de recurs: "task", "user", "role", etc.
    resourceType: {
        type: String
    },
    // Si l'acció ha tingut èxit o ha fallat
    status: {
        type: String,
        enum: ['success', 'error'],
        required: true
    },
    // Canvis realitzats (camps anteriors i nous)
    changes: {
        type: Object
    },
    // Missatge d'error si status és "error"
    errorMessage: {
        type: String
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    // timestamps: false perquè usem timestamp propi
    timestamps: false
});

// Camp timestamp manual per tenir més control
auditLogSchema.add({
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Mètode estàtic per crear un registre fàcilment des de qualsevol lloc
auditLogSchema.statics.log = function(userId, action, resource, resourceType, status, changes, req, errorMessage) {
    return this.create({
        userId,
        action,
        resource,
        resourceType,
        status,
        changes,
        errorMessage,
        ipAddress: req ? req.ip : null,
        userAgent: req ? req.get('User-Agent') : null
    });
};

// Mètode estàtic per obtenir estadístiques
auditLogSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);