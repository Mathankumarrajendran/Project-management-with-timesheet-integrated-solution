import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Sprint status constants (stored as plain strings in DB)
const SprintStatus = {
    PLANNING: 'PLANNING',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

// Get all sprints
export const getAllSprints = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query;

        const where: any = {};
        if (projectId) where.projectId = parseInt(projectId as string);

        const sprints = await prisma.sprint.findMany({
            where,
            include: {
                project: {
                    select: { id: true, name: true, code: true },
                },
                tasks: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        status: true,
                        storyPoints: true,
                    },
                },
                _count: {
                    select: { tasks: true },
                },
            },
            orderBy: { startDate: 'desc' },
        });

        res.json({ success: true, data: sprints });
    } catch (error: any) {
        console.error('Get sprints error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sprints', error: error.message });
    }
};

// Get sprint by ID
export const getSprintById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const sprint = await prisma.sprint.findUnique({
            where: { id: parseInt(id) },
            include: {
                project: {
                    select: { id: true, name: true, code: true },
                },
                tasks: {
                    include: {
                        assignee: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        const totalStoryPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedStoryPoints = sprint.tasks
            .filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED')
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        res.json({
            success: true,
            data: {
                ...sprint,
                metrics: {
                    totalStoryPoints,
                    completedStoryPoints,
                    remainingStoryPoints: totalStoryPoints - completedStoryPoints,
                    completionPercentage: totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0,
                },
            },
        });
    } catch (error: any) {
        console.error('Get sprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sprint', error: error.message });
    }
};

// Create sprint
export const createSprint = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { projectId, name, goal, startDate, endDate, plannedPoints } = req.body;

        const sprint = await prisma.sprint.create({
            data: {
                projectId: parseInt(projectId),
                name,
                goal: goal || null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: SprintStatus.PLANNING,
                plannedPoints: plannedPoints ? parseInt(plannedPoints) : null,
            },
            include: {
                project: {
                    select: { id: true, name: true, code: true },
                },
            },
        });

        res.status(201).json({ success: true, message: 'Sprint created successfully', data: sprint });
    } catch (error: any) {
        console.error('Create sprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to create sprint', error: error.message });
    }
};

// Update sprint
export const updateSprint = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, goal, startDate, endDate, plannedPoints, completedPoints, status } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (goal !== undefined) updateData.goal = goal;
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        if (plannedPoints !== undefined) updateData.plannedPoints = parseInt(plannedPoints);
        if (completedPoints !== undefined) updateData.completedPoints = parseInt(completedPoints);
        if (status) updateData.status = status;

        const sprint = await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        res.json({ success: true, message: 'Sprint updated successfully', data: sprint });
    } catch (error: any) {
        console.error('Update sprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to update sprint', error: error.message });
    }
};

// Start sprint
export const startSprint = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check no other active sprint for this project
        const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } });
        if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });

        const activeSprint = await prisma.sprint.findFirst({
            where: { projectId: sprint.projectId, status: SprintStatus.ACTIVE },
        });
        if (activeSprint && activeSprint.id !== sprint.id) {
            return res.status(400).json({ success: false, message: 'Another sprint is already active for this project' });
        }

        const updated = await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: { status: SprintStatus.ACTIVE },
        });

        res.json({ success: true, message: 'Sprint started successfully', data: updated });
    } catch (error: any) {
        console.error('Start sprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to start sprint', error: error.message });
    }
};

// Complete sprint
export const completeSprint = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Calculate completed points from tasks
        const sprintWithTasks = await prisma.sprint.findUnique({
            where: { id: parseInt(id) },
            include: {
                tasks: { select: { storyPoints: true, status: true } },
            },
        });
        if (!sprintWithTasks) return res.status(404).json({ success: false, message: 'Sprint not found' });

        const completedPoints = sprintWithTasks.tasks
            .filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED')
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        const updated = await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: {
                status: SprintStatus.COMPLETED,
                completedPoints,
            },
        });

        res.json({ success: true, message: 'Sprint completed successfully', data: updated });
    } catch (error: any) {
        console.error('Complete sprint error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete sprint', error: error.message });
    }
};

// Get sprint burndown data
export const getSprintBurndown = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const sprint = await prisma.sprint.findUnique({
            where: { id: parseInt(id) },
            include: {
                tasks: {
                    select: { storyPoints: true, status: true, updatedAt: true },
                },
            },
        });

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        const totalStoryPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const sprintDays = Math.max(1, Math.ceil((sprint.endDate.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24)));

        const idealBurndown = Array.from({ length: sprintDays + 1 }, (_, i) => ({
            day: i,
            ideal: totalStoryPoints - (totalStoryPoints / sprintDays) * i,
        }));

        // Use updatedAt as proxy for completion time
        const completedTasks = sprint.tasks
            .filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED')
            .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

        const actualBurndown: any[] = [{ day: 0, remaining: totalStoryPoints }];
        let remaining = totalStoryPoints;

        completedTasks.forEach(task => {
            const daysSinceStart = Math.ceil(
                (task.updatedAt.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            remaining -= task.storyPoints || 0;
            actualBurndown.push({ day: daysSinceStart, remaining });
        });

        res.json({
            success: true,
            data: { totalStoryPoints, ideal: idealBurndown, actual: actualBurndown },
        });
    } catch (error: any) {
        console.error('Get sprint burndown error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch burndown data', error: error.message });
    }
};
