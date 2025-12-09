// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

/**
 * Rutes principals per a la gestió de tasques.
 * Proporciona operacions CRUD: crear, llegir, actualitzar i eliminar tasques.
 */

// Crear una nova tasca
router.post('/', taskController.createTask);

// Obtenir totes les tasques
router.get('/', taskController.getTasks); 

// Obtenir una tasca concreta per ID
router.get('/:id', taskController.getTaskById);

// Actualitzar una tasca per ID
router.put('/:id', taskController.updateTask);

// Eliminar una tasca per ID
router.delete('/:id', taskController.deleteTask);

module.exports = router;