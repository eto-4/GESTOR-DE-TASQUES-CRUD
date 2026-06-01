// controllers/auditController.js
const AuditLog = require('../models/AuditLog');

// GET /api/admin/audit-logs
// Suporta filtres per userId, action, startDate, endDate i paginació
exports.getAuditLogs = async (req, res) => {
    try {
        const { userId, action, startDate, endDate, page = 1, limit = 20 } = req.query;

        // Construir filtre dinàmicament segons els query params rebuts
        const filter = {};
        if (userId)    filter.userId = userId;
        if (action)    filter.action = action;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate)   filter.timestamp.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await AuditLog.countDocuments(filter);

        const logs = await AuditLog.find(filter)
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: logs.map(log => ({
                id: log._id,
                userId: log.userId?._id,
                userName: log.userId?.name,
                action: log.action,
                resource: log.resource,
                resourceType: log.resourceType,
                status: log.status,
                changes: log.changes,
                errorMessage: log.errorMessage,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                timestamp: log.timestamp
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els logs',
            details: error.message
        });
    }
};

// GET /api/admin/audit-logs/:id
exports.getAuditLogById = async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id)
            .populate('userId', 'name email');

        if (!log) {
            return res.status(404).json({
                success: false,
                error: 'Registre no trobat'
            });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint el log',
            details: error.message
        });
    }
};

// GET /api/admin/audit-logs/user/:userId
exports.getUserAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ userId: req.params.userId })
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint els logs de l\'usuari',
            details: error.message
        });
    }
};

// GET /api/admin/audit-logs/stats
exports.getAuditStats = async (req, res) => {
    try {
        const totalActions = await AuditLog.countDocuments();
        const successCount = await AuditLog.countDocuments({ status: 'success' });

        // Accions més comunes
        const topActions = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { action: '$_id', count: 1, _id: 0 } }
        ]);

        // Usuaris més actius
        const topUsers = await AuditLog.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $project: { userId: '$_id', userName: '$user.name', count: 1, _id: 0 } }
        ]);

        // Errors recents
        const recentErrors = await AuditLog.find({ status: 'error' })
            .sort({ timestamp: -1 })
            .limit(5)
            .select('action errorMessage timestamp');

        res.status(200).json({
            success: true,
            data: {
                totalActions,
                successRate: totalActions > 0
                    ? ((successCount / totalActions) * 100).toFixed(1)
                    : 0,
                topActions,
                topUsers,
                recentErrors
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obtenint les estadístiques',
            details: error.message
        });
    }
};