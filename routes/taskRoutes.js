// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

router.use(auth);

router.get('/',     checkPermission('tasks:read'),   taskController.getTasks);
router.post('/',    checkPermission('tasks:create'),  taskController.createTask);
router.get('/:id',  checkPermission('tasks:read'),   taskController.getTaskById);
router.put('/:id',  checkPermission('tasks:update'),  taskController.updateTask);
router.delete('/:id', checkPermission('tasks:delete'), taskController.deleteTask);

module.exports = router;