import Joi from 'joi';

export const updateUserSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    department: Joi.string().optional(),
    managerId: Joi.number().integer().optional().allow(null),
    hourlyRate: Joi.number().optional().allow(null),
    role: Joi.string().valid(
        'SUPER_ADMIN',
        'FINANCE_ADMIN',
        'PROJECT_MANAGER',
        'TEAM_LEAD',
        'EMPLOYEE',
        'CLIENT',
        'AUDITOR'
    ).optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    profilePicture: Joi.string().uri().optional().allow(null),
});
