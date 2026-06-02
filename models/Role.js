// models/Role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nom del rol és obligatori'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Nivell jeràrquic: com més alt, més permisos
    // SUPER_ADMIN=5, ADMIN=4, MANAGER=3, USER=2, VIEWER=1
    level: {
        type: Number,
        default: 1
    },
    // Referència al rol pare — hereta els seus permisos
    parentRole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        default: null
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isSystemRole: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Afegir permís al rol
roleSchema.methods.addPermission = function(permissionId) {
    if (!this.permissions.includes(permissionId)) {
        this.permissions.push(permissionId);
    }
    return this.save();
};

// Eliminar permís del rol
roleSchema.methods.removePermission = function(permissionId) {
    this.permissions = this.permissions.filter(
        p => p.toString() !== permissionId.toString()
    );
    return this.save();
};

// Verificar si el rol té un permís (requereix populate)
roleSchema.methods.hasPermission = function(permissionName) {
    return this.permissions.some(p => p.name === permissionName);
};

module.exports = mongoose.model('Role', roleSchema);