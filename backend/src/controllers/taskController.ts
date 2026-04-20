import { Request, Response } from 'express';
import prisma from '../config/database';
import { TaskStatus, Priority, SlaStatus, TaskType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const RESTRICTED_ROLES = ['EMPLOYEE', 'TEAM_LEAD'];

// Calculate SLA status based on target hours and elapsed time
const calculateSlaStatus = (slaStartTime: Date | null, slaTargetHours: number | null): SlaStatus => {
    if (!slaStartTime || !slaTargetHours) return SlaStatus.NOT_STARTED;

    const now = new Date();
    const elapsedMs = now.getTime() - slaStartTime.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const percentage = (elapsedHours / slaTargetHours) * 100;

    if (percentage >= 100) return SlaStatus.BREACHED;
    if (percentage >= 80) return SlaStatus.AT_RISK;
    return SlaStatus.ON_TRACK;
};

// Get all tasks
export const getAllTasks = async (req: AuthRequest, res: Response) => {
    try {
        const {
            page = '1',
            limit = '10',
            projectId,
            assignedTo,
            status,
            priority,
            slaStatus,
            search,
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (projectId) where.projectId = parseInt(projectId as string);
        if (assignedTo) where.assignedTo = parseInt(assignedTo as string);
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (slaStatus) where.slaStatus = slaStatus;
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // RBAC: employees and team leads can only see tasks assigned to them
        if (req.user && RESTRICTED_ROLES.includes(req.user.role)) {
            where.assignedTo = req.user.userId;
        }
        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    assignee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            attachments: true,
                            subTasks: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.task.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error: any) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message,
        });
    }
};

// Get task by ID
export const getTaskById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        client: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePicture: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                parentTask: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                    },
                },
                subTasks: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        status: true,
                        assignedTo: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                attachments: {
                    orderBy: { createdAt: 'desc' },
                },
                sprint: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.json({
            success: true,
            data: task,
        });
    } catch (error: any) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error.message,
        });
    }
};

// Create task
export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const {
            projectId,
            title,
            description,
            taskType,
            priority,
            assignedTo,
            estimatedHours,
            slaTargetHours,
            parentTaskId,
            sprintId,
            storyPoints,
            tags,
        } = req.body;
        // NOTE: dueDate from client is intentionally ignored — always auto-calculated from SLA

        // Generate task code
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { code: true, slaPolicy: true },
        });

        const taskCount = await prisma.task.count({
            where: { projectId },
        });

        const code = `${project?.code}-${(taskCount + 1).toString().padStart(4, '0')}`;

        // Calculate SLA from Project Policy
        // slaPolicy stores values in DAYS (e.g. { HIGH: 2, MEDIUM: 4, LOW: 8 })
        // slaTargetHours in DB stores HOURS internally (days * 24)
        let slaDays: number | null = null;
        let calculatedSlaTarget: number | null = slaTargetHours ? slaTargetHours * 24 : null; // if manually passed (in days), convert
        let calculatedSlaEndTime: Date | null = null;
        const startTime = new Date();

        if (!slaDays && project?.slaPolicy) {
            const policy = project.slaPolicy as any;
            const taskPriority = priority || Priority.MEDIUM;
            if (policy[taskPriority]) {
                slaDays = parseInt(policy[taskPriority]); // days from policy
                calculatedSlaTarget = slaDays * 24;       // convert to hours for DB
            }
        } else if (slaTargetHours) {
            slaDays = slaTargetHours; // treat incoming slaTargetHours as days too
        }

        if (calculatedSlaTarget) {
            calculatedSlaEndTime = new Date(startTime.getTime() + calculatedSlaTarget * 60 * 60 * 1000);
        }

        // Auto-calculate dueDate = today + SLA days (directly — no conversion needed)
        let autoDueDate: Date | null = null;
        if (slaDays) {
            autoDueDate = new Date(startTime);
            autoDueDate.setDate(autoDueDate.getDate() + slaDays);
            autoDueDate.setHours(23, 59, 59, 0); // end of day
        }

        // Create task
        const task = await prisma.task.create({
            data: {
                code,
                projectId,
                title,
                description,
                taskType,
                priority: priority || Priority.MEDIUM,
                assignedTo,
                estimatedHours,
                dueDate: autoDueDate,
                slaTargetHours: calculatedSlaTarget,
                slaStartTime: calculatedSlaTarget ? startTime : null,
                slaEndTime: calculatedSlaEndTime,
                slaStatus: calculatedSlaTarget ? SlaStatus.ON_TRACK : SlaStatus.NOT_STARTED,
                status: assignedTo ? TaskStatus.ASSIGNED : TaskStatus.OPEN,
                parentTaskId,
                sprintId,
                storyPoints,
                tags,
                createdBy: req.user.userId,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                assignee: {
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
                'Task',
                task.id,
                { code, title, projectId, assignedTo, scheduledDueDate: autoDueDate, slaDays },
                req.ip,
                req.headers['user-agent']
            );
        }

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    } catch (error: any) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message,
        });
    }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { dueDateReason, ...rest } = req.body;
        const updateData: any = { ...rest };

        // ── Due Date Override: PM / Super Admin only ──────────────────────────
        const isDueDateChanging = updateData.dueDate !== undefined;
        if (isDueDateChanging) {
            const callerRole = req.user?.role;
            const ALLOWED_DUE_DATE_ROLES = ['SUPER_ADMIN', 'PROJECT_MANAGER'];
            if (!callerRole || !ALLOWED_DUE_DATE_ROLES.includes(callerRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only Project Managers and Super Admins can change the due date.',
                });
            }
            updateData.dueDate = new Date(updateData.dueDate);
        }

        // If assigning task and SLA target is set, start SLA timer
        const currentTask = await prisma.task.findUnique({
            where: { id: parseInt(id) },
        });

        if (currentTask && updateData.assignedTo && !currentTask.slaStartTime && currentTask.slaTargetHours) {
            updateData.slaStartTime = new Date();
            updateData.slaStatus = SlaStatus.ON_TRACK;
        }

        // Recalculate SLA status if task has an active SLA
        if (currentTask?.slaStartTime && currentTask.slaTargetHours) {
            updateData.slaStatus = calculateSlaStatus(currentTask.slaStartTime, currentTask.slaTargetHours);
        }

        const task = await prisma.task.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                project: true,
                assignee: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        if (req.user) {
            // Generic update audit
            await AuditService.logAction(
                req.user.userId,
                'UPDATE',
                'Task',
                task.id,
                updateData,
                req.ip,
                req.headers['user-agent']
            );

            // Dedicated DUE_DATE_OVERRIDE audit entry for full traceability
            if (isDueDateChanging && currentTask) {
                await AuditService.logAction(
                    req.user.userId,
                    'DUE_DATE_OVERRIDE',
                    'Task',
                    task.id,
                    {
                        oldDueDate: currentTask.dueDate ?? null,
                        newDueDate: updateData.dueDate,
                        reason: dueDateReason || 'No reason provided',
                        changedBy: req.user.userId,
                    },
                    req.ip,
                    req.headers['user-agent']
                );
            }
        }

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    } catch (error: any) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message,
        });
    }
};

