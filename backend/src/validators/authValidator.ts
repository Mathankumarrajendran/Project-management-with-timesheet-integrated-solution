import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    employeeId: Joi.string().required(),
    role: Joi.string().valid(
        'SUPER_ADMIN',
        'FINANCE_ADMIN',
        'PROJECT_MANAGER',
        'TEAM_LEAD',
        'EMPLOYEE',
        'CLIENT',
        'AUDITOR'
    ).required(),
    department: Joi.string().optional(),
    managerId: Joi.number().integer().optional(),
    hourlyRate: Joi.number().optional(),
    phone: Joi.string().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
});

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
});
