// routes/delegationRoutes.js
const express = require('express');
const router = express.Router();
const delegationController = require('../controllers/delegationController');
const auth = require('../middleware/auth');

// Ordre important: /user/:userId abans de /:id
router.get('/user/:userId', auth, delegationController.getUserDelegations);
router.get('/:id',          auth, delegationController.getDelegationById);
router.get('/',             auth, delegationController.getAllDelegations);
router.post('/',            auth, delegationController.createDelegation);
router.delete('/:id',       auth, delegationController.revokeDelegation);

module.exports = router;