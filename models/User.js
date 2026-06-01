// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'El nom no pot tenir més de 50 caràcters']
    },
    email: {
        type: String,
        required: [true, 'L\'email és obligatori.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Si us plau, introdueix un email vàlid.']
    },
    password: {
        type: String,
        required: [true, 'La contrasenya és obligatoria.'],
        minlength: [6, 'La contrasenya ha de tenir mínim 6 caràcters'],
        select: false
    },
    // Array de referències a rols (un usuari pot tenir múltiples rols)
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
}, { timestamps: true });

// Hook pre-save: xifra la contrasenya només si ha estat modificada
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compara la contrasenya introduïda amb la xifrada
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Elimina la contrasenya de les respostes JSON automàticament
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Afegeix un rol a l'usuari si no el té ja
userSchema.methods.addRole = function(roleId) {
    if (!this.roles.includes(roleId)) {
        this.roles.push(roleId);
    }
    return this.save();
};

// Elimina un rol de l'usuari
userSchema.methods.removeRole = function(roleId) {
    this.roles = this.roles.filter(
        r => r.toString() !== roleId.toString()
    );
    return this.save();
};

// Retorna tots els permisos efectius combinant tots els rols
// Requereix que roles estigui poblat amb populate('roles')
// i que els permisos de cada rol estiguin poblats amb populate('roles.permissions')
userSchema.methods.getEffectivePermissions = function() {
    const permissions = new Set();
    this.roles.forEach(role => {
        if (role.permissions) {
            role.permissions.forEach(permission => {
                permissions.add(permission.name);
            });
        }
    });
    return Array.from(permissions);
};

// Verifica si l'usuari té un permís específic
userSchema.methods.hasPermission = function(permissionName) {
    return this.getEffectivePermissions().includes(permissionName);
};

module.exports = mongoose.model('User', userSchema);