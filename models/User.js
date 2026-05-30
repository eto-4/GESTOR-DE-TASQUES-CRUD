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
        // Fix: faltava el domini entre @ i .
        match: [/^\S+@\S+\.\S+$/, 'Si us plau, introdueix un email vàlid.']
    },
    password: {
        type: String,
        required: [true, 'La contrasenya és obligatoria.'],
        minlength: [6, 'La contrasenya ha de tenir mínim 6 caràcters'],
        select: false // No s'inclourà a les consultes per defecte
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true }); // Crea automàticament createdAt i updatedAt

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

// Mètode per comparar la contrasenya introduïda amb la xifrada
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Mètode toJSON: elimina la contrasenya de les respostes automàticament
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);