import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// ─── Get notifications for the current user ───────────────────────────────────
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        const unreadCount = notifications.filter(n => !n.read).length;

        res.json({ success: true, data: { notifications, unreadCount } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
};

// ─── Mark a single notification as read ──────────────────────────────────────
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const notificationId = parseInt(req.params.id);

        const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
        if (!notif || notif.userId !== userId) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
    }
};

// ─── Mark all my notifications as read ────────────────────────────────────────
export const markAllRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// ─── Clear (delete) all my notifications ──────────────────────────────────────
export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        await prisma.notification.deleteMany({ where: { userId } });
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to clear notifications', error: error.message });
    }
};

// ─── Clear a single notification ─────────────────────────────────────────────
export const clearNotification = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const notificationId = parseInt(req.params.id);

        const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
        if (!notif || notif.userId !== userId) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await prisma.notification.delete({ where: { id: notificationId } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete notification', error: error.message });
    }
};

// ─── Internal helper: create a notification for a user ───────────────────────
export const createNotification = async (
    userId: number,
    type: string,
    title: string,
    message: string,
    data?: Record<string, any>
) => {
    try {
        await prisma.notification.create({
            data: { userId, type, title, message, data, read: false },
        });
    } catch {
        // Non-fatal — notification creation should never break main flow
    }
};
