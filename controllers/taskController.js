// controllers/taskController.js
const { isValidObjectId } = require('mongoose');
const Task = require('../models/Task');

// ---------------------------------
//    OBTENIR TOTES LES TASQUES
//    Només retorna les tasques de l'usuari autenticat
// ---------------------------------
exports.getTasks = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    Task.countDocuments({ user: req.user._id })
        .then(total => {
            return Task.find({ user: req.user._id })
                .skip(skip)
                .limit(limit)
                .then(tasks => {
                    res.status(200).json({
                        success: true,
                        count: total,
                        page,
                        totalPages: Math.ceil(total / limit),
                        data: tasks
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                error: 'Error obtenint les tasques',
                details: err.message
            });
        });
};

// ---------------------------------
//      OBTENIR UNA TASCA ESPECÍFICA
//      Comprova que pertany a l'usuari
// ---------------------------------
exports.getTaskById = (req, res) => {
    // Comprovar que el format de l'id sigui correcte
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            error: 'Format d\'ID invàlid'
        });
    }

    // Busquem per _id I per user alhora: si la tasca no és de l'usuari, retorna null
    Task.findOne({ _id: req.params.id, user: req.user._id })
        .then(task => {
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Tasca no trobada'
                });
            }
            res.status(200).json({
                success: true,
                data: task
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                error: 'Error obtenint la tasca',
                details: err.message
            });
        });
};

// ---------------------------------
//         CREAR UNA TASCA
//    Assigna automàticament l'usuari autenticat
// ---------------------------------
exports.createTask = (req, res) => {
    // Afegim req.user._id al body per assegurar que l'usuari no pot
    // especificar manualment un altre propietari
    const taskData = {
        ...req.body,
        user: req.user._id
    };

    const task = new Task(taskData);
    task.save()
        .then(savedTask => {
            res.status(201).json({
                success: true,
                data: savedTask
            });
        })
        .catch(err => {
            res.status(400).json({
                success: false,
                error: 'No s\'ha pogut crear la tasca',
                details: err.message
            });
        });
};

// ---------------------------------
//      ACTUALITZAR LA TASCA
//    Comprova que pertany a l'usuari abans d'actualitzar
// ---------------------------------
exports.updateTask = (req, res) => {
    // Comprovar que el format de l'id sigui correcte
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            error: 'Format d\'ID invàlid'
        });
    }

    // findOneAndUpdate amb filtre user: garanteix que només actualitza
    // la tasca si pertany a l'usuari autenticat
    Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    )
    .then(updatedTask => {
        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                error: 'Tasca no trobada'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedTask
        });
    })
    .catch(err => {
        res.status(400).json({
            success: false,
            error: 'Error al actualitzar la tasca',
            details: err.message
        });
    });
};

// ---------------------------------
//       ELIMINAR UNA TASCA
//    Comprova que pertany a l'usuari abans d'eliminar
// ---------------------------------
exports.deleteTask = (req, res) => {
    // Comprovar format de l'id
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            error: 'Format d\'ID invàlid'
        });
    }

    Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        .then(deletedTask => {
            if (!deletedTask) {
                return res.status(404).json({
                    success: false,
                    error: 'Tasca no trobada'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Tasca eliminada amb èxit',
                data: deletedTask
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                error: 'Error eliminant la tasca',
                details: err.message
            });
        });
};