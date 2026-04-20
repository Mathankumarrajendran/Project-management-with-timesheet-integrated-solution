import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Super Admin Dashboard - Business Overview
export const getSuperAdminDashboard = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalProjects,
            activeProjects,
            totalClients,
            totalTasks,
            openTasks,
            breachedSLATasks,
            pendingL1Approvals,
            pendingL2Approvals,
            monthlyRevenue,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.project.count(),
            prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.client.count(),
            prisma.task.count(),
            prisma.task.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
            prisma.task.count({ where: { slaStatus: 'BREACHED' } }),
            prisma.weeklyTimesheet.count({ where: { status: 'SUBMITTED' } }),
            prisma.monthlyTimesheet.count({ where: { status: 'SUBMITTED' } }),
            prisma.monthlyTimesheet.aggregate({
                _sum: { totalHours: true },
                where: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                users: { total: totalUsers, active: activeUsers },
                projects: { total: totalProjects, active: activeProjects },
                clients: { total: totalClients },
                tasks: { total: totalTasks, open: openTasks, breached: breachedSLATasks },
                approvals: { pendingL1: pendingL1Approvals, pendingL2: pendingL2Approvals },
                totalHours: { monthly: monthlyRevenue._sum.totalHours || 0 },
            },
        });
    } catch (error: any) {
        console.error('Super admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message,
        });
    }
};

// Project Dashboard
export const getProjectDashboard = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: parseInt(projectId) },
            include: {
                client: true,
                projectManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        // sprints: true, // Sprint model doesn't exist
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        const [
            taskStats,
            slaStats,
            timeStats,
        ] = await Promise.all([
            prisma.task.groupBy({
                by: ['status'],
                _count: true,
                where: { projectId: parseInt(projectId) },
            }),
            prisma.task.groupBy({
                by: ['slaStatus'],
                _count: true,
                where: { projectId: parseInt(projectId) },
            }),
            prisma.timeLog.aggregate({
                _sum: { hours: true },
                where: { projectId: parseInt(projectId) },
            }),
        ]);

        const totalHours = timeStats._sum.hours || 0;
        const budgetUtilization = project.budgetHours
            ? (Number(totalHours) / Number(project.budgetHours)) * 100
            : 0;

        res.json({
            success: true,
            data: {
                project,
                stats: {
                    tasks: taskStats,
                    sla: slaStats,
                    hours: {
                        total: totalHours,
                        budget: project.budgetHours,
                        utilization: budgetUtilization,
                    },
                },
            },
        });
    } catch (error: any) {
        console.error('Project dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project dashboard',
            error: error.message,
        });
    }
};

// Employee Dashboard
export const getEmployeeDashboard = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const userId = req.user.userId;

        const [
            myTasks,
            myProjects,
            pendingApprovals,
            thisWeekHours,
            thisMonthHours,
        ] = await Promise.all([
            prisma.task.findMany({
                where: {
                    assignedTo: userId,
                    status: { notIn: ['COMPLETED', 'CANCELLED'] },
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
                orderBy: { dueDate: 'asc' },
                take: 10,
            }),
            prisma.projectMember.findMany({
                where: { userId },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            status: true,
                        },
                    },
                },
            }),
            prisma.weeklyTimesheet.count({
                where: {
                    userId,
                    status: 'SUBMITTED',
                },
            }),
            prisma.timeLog.aggregate({
                _sum: { hours: true },
                where: {
                    userId,
                    date: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    },
                },
            }),
            prisma.timeLog.aggregate({
                _sum: { hours: true },
                where: {
                    userId,
                    date: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                tasks: myTasks,
                projects: myProjects,
                stats: {
                    pendingApprovals,
                    thisWeekHours: thisWeekHours._sum.hours || 0,
                    thisMonthHours: thisMonthHours._sum.hours || 0,
                },
            },
        });
    } catch (error: any) {
        console.error('Employee dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee dashboard',
            error: error.message,
        });
    }
};

// Finance Dashboard
export const getFinanceDashboard = async (req: Request, res: Response) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const [
            pendingL2Approvals,
            monthlyTimesheets,
            totalPayroll,
            clientBilling,
            billableHours,
        ] = await Promise.all([
            prisma.monthlyTimesheet.count({
                where: { status: 'SUBMITTED' },
            }),
            prisma.monthlyTimesheet.findMany({
                where: {
                    year: currentYear,
                    month: currentMonth,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true,
                        },
                    },
                },
            }),
            prisma.monthlyTimesheet.aggregate({
                _sum: { totalHours: true },
                where: {
                    year: currentYear,
                    month: currentMonth,
                    status: 'L2_APPROVED',
                },
            }),
            prisma.project.aggregate({
                _sum: { budgetAmount: true },
                where: { status: 'IN_PROGRESS' },
            }),
            prisma.timeLog.aggregate({
                _sum: { hours: true },
                where: {
                    billable: true,
                    date: {
                        gte: new Date(currentYear, currentMonth - 1, 1),
                        lt: new Date(currentYear, currentMonth, 1),
                    },
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                pending: {
                    l2Approvals: pendingL2Approvals,
                },
                current: {
                    month: currentMonth,
                    year: currentYear,
                    timesheets: monthlyTimesheets,
                },
                financials: {
                    totalPayroll: totalPayroll._sum.totalHours || 0,
                    clientBilling: clientBilling._sum.budgetAmount || 0,
                    billableHours: billableHours._sum.hours || 0,
                },
            },
        });
    } catch (error: any) {
        console.error('Finance dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch finance dashboard',
            error: error.message,
        });
    }
};

// Client Portal Dashboard
export const getClientDashboard = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.params;

        const client = await prisma.client.findUnique({
            where: { id: parseInt(clientId) },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found',
            });
        }

        const [
            projects,
            totalSpent,
            activeProjects,
        ] = await Promise.all([
            prisma.project.findMany({
                where: { clientId: parseInt(clientId) },
                include: {
                    projectManager: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                },
            }),
            prisma.project.aggregate({
                _sum: { budgetAmount: true },
                where: { clientId: parseInt(clientId) },
            }),
            prisma.project.count({
                where: {
                    clientId: parseInt(clientId),
                    status: 'IN_PROGRESS',
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                client,
                projects,
                stats: {
                    totalProjects: projects.length,
                    activeProjects,
                    totalSpent: totalSpent._sum.budgetAmount || 0,
                },
            },
        });
    } catch (error: any) {
        console.error('Client dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch client dashboard',
            error: error.message,
        });
    }
};
