import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken, generateResetToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

// Register user (Super Admin only)
export const register = async (req: Request, res: Response) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            employeeId,
            role,
            department,
            managerId,
            hourlyRate,
            phone,
        } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { employeeId },
                ],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or employee ID already exists',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                employeeId,
                role,
                department,
                managerId,
                hourlyRate,
                phone,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                role: true,
                department: true,
                createdAt: true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message,
        });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account is not active. Please contact administrator.',
            });
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }


        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
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
                        email: true,
                    },
                },
                createdAt: true,
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
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message,
        });
    }
};

// Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // TODO: Send email with reset link
        // For now, just log it (in production, use nodemailer/sendgrid)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: ${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`);

        res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.',
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request',
            error: error.message,
        });
    }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gte: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message,
        });
    }
};

// Update own password
export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error: any) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password',
            error: error.message,
        });
    }
};
