import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { UserStatus } from '@prisma/client';

// Get all users (with pagination and filters)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '10',
            role,
            status,
            department,
            search,
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build filters
        const where: any = {};

        if (role) where.role = role;
        if (status) where.status = status;
        if (department) where.department = department;
        if (search) {
            where.OR = [
                { firstName: { contains: search as string, mode: 'insensitive' } },
                { lastName: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
                { employeeId: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // Get users and total count
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    employeeId: true,
                    role: true,
                    department: true,
                    phone: true,
                    profilePicture: true,
                    hourlyRate: true,
                    status: true,
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    createdAt: true,
                    lastLoginAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error: any) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message,
        });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                role: true,
                department: true,
                phone: true,
                profilePicture: true,
                hourlyRate: true,
                status: true,
                twoFaEnabled: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                subordinates: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        employeeId: true,
                        role: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message,
        });
    }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            phone,
            department,
            managerId,
            hourlyRate,
            role,
            status,
        } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                firstName,
                lastName,
                phone,
                department,
                managerId,
                hourlyRate,
                role,
                status,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                role: true,
                department: true,
                phone: true,
                hourlyRate: true,
                status: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message,
        });
    }
};

// Update own profile
export const updateOwnProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const { firstName, lastName, phone, profilePicture } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                firstName,
                lastName,
                phone,
                profilePicture,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                profilePicture: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message,
        });
    }
};

// Deactivate user (soft delete)
export const deactivateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: UserStatus.INACTIVE },
        });

        res.json({
            success: true,
            message: 'User deactivated successfully',
        });
    } catch (error: any) {
        console.error('Deactivate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate user',
            error: error.message,
        });
    }
};

// Activate user
export const activateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: UserStatus.ACTIVE },
        });

        res.json({
            success: true,
            message: 'User activated successfully',
        });
    } catch (error: any) {
        console.error('Activate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate user',
            error: error.message,
        });
    }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            activeUsers,
            usersByRole,
            usersByDepartment,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
            prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            prisma.user.groupBy({
                by: ['department'],
                _count: true,
                where: { department: { not: null } },
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                byRole: usersByRole,
                byDepartment: usersByDepartment,
            },
        });
    } catch (error: any) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message,
        });
    }
};
