import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Get my time logs
export const getMyTimeLogs = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const timelogs = await prisma.timeLog.findMany({
            where: {
                userId: req.user.userId,
            },
            include: {
                project: { select: { code: true, name: true } },
                task: { select: { code: true, title: true } },
            },
            orderBy: {
                date: 'desc',
            },
        });

        res.json({ success: true, data: timelogs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch time logs', error: error.message });
    }
};

// Helper: get Monday (start) and Sunday (end) of a week for a given date
const getWeekBounds = (date: Date) => {
    const d = new Date(date);
    const day = d.getUTCDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(0, 0, 0, 0);
    return { weekStartDate: monday, weekEndDate: sunday };
};

// Create time log
export const createTimeLog = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { projectId, taskId, date, hours, description, billable } = req.body;
        const userId = req.user.userId;
        const logDate = new Date(date);
        const { weekStartDate, weekEndDate } = getWeekBounds(logDate);

        // 1. Upsert the WeeklyTimesheet for this user/week
        const weeklyTimesheet = await prisma.weeklyTimesheet.upsert({
            where: { userId_weekStartDate: { userId, weekStartDate } },
            create: {
                userId,
                weekStartDate,
                weekEndDate,
                totalHours: 0,
                billableHours: 0,
                status: 'DRAFT',
            },
            update: {}, // just ensure it exists; we'll recalculate totals after
        });

        // 2. Create the time log linked to the weekly timesheet
        const timelog = await prisma.timeLog.create({
            data: {
                userId,
                projectId,
                taskId,
                date: logDate,
                hours,
                description,
                billable: billable ?? true,
                status: 'DRAFT',
                weeklyTimesheetId: weeklyTimesheet.id,
            },
            include: {
                project: { select: { code: true, name: true } },
                task: { select: { code: true, title: true } },
            },
        });

        // 3. Recalculate totalHours and billableHours for the weekly timesheet
        const weekLogs = await prisma.timeLog.aggregate({
            where: { weeklyTimesheetId: weeklyTimesheet.id },
            _sum: { hours: true },
        });
        const weekBillableLogs = await prisma.timeLog.aggregate({
            where: { weeklyTimesheetId: weeklyTimesheet.id, billable: true },
            _sum: { hours: true },
        });

        await prisma.weeklyTimesheet.update({
            where: { id: weeklyTimesheet.id },
            data: {
                totalHours: weekLogs._sum.hours ?? 0,
                billableHours: weekBillableLogs._sum.hours ?? 0,
            },
        });

        res.status(201).json({ success: true, data: timelog });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to create time log', error: error.message });
    }
};

// Get all time logs (for managers)
export const getTimeLogs = async (req: Request, res: Response) => {
    try {
        const { projectId, clientId, taskId } = req.query;

        const where: any = {};
        if (projectId) where.projectId = parseInt(projectId as string);
        if (clientId) where.clientId = parseInt(clientId as string);
        if (taskId) where.taskId = parseInt(taskId as string);

        const timelogs = await prisma.timeLog.findMany({
            where,
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                project: { select: { code: true, name: true } },
                task: { select: { code: true, title: true } },
            },
            orderBy: {
                date: 'desc',
            },
        });

        res.json({ success: true, data: timelogs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch time logs', error: error.message });
    }
};
