import Joi from 'joi';

export const createClientSchema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    industry: Joi.string().optional().allow(null, ''),
    contactName: Joi.string().optional().allow(null, ''),
    contactEmail: Joi.string().email().optional().allow(null, ''),
    contactPhone: Joi.string().optional().allow(null, ''),
    billingAddress: Joi.string().optional().allow(null, ''),
    paymentTerms: Joi.string().optional().allow(null, ''),
    contractType: Joi.string().valid('FIXED_PRICE', 'TIME_AND_MATERIAL', 'RETAINER', 'DEDICATED_TEAM').optional().allow(null),
    contractValue: Joi.number().optional().allow(null),
    contractStart: Joi.date().optional().allow(null),
    contractEnd: Joi.date().optional().allow(null),
    currency: Joi.string().optional().allow(null, ''),
});

export const updateClientSchema = Joi.object({
    name: Joi.string().optional(),
    industry: Joi.string().optional().allow(null, ''),
    contactName: Joi.string().optional().allow(null, ''),
    contactEmail: Joi.string().email().optional().allow(null, ''),
    contactPhone: Joi.string().optional().allow(null, ''),
    billingAddress: Joi.string().optional().allow(null, ''),
    paymentTerms: Joi.string().optional().allow(null, ''),
    contractType: Joi.string().valid('FIXED_PRICE', 'TIME_AND_MATERIAL', 'RETAINER', 'DEDICATED_TEAM').optional().allow(null),
    contractValue: Joi.number().optional().allow(null),
    contractStart: Joi.date().optional().allow(null),
    contractEnd: Joi.date().optional().allow(null),
    currency: Joi.string().optional().allow(null, ''),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});
