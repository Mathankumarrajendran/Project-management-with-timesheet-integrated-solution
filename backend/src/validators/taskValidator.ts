import Joi from 'joi';

export const createTaskSchema = Joi.object({
    projectId: Joi.number().integer().required(),
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    taskType: Joi.string().valid(
        'DEVELOPMENT',
        'TESTING',
        'DESIGN',
        'DOCUMENTATION',
        'BUG_FIX',
        'ENHANCEMENT',
        'MEETING',
        'SUPPORT',
        'OTHER'
    ).required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    assignedTo: Joi.number().integer().optional().allow(null),
    estimatedHours: Joi.number().optional().allow(null),
    dueDate: Joi.date().optional().allow(null),
    slaTargetHours: Joi.number().integer().optional().allow(null),
    parentTaskId: Joi.number().integer().optional().allow(null),
    sprintId: Joi.number().integer().optional().allow(null),
    storyPoints: Joi.number().integer().optional().allow(null),
    tags: Joi.array().items(Joi.string()).optional(),
});

export const updateTaskSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    taskType: Joi.string().valid(
        'DEVELOPMENT',
        'TESTING',
        'DESIGN',
        'DOCUMENTATION',
        'BUG_FIX',
        'ENHANCEMENT',
        'MEETING',
        'SUPPORT',
        'OTHER'
    ).optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    assignedTo: Joi.number().integer().optional().allow(null),
    estimatedHours: Joi.number().optional().allow(null),
    dueDate: Joi.date().optional().allow(null),
    slaTargetHours: Joi.number().integer().optional().allow(null),
    status: Joi.string().valid(
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'IN_REVIEW',
        'COMPLETED',
        'APPROVED',
        'ON_HOLD',
        'CANCELLED'
    ).optional(),
    storyPoints: Joi.number().integer().optional().allow(null),
    tags: Joi.array().items(Joi.string()).optional(),
});

export const updateTaskStatusSchema = Joi.object({
    status: Joi.string().valid(
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'IN_REVIEW',
        'COMPLETED',
        'APPROVED',
        'ON_HOLD',
        'CANCELLED'
    ).required(),
});

export const addCommentSchema = Joi.object({
    comment: Joi.string(),
    content: Joi.string(),
}).or('comment', 'content'); // frontend sends 'content', legacy sends 'comment'

export const addAttachmentSchema = Joi.object({
    filename: Joi.string().required(),
    originalName: Joi.string().required(),
    mimeType: Joi.string().required(),
    size: Joi.number().integer().required(),
    url: Joi.string().uri().required(),
    uploadedBy: Joi.number().integer().required(),
});
