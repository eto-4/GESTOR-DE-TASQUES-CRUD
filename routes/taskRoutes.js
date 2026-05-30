// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// router.use(auth) aplica el middleware a TOTES les rutes definides a continuació
// Qualsevol petició sense token vàlid rebrà un 401 abans d'arribar al controlador
router.use(auth);

router.post('/',    taskController.createTask);
router.get('/',     taskController.getTasks);
router.get('/:id',  taskController.getTaskById);
router.put('/:id',  taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;