import { Request, Response } from 'express';
import prisma from '../config/database';

export const getClientDashboardData = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let clientId: number;

        if (user.role === 'CLIENT') {
            const client = await prisma.client.findFirst({
                where: { contactEmail: user.email },
            });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'No client profile matches your account email.',
                });
            }
            clientId = client.id;
        } else if (['SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
            const qId = req.query.clientId;
            if (!qId) {
                return res.status(400).json({
                    success: false,
                    message: 'Query parameter clientId is required for admin views.',
                });
            }
            clientId = parseInt(qId as string);
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
        }

        // Fetch client details
        const client = await prisma.client.findUnique({
            where: { id: clientId },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found.',
            });
        }

        // Fetch associated projects
        const projects = await prisma.project.findMany({
            where: { clientId },
            include: {
                projectManager: {
                    select: { id: true, firstName: true, lastName: true },
                },
                _count: {
                    select: { tasks: true, members: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Fetch task stats & task lists
        const tasks = await prisma.task.findMany({
            where: {
                project: { clientId },
            },
            include: {
                project: { select: { id: true, name: true, code: true } },
                assignee: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { dueDate: 'asc' },
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        const pendingTasks = totalTasks - completedTasks;

        // Fetch invoices associated with client (excluding CANCELLED)
        const invoices = await prisma.invoice.findMany({
            where: {
                clientId,
                status: { not: 'CANCELLED' },
            },
            orderBy: { issueDate: 'desc' },
        });

        res.json({
            success: true,
            data: {
                client,
                projects,
                tasksSummary: {
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                },
                tasks,
                invoices,
            },
        });
    } catch (error: any) {
        console.error('Client Portal Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch client dashboard data.',
            error: error.message,
        });
    }
};
