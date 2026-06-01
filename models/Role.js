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
    // Array de referències a permisos
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    // Els rols del sistema (admin, user) no es poden eliminar ni renombrar
    isSystemRole: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Mètode per afegir un permís al rol
roleSchema.methods.addPermission = function(permissionId) {
    if (!this.permissions.includes(permissionId)) {
        this.permissions.push(permissionId);
    }
    return this.save();
};

// Mètode per eliminar un permís del rol
roleSchema.methods.removePermission = function(permissionId) {
    this.permissions = this.permissions.filter(
        p => p.toString() !== permissionId.toString()
    );
    return this.save();
};

// Mètode per verificar si el rol té un permís pel nom
// Requereix que permissions estigui poblat (populate)
roleSchema.methods.hasPermission = function(permissionName) {
    return this.permissions.some(p => p.name === permissionName);
};

module.exports = mongoose.model('Role', roleSchema);