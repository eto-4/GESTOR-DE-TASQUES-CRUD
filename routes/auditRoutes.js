// routes/auditRoutes.js
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Ordre important: /stats i /user/:userId han d'anar ABANS de /:id
// perquè Express interpreta "stats" com un :id si va després
router.get('/stats',          auth, checkPermission('audit:read'), auditController.getAuditStats);
router.get('/user/:userId',   auth, checkPermission('audit:read'), auditController.getUserAuditLogs);
router.get('/:id',            auth, checkPermission('audit:read'), auditController.getAuditLogById);
router.get('/',               auth, checkPermission('audit:read'), auditController.getAuditLogs);

module.exports = router;