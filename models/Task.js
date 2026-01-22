// models/Task.js
// Importar mongoose
const mongoose = require('mongoose');

// Definim l'esquema del producte
const TaskSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

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

    if (!update.$set) {
        update.$set = {};
    }

    // Sempre actualitzar updatedAt
    update.$set.updatedAt = new Date();

    if (update.$set.state === 'completed') {
        update.$set.finished_at = new Date();
    }

    if (
        update.$set.state &&
        update.$set.state !== 'completed'
    ) {
        update.$set.finished_at = null;
    }

    next();
});

module.exports = mongoose.model('Task', TaskSchema);