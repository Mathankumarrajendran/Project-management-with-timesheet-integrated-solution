import { Request, Response } from 'express';
import prisma from '../config/database';
import { Status } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

// Get all clients
export const getAllClients = async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '10',
            status,
            search,
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } },
                { industry: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.client.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                clients,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error: any) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clients',
            error: error.message,
        });
    }
};

// Get client by ID
export const getClientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const client = await prisma.client.findUnique({
            where: { id: parseInt(id) },
            include: {
                projects: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        status: true,
                        budgetAmount: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found',
            });
        }

        res.json({
            success: true,
            data: client,
        });
    } catch (error: any) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch client',
            error: error.message,
        });
    }
};

// Create client
export const createClient = async (req: AuthRequest, res: Response) => {
    try {
        const {
            code,
            name,
            industry,
            contactName,
            contactEmail,
            contactPhone,
            billingAddress,
            paymentTerms,
            contractType,
            contractValue,
            contractStart,
            contractEnd,
            currency,
        } = req.body;

        // Check if client with same code or name exists
        const existing = await prisma.client.findFirst({
            where: {
                OR: [{ code }, { name }],
            },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Client with this code or name already exists',
            });
        }

        const client = await prisma.client.create({
            data: {
                code,
                name,
                industry,
                contactName,
                contactEmail,
                contactPhone,
                billingAddress,
                paymentTerms,
                contractType,
                contractValue,
                contractStart: contractStart ? new Date(contractStart) : null,
                contractEnd: contractEnd ? new Date(contractEnd) : null,
                currency: currency || 'USD',
                createdBy: req.user?.userId || 1,
            },
        });

        // Audit Log
        if (req.user) {
            await AuditService.logAction(
                req.user.userId,
                'CREATE',
                'Client',
                client.id,
                client, // Log the created client data
                req.ip,
                req.headers['user-agent']
            );
        }

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: client,
        });
    } catch (error: any) {
        console.error('Create client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create client',
            error: error.message,
        });
    }
};

// Update client
export const updateClient = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Convert date strings to Date objects
        if (updateData.contractStart) {
            updateData.contractStart = new Date(updateData.contractStart);
        }
        if (updateData.contractEnd) {
            updateData.contractEnd = new Date(updateData.contractEnd);
        }

        const client = await prisma.client.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        // Audit Log
        if (req.user) {
            await AuditService.logAction(
                req.user.userId,
                'UPDATE',
                'Client',
                client.id,
                updateData,
                req.ip,
                req.headers['user-agent']
            );
        }

        res.json({
            success: true,
            message: 'Client updated successfully',
            data: client,
        });
    } catch (error: any) {
        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update client',
            error: error.message,
        });
    }
};

// Deactivate client
export const deactivateClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.client.update({
            where: { id: parseInt(id) },
            data: { status: Status.INACTIVE },
        });

        res.json({
            success: true,
            message: 'Client deactivated successfully',
        });
    } catch (error: any) {
        console.error('Deactivate client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate client',
            error: error.message,
        });
    }
};
