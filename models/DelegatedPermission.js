// models/DelegatedPermission.js
const mongoose = require('mongoose');

const delegatedPermissionSchema = new mongoose.Schema({
    // Usuari que delega el permís
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Usuari que rep el permís
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Permís delegat
    permission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
        required: true
    },
    reason: {
        type: String,
        trim: true
    },
    delegatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    // Data en que s'ha revocat manualment (null si encara activa)
    revokedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active'
    }
});

module.exports = mongoose.model('DelegatedPermission', delegatedPermissionSchema);