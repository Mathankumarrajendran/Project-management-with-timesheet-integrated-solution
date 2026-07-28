import { Request, Response } from 'express';
import prisma from '../config/database';

export const getClientDashboardData = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let clientId: number;

        // ── Resolve clientId in a single query ────────────────────────────────
        if (user.role === 'CLIENT') {
            const client = await prisma.client.findFirst({
                where: { contactEmail: user.email },
                select: { id: true },
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
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        // ── All three data fetches run in parallel ─────────────────────────────
        const [client, projects, tasks, invoices] = await Promise.all([
            // Client details
            prisma.client.findUnique({
                where: { id: clientId },
            }),

            // Projects for this client
            prisma.project.findMany({
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
            }),

            // Tasks across all client projects
            prisma.task.findMany({
                where: { project: { clientId } },
                select: {
                    id: true,
                    code: true,
                    title: true,
                    status: true,
                    priority: true,
                    slaStatus: true,
                    dueDate: true,
                    project: { select: { id: true, name: true, code: true } },
                    assignee: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { dueDate: 'asc' },
            }),

            // Invoices for this client (excluding cancelled)
            prisma.invoice.findMany({
                where: { clientId, status: { not: 'CANCELLED' } },
                orderBy: { issueDate: 'desc' },
            }),
        ]);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found.' });
        }

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        const pendingTasks = totalTasks - completedTasks;

        res.json({
            success: true,
            data: {
                client,
                projects,
                tasksSummary: { totalTasks, completedTasks, pendingTasks },
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
