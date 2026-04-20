import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Time Logs Report — grouped by project, with billable breakdown
export const getTimeLogReport = async (req: AuthRequest, res: Response) => {
    try {
        const { from, to, projectId, userId } = req.query;

        const where: any = {};
        if (from) where.date = { ...(where.date || {}), gte: new Date(from as string) };
        if (to) where.date = { ...(where.date || {}), lte: new Date(to as string) };
        if (projectId) where.projectId = parseInt(projectId as string);
        if (userId) where.userId = parseInt(userId as string);

        const [byProject, byUser, totals] = await Promise.all([
            // Hours grouped by project
            prisma.timeLog.groupBy({
                by: ['projectId'],
                _sum: { hours: true },
                where,
            }),
            // Hours grouped by user
            prisma.timeLog.groupBy({
                by: ['userId'],
                _sum: { hours: true },
                where,
            }),
            // Overall totals
            prisma.timeLog.aggregate({
                _sum: { hours: true },
                where,
            }),
        ]);

        // Enrich project names
        const projectIds = byProject.map(p => p.projectId).filter(Boolean) as number[];
        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true, code: true },
        });
        const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

        // Enrich user names
        const userIds = byUser.map(u => u.userId).filter(Boolean) as number[];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true },
        });
        const userMap = Object.fromEntries(users.map(u => [u.id, u]));

        res.json({
            success: true,
            data: {
                byProject: byProject.map(r => ({
                    project: projectMap[r.projectId!] || { name: 'Unknown' },
                    totalHours: r._sum.hours ?? 0,
                })),
                byUser: byUser.map(r => ({
                    user: userMap[r.userId!] || { firstName: 'Unknown', lastName: '' },
                    totalHours: r._sum.hours ?? 0,
                })),
                totals: { totalHours: totals._sum.hours ?? 0 },
            },
        });
    } catch (error: any) {
        console.error('Time log report error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
};

// Task Report — grouped by status and priority
export const getTaskReport = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, from, to } = req.query;

        const where: any = {};
        if (projectId) where.projectId = parseInt(projectId as string);
        if (from) where.createdAt = { ...(where.createdAt || {}), gte: new Date(from as string) };
        if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to as string) };

        const [byStatus, byPriority, bySlaStatus, recentTasks] = await Promise.all([
            prisma.task.groupBy({ by: ['status'], _count: true, where }),
            prisma.task.groupBy({ by: ['priority'], _count: true, where }),
            prisma.task.groupBy({ by: ['slaStatus'], _count: true, where }),
            prisma.task.findMany({
                where: { slaStatus: 'BREACHED', ...where },
                include: {
                    project: { select: { id: true, name: true } },
                    assignee: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { dueDate: 'asc' },
                take: 10,
            }),
        ]);

        res.json({
            success: true,
            data: { byStatus, byPriority, bySlaStatus, breachedTasks: recentTasks },
        });
    } catch (error: any) {
        console.error('Task report error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
};

// Project Summary Report
export const getProjectReport = async (_req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                client: { select: { id: true, name: true } },
                projectManager: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { tasks: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get time logged per project
        const timeLogs = await prisma.timeLog.groupBy({
            by: ['projectId'],
            _sum: { hours: true },
        });
        const timeMap = Object.fromEntries(timeLogs.map(t => [t.projectId, t._sum.hours ?? 0]));

        const enriched = projects.map(p => ({
            ...p,
            loggedHours: timeMap[p.id] ?? 0,
        }));

        res.json({ success: true, data: enriched });
    } catch (error: any) {
        console.error('Project report error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
};
