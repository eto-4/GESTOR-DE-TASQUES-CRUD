// models/TokenBlacklist.js
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    revokedAt: {
        type: Date,
        default: Date.now
    },
    // Quan expira el token original — per netejar la blacklist automàticament
    expiresAt: {
        type: Date,
        required: true
    }
});

// Index TTL — MongoDB elimina automàticament els documents quan expiresAt passa
// Això manté la blacklist neta sense haver de fer neteja manual
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);