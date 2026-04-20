import Joi from 'joi';

export const createSprintSchema = Joi.object({
    projectId: Joi.number().integer().required(),
    name: Joi.string().required(),
    goal: Joi.string().optional().allow(''),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    sprintDuration: Joi.number().integer().min(1).max(30).optional(),
});

export const updateSprintSchema = Joi.object({
    name: Joi.string().optional(),
    goal: Joi.string().optional().allow(''),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    status: Joi.string().valid('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED').optional(),
});
