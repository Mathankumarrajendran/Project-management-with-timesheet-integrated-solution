import Joi from 'joi';

export const createProjectSchema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    clientId: Joi.number().integer().required(),
    projectType: Joi.string().optional().allow(null, ''),
    billingType: Joi.string().valid('BILLABLE', 'NON_BILLABLE', 'INTERNAL').optional(),
    projectManagerId: Joi.number().integer().optional().allow(null),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null),
    budgetHours: Joi.number().optional().allow(null),
    budgetAmount: Joi.number().optional().allow(null),
    description: Joi.string().optional().allow(null, ''),
    slaPolicy: Joi.object().optional().allow(null),
});

export const updateProjectSchema = Joi.object({
    name: Joi.string().optional(),
    clientId: Joi.number().integer().optional().allow(null),
    projectType: Joi.string().optional().allow(null, ''),
    billingType: Joi.string().valid('BILLABLE', 'NON_BILLABLE', 'INTERNAL').optional(),
    projectManagerId: Joi.number().integer().optional().allow(null),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null),
    budgetHours: Joi.number().optional().allow(null),
    budgetAmount: Joi.number().optional().allow(null),
    description: Joi.string().optional().allow(null, ''),
    status: Joi.string().valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED').optional(),
    healthStatus: Joi.string().valid('ON_TRACK', 'AT_RISK', 'OFF_TRACK').optional(),
    slaPolicy: Joi.object().optional().allow(null),
});

export const addTeamMemberSchema = Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().required(),
    hourlyRate: Joi.number().optional().allow(null),
});
