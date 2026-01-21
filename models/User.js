const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { use } = require('react');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'El nom no pot tenir més de 50 caràcters']
    },
    email: {
        type: String,
        required:  [true, 'L\'email és obligatori.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\.\S+$/, 'Si us plau, introdueix un email, vàlid.']
    },
    password: {
        type: String,
        required: [true, 'La contrasenya es obligatoria.'],
        minlength: [6, 'La contrasenya ha de tenir minim 6 caràcters'],
        select: false //No s'inclourà a les consultes.
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
},{ timestamps: true }); // Crea automàticament createdAt i updatedAt

// Middleware pre-save per hash
userSchema.pre('save', async function(next){
    // nomes fer hash si la contrasenya es nova o ha sigut modificada.
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Mètode per comparar contrasenyes
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Mètode per transformar l'objecte a JSON (sense contrasenya)
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
}

module.exports = mongoose.model('User', userSchema);