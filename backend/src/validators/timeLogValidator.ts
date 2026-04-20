import Joi from 'joi';

export const createTimeLogSchema = Joi.object({
    taskId: Joi.number().integer().required(),
    projectId: Joi.number().integer().required(),
    date: Joi.date().required(),
    hours: Joi.number().min(0.25).max(24).required(),
    description: Joi.string().required(),
    billable: Joi.boolean().optional(),
});

export const updateTimeLogSchema = Joi.object({
    hoursWorked: Joi.number().min(0.25).max(24).optional(),
    description: Joi.string().optional(),
    isBillable: Joi.boolean().optional(),
});

export const submitWeeklyTimesheetSchema = Joi.object({
    weekStartDate: Joi.date().required(),
    weekEndDate: Joi.date().required(),
});

export const approveTimesheetSchema = Joi.object({
    approved: Joi.boolean().required(),
    comments: Joi.string().optional().allow(''),
});

export const compileMonthlyTimesheetSchema = Joi.object({
    userId: Joi.number().integer().required(),
    year: Joi.number().integer().min(2020).max(2100).required(),
    month: Joi.number().integer().min(1).max(12).required(),
});