// Update task status
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData: any = { status };

        const task = await prisma.task.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        // Audit Log
        if (req.user) {
            await AuditService.logAction(
                req.user.userId,
                'UPDATE',
                'Task',
                task.id,
                { status },
                req.ip,
                req.headers['user-agent']
            );
        }

        res.json({
            success: true,
            message: 'Task status updated successfully',
            data: task,
        });
    } catch (error: any) {
        console.error('Update task status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task status',
            error: error.message,
        });
    }
};


// Get comments for a task
export const getTaskComments = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const comments = await prisma.taskComment.findMany({
            where: { taskId: parseInt(id) },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: comments.map(c => ({
                id: c.id,
                content: c.comment,
                createdAt: c.createdAt,
                user: c.user,
            })),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
    }
};

// Add comment to task
export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const { id } = req.params;
        const { comment, content } = req.body;
        const commentText = comment || content;

        const taskComment = await prisma.taskComment.create({
            data: {
                taskId: parseInt(id),
                userId: req.user.userId,
                comment: commentText,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                id: taskComment.id,
                content: taskComment.comment,
                createdAt: taskComment.createdAt,
                user: taskComment.user,
            },
        });
    } catch (error: any) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message,
        });
    }
};

// Add attachment to task
export const addAttachment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { filename, originalName, mimeType, size, url, uploadedBy } = req.body;

        const attachment = await prisma.attachment.create({
            data: {
                taskId: parseInt(id),
                filename,
                originalName,
                mimeType,
                size,
                url,
                uploadedBy,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Attachment added successfully',
            data: attachment,
        });
    } catch (error: any) {
        console.error('Add attachment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add attachment',
            error: error.message,
        });
    }
};

// Get tasks by SLA status (for alerts/monitoring)
export const getTasksBySla = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;

        const tasks = await prisma.task.findMany({
            where: {
                slaStatus: status as SlaStatus,
                status: {
                    notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
                },
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { slaStartTime: 'asc' },
        });

        res.json({
            success: true,
            data: tasks,
        });
    } catch (error: any) {
        console.error('Get SLA tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch SLA tasks',
            error: error.message,
        });
    }
};
