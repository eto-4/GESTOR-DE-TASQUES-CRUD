// services/delegationService.js
const DelegatedPermission = require('../models/DelegatedPermission');
const AuditLog = require('../models/AuditLog');

// Crea una delegació de permís temporal
const delegatePermission = async (fromUserId, toUserId, permissionId, reason, days, req) => {
    if (days <= 0) {
        throw new Error('Els dies de delegació han de ser positius');
    }

    const delegation = await DelegatedPermission.create({
        fromUserId,
        toUserId,
        permission: permissionId,
        reason,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        status: 'active'
    });

    // Registrar a l'auditoria
    await AuditLog.log(
        fromUserId,
        'permission:delegate',
        toUserId.toString(),
        'user',
        'success',
        { permissionId, days, reason },
        req
    );

    return delegation;
};

// Revoca una delegació manualment
const revokePermission = async (delegationId, revokedByUserId, req) => {
    const delegation = await DelegatedPermission.findByIdAndUpdate(
        delegationId,
        { revokedAt: new Date(), status: 'revoked' },
        { new: true }
    );

    if (!delegation) throw new Error('Delegació no trobada');

    await AuditLog.log(
        revokedByUserId,
        'permission:revoke',
        delegationId.toString(),
        'delegation',
        'success',
        null,
        req
    );

    return delegation;
};

// Obté els permisos delegats actius d'un usuari
const getActiveDelegations = async (userId) => {
    return DelegatedPermission.find({
        toUserId: userId,
        status: 'active',
        expiresAt: { $gt: new Date() }
    }).populate('permission');
};

module.exports = { delegatePermission, revokePermission, getActiveDelegations };