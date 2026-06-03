// controllers/delegationController.js
const DelegatedPermission = require('../models/DelegatedPermission');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { delegatePermission, revokePermission } = require('../services/delegationService');
const { isValidObjectId } = require('../utils/errorResponse');

// GET /api/delegations
exports.getAllDelegations = async (req, res) => {
    try {
        const delegations = await DelegatedPermission.find()
            .populate('fromUserId', 'name email')
            .populate('toUserId', 'name email')
            .populate('permission', 'name description')
            .sort({ delegatedAt: -1 });

        res.status(200).json({
            success: true,
            count: delegations.length,
            data: delegations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint les delegacions',
            details: error.message
        });
    }
};

// GET /api/delegations/:id
exports.getDelegationById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const delegation = await DelegatedPermission.findById(req.params.id)
            .populate('fromUserId', 'name email')
            .populate('toUserId', 'name email')
            .populate('permission', 'name description');

        if (!delegation) {
            return res.status(404).json({
                success: false,
                error: 'Delegació no trobada'
            });
        }

        res.status(200).json({
            success: true,
            data: delegation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint la delegació',
            details: error.message
        });
    }
};

// POST /api/delegations
exports.createDelegation = async (req, res) => {
    try {
        const { toUserId, permission, reason, daysValid } = req.body;

        if (!isValidObjectId(toUserId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID d\'usuari invàlid'
            });
        }

        if (!daysValid || daysValid <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Els dies de delegació han de ser positius'
            });
        }

        // Buscar el permís pel nom
        const permissionDoc = await Permission.findOne({ name: permission });
        if (!permissionDoc) {
            return res.status(404).json({
                success: false,
                error: 'Permís no trobat'
            });
        }

        // Verificar que l'usuari destinatari existeix
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({
                success: false,
                error: 'Usuari destinatari no trobat'
            });
        }

        // No es pot delegar a un mateix
        if (toUserId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'No pots delegar permisos a tu mateix'
            });
        }

        const delegation = await delegatePermission(
            req.user._id,
            toUserId,
            permissionDoc._id,
            reason,
            daysValid,
            req
        );

        await delegation.populate([
            { path: 'fromUserId', select: 'name email' },
            { path: 'toUserId', select: 'name email' },
            { path: 'permission', select: 'name description' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Permís delegat correctament',
            data: delegation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error creant la delegació',
            details: error.message
        });
    }
};

// DELETE /api/delegations/:id
exports.revokeDelegation = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const delegation = await DelegatedPermission.findById(req.params.id);
        if (!delegation) {
            return res.status(404).json({
                success: false,
                error: 'Delegació no trobada'
            });
        }

        // Només el qui va delegar o un admin pot revocar
        const isOwner = delegation.fromUserId.toString() === req.user._id.toString();
        const isAdmin = req.user.roles.some(r => r.name === 'admin');

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'No tens permís per revocar aquesta delegació'
            });
        }

        const revoked = await revokePermission(req.params.id, req.user._id, req);

        res.status(200).json({
            success: true,
            message: 'Delegació revocada correctament',
            data: revoked
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error revocant la delegació',
            details: error.message
        });
    }
};

// GET /api/delegations/user/:userId
exports.getUserDelegations = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.userId)) {
            return res.status(400).json({
                success: false,
                error: 'Format d\'ID invàlid'
            });
        }

        const delegations = await DelegatedPermission.find({
            $or: [
                { toUserId: req.params.userId },
                { fromUserId: req.params.userId }
            ]
        })
            .populate('fromUserId', 'name email')
            .populate('toUserId', 'name email')
            .populate('permission', 'name description')
            .sort({ delegatedAt: -1 });

        res.status(200).json({
            success: true,
            count: delegations.length,
            data: delegations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint les delegacions de l\'usuari',
            details: error.message
        });
    }
};