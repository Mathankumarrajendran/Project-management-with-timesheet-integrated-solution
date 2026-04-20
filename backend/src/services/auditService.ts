
import prisma from '../config/database';

export const AuditService = {
    logAction: async (
        userId: number,
        action: string, // 'CREATE', 'UPDATE', 'DELETE'
        entity: string,
        entityId: number,
        changes?: any,
        ipAddress?: string,
        userAgent?: string
    ) => {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entity,
                    entityId,
                    changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined, // Ensure valid JSON
                    ipAddress,
                    userAgent,
                },
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw, failing to log shouldn't break the main operation
        }
    },

    getLogs: async (entity: string, entityId: number) => {
        const logs = await prisma.auditLog.findMany({
            where: { entity, entityId },
            orderBy: { createdAt: 'desc' },
        });

        // Manually fetch users to be safe if client isn't updated
        const userIds = [...new Set(logs.map(log => log.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true, email: true },
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        return logs.map(log => ({
            ...log,
            user: userMap.get(log.userId) || { firstName: 'Unknown', lastName: 'User', email: '' },
        }));
    }
};
