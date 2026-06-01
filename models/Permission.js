// models/Permission.js
const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    // Nom únic del permís en format "recurs:acció"
    // Exemples: tasks:create, users:manage, roles:read
    name: {
        type: String,
        required: [true, 'El nom del permís és obligatori'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripció és obligatòria'],
        trim: true
    },
    // Categoria per agrupar permisos relacionats
    // Exemples: tasks, users, roles, reports, audit
    category: {
        type: String,
        required: [true, 'La categoria és obligatòria'],
        trim: true
    },
    // Els permisos del sistema no es poden eliminar
    isSystemPermission: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);