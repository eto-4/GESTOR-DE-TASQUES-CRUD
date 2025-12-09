// Importar mongoose
const mongoose = require('mongoose');

// Definim l'esquema del producte
const TaskSchema = new mongoose.Schema({

    title : {
        type: String,
        required: true,
        trim: true
    },

    description : {
        type: String,
        default: ''
    },

    tags : {
        type: [String],
        default: []
    },

    cost : {
        type: Number,
        default: 0
    },

    dueDate : {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },

    expectedHours : {
        type: Number,
        default: 20
    },

    usedHours : {
        type: Number,        
        default: 0
    },

    image : {
        url: { type: String },
        localName: { type: String },
        cloudPublicId: { type: String }
    },

    priority : {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },

    state : {
        type: String,
        enum: ['pending', 'in-progress', 'blocked', 'completed'],
        default: 'pending'
    },

    creationDate : {
        type: Date,
        default: Date.now
    },
    
    finished_at: 
    { 
        type: Date
    },
    
    lastUpdate : {
        type: Date,
        default: Date.now
    }
});

TaskSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();

    // Actualitzar la data de l'última modificació
    update.lastUpdate = Date.now();

    // Si es marca com a completada i no té data de finalització, afegir-la
    if (update.completed === true && !update.finished_at) {
        update.finished_at = new Date();
    }

    next();
});

module.exports = mongoose.model('Task', TaskSchema);