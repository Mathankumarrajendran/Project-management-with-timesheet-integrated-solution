import { Request, Response } from 'express';
import prisma from '../config/database';
import { ProjectStatus, BillingType, HealthStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const RESTRICTED_ROLES = ['EMPLOYEE', 'TEAM_LEAD'];

// Get all projects
export const getAllProjects = async (req: AuthRequest, res: Response) => {
    try {
        const {
            page = '1',
            limit = '10',
            clientId,
            status,
            projectManagerId,
            search,
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (clientId) where.clientId = parseInt(clientId as string);
        if (status) where.status = status;
        if (projectManagerId) where.projectManagerId = parseInt(projectManagerId as string);
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // RBAC: employees and team leads can only see projects they are members of
        if (req.user && RESTRICTED_ROLES.includes(req.user.role)) {
            where.members = { some: { userId: req.user.userId } };
        }

        // RBAC: project managers can only see projects they manage or are a member of
        if (req.user && req.user.role === 'PROJECT_MANAGER') {
            where.OR = [
                { projectManagerId: req.user.userId },
                { members: { some: { userId: req.user.userId } } },
            ];
        }
        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    projectManager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
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
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.project.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error: any) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message,
        });
    }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: {
                client: true,
                projectManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                                hourlyRate: true,
                            },
                        },
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        status: true,
                        priority: true,
                        assignedTo: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                sprints: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        startDate: true,
                        endDate: true,
                    },
                    orderBy: { startDate: 'desc' },
                },
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.json({
            success: true,
            data: project,
        });
    } catch (error: any) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message,
        });
    }
};

// Create project
export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const {
            code,
            name,
            clientId,
            projectType,
            billingType,
            projectManagerId,
            startDate,
            endDate,
            budgetHours,
            budgetAmount,
            description,
            slaPolicy,
        } = req.body;

        // Check if project code exists
        const existing = await prisma.project.findUnique({
            where: { code },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Project with this code already exists',
            });
        }

        const project = await prisma.project.create({
            data: {
                code,
                name,
                clientId,
                projectType,
                billingType: billingType || BillingType.BILLABLE,
                projectManagerId,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budgetHours,
                budgetAmount,
                description,
                slaPolicy,
                status: ProjectStatus.PLANNING,
                healthStatus: HealthStatus.ON_TRACK,
                createdBy: req.user?.userId || 1,
            },
            include: {
                client: true,
                projectManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Audit Log
        if (req.user) {
            await AuditService.logAction(
                req.user.userId,
                'CREATE',
                'Project',
                project.id,
                { code, name, description },
                req.ip,
                req.headers['user-agent']
            );
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project,
        });
    } catch (error: any) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message,
        });
    }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Convert dates
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

        const project = await prisma.project.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                client: true,
                projectManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Audit Log
        if (req.user) {
            await AuditService.logAction(
                req.user.userId,
                'UPDATE',
                'Project',
                project.id,
                updateData,
                req.ip,
                req.headers['user-agent']
            );
        }

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: project,
        });
    } catch (error: any) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message,
        });
    }
};

// Add team member to project
export const addTeamMember = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, role, hourlyRate } = req.body;
        const projectId = parseInt(id);

        // PM ownership check: PM can only manage members on their own projects
        if (req.user?.role === 'PROJECT_MANAGER') {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { projectManagerId: true } });
            if (!project || project.projectManagerId !== req.user.userId) {
                return res.status(403).json({ success: false, message: 'You can only manage members of projects you manage.' });
            }
        }

        // Check if member already exists
        const existing = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'User is already a member of this project' });
        }

        const member = await prisma.projectMember.create({
            data: { projectId, userId, role, hourlyRate },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
            },
        });

        res.status(201).json({ success: true, message: 'Team member added successfully', data: member });
    } catch (error: any) {
        console.error('Add team member error:', error);
        res.status(500).json({ success: false, message: 'Failed to add team member', error: error.message });
    }
};

// Remove team member from project
export const removeTeamMember = async (req: AuthRequest, res: Response) => {
    try {
        const { id, userId } = req.params;
        const projectId = parseInt(id);

        // PM ownership check
        if (req.user?.role === 'PROJECT_MANAGER') {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { projectManagerId: true } });
            if (!project || project.projectManagerId !== req.user.userId) {
                return res.status(403).json({ success: false, message: 'You can only manage members of projects you manage.' });
            }
        }

        await prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId: parseInt(userId) } },
        });

        res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error: any) {
        console.error('Remove team member error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove team member', error: error.message });
    }
};
