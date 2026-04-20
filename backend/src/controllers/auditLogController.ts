
import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import prisma from '../config/database';

// GET /api/audit-logs — general admin view (all logs, filterable)
export const getAllAuditLogs = async (req: Request, res: Response) => {
    try {
        const {
            entity,
            entityId,
            action,
            userId,
            page = '1',
            limit = '50',
        } = req.query;

        const where: any = {};
        if (entity) where.entity = entity;
        if (entityId) where.entityId = parseInt(entityId as string);
        if (action) where.action = action;
        if (userId) where.userId = parseInt(userId as string);

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true, role: true },
                    },
                },
            }),
            prisma.auditLog.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                logs,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error: any) {
        console.error('Get all audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message,
        });
    }
};

// GET /api/audit-logs/entity — filtered by entity+entityId (used by task detail)
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const { entity, entityId, action, entityType } = req.query;

        // Support both ?entity= and ?entityType= for backwards compat
        const entityName = (entity ?? entityType) as string | undefined;

        const where: any = {};
        if (entityName) where.entity = entityName;
        if (entityId) where.entityId = parseInt(entityId as string);
        if (action) where.action = action;

        const logs = await AuditService.getLogs(
            entityName ?? '',
            entityId ? parseInt(entityId as string) : 0
        );

        res.json({
            success: true,
            data: logs,
        });
    } catch (error: any) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message,
        });
    }
};
