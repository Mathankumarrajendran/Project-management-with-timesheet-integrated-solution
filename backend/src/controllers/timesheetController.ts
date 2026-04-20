import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// ─── Employee: Get my weekly timesheets ──────────────────────────────────────
export const getMyWeeklyTimesheets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        const sheets = await prisma.weeklyTimesheet.findMany({
            where: { userId },
            include: {
                timeLogs: {
                    include: {
                        project: { select: { code: true, name: true } },
                        task: { select: { code: true, title: true } },
                    },
                    orderBy: { date: 'asc' },
                },
            },
            orderBy: { weekStartDate: 'desc' },
        });

        res.json({ success: true, data: sheets });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch timesheets', error: error.message });
    }
};

// ─── Employee: Submit weekly timesheet for L1 approval ───────────────────────
export const submitWeeklyTimesheet = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const sheetId = parseInt(req.params.weeklyTimesheetId);

        const sheet = await prisma.weeklyTimesheet.findUnique({ where: { id: sheetId } });
        if (!sheet) return res.status(404).json({ success: false, message: 'Timesheet not found' });
        if (sheet.userId !== userId) return res.status(403).json({ success: false, message: 'Not your timesheet' });
        if (sheet.status !== 'DRAFT' && sheet.status !== 'L1_REJECTED') {
            return res.status(400).json({ success: false, message: `Cannot submit — current status is ${sheet.status}` });
        }
        if (!sheet.totalHours || Number(sheet.totalHours) <= 0) {
            return res.status(400).json({ success: false, message: 'Cannot submit an empty timesheet' });
        }

        const updated = await prisma.weeklyTimesheet.update({
            where: { id: sheetId },
            data: { status: 'SUBMITTED', submittedAt: new Date() },
        });

        await prisma.timeLog.updateMany({
            where: { weeklyTimesheetId: sheetId },
            data: { status: 'SUBMITTED', submittedAt: new Date() },
        });

        res.json({ success: true, message: 'Timesheet submitted for L1 approval', data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to submit timesheet', error: error.message });
    }
};

// ─── L1: Get timesheets pending approval ─────────────────────────────────────
export const getL1PendingTimesheets = async (req: AuthRequest, res: Response) => {
    try {
        const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
        const userId = req.user!.userId;

        let userFilter: any = {};
        if (!isSuperAdmin) {
            // PM only sees timesheets of users in their projects
            const managed = await prisma.project.findMany({
                where: { projectManagerId: userId },
                select: { members: { select: { userId: true } } },
            });
            const memberIds = [...new Set(managed.flatMap(p => p.members.map(m => m.userId)))];
            userFilter = { userId: { in: memberIds } };
        }

        const sheets = await prisma.weeklyTimesheet.findMany({
            where: { status: 'SUBMITTED', ...userFilter },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, employeeId: true } },
                timeLogs: {
                    include: {
                        project: { select: { code: true, name: true } },
                        task: { select: { code: true, title: true } },
                    },
                    orderBy: { date: 'asc' },
                },
            },
            orderBy: { submittedAt: 'asc' },
        });

        res.json({ success: true, data: sheets });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch pending timesheets', error: error.message });
    }
};

// ─── L1: Approve weekly timesheet ────────────────────────────────────────────
export const approveWeeklyTimesheetL1 = async (req: AuthRequest, res: Response) => {
    try {
        const sheetId = parseInt(req.params.weeklyTimesheetId);
        const { remarks } = req.body;
        const approverId = req.user!.userId;

        const sheet = await prisma.weeklyTimesheet.findUnique({ where: { id: sheetId } });
        if (!sheet) return res.status(404).json({ success: false, message: 'Timesheet not found' });
        if (sheet.status !== 'SUBMITTED') {
            return res.status(400).json({ success: false, message: `Expected SUBMITTED, got ${sheet.status}` });
        }

        const updated = await prisma.weeklyTimesheet.update({
            where: { id: sheetId },
            data: { status: 'L1_APPROVED', l1ApproverId: approverId, l1ApprovedAt: new Date(), l1RejectionReason: remarks || null },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });

        await prisma.timeLog.updateMany({
            where: { weeklyTimesheetId: sheetId },
            data: { status: 'L1_APPROVED', l1ApproverId: approverId, l1ApprovedAt: new Date() },
        });

        res.json({ success: true, message: 'Weekly timesheet L1 approved', data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to approve', error: error.message });
    }
};

// ─── L1: Reject weekly timesheet ─────────────────────────────────────────────
export const rejectWeeklyTimesheetL1 = async (req: AuthRequest, res: Response) => {
    try {
        const sheetId = parseInt(req.params.weeklyTimesheetId);
        const { remarks } = req.body;

        const sheet = await prisma.weeklyTimesheet.findUnique({ where: { id: sheetId } });
        if (!sheet) return res.status(404).json({ success: false, message: 'Timesheet not found' });
        if (sheet.status !== 'SUBMITTED') {
            return res.status(400).json({ success: false, message: `Expected SUBMITTED, got ${sheet.status}` });
        }

        const updated = await prisma.weeklyTimesheet.update({
            where: { id: sheetId },
            data: { status: 'L1_REJECTED', l1RejectionReason: remarks || 'No reason given' },
        });

        // Revert time logs to DRAFT so employee can fix and resubmit
        await prisma.timeLog.updateMany({
            where: { weeklyTimesheetId: sheetId },
            data: { status: 'DRAFT' },
        });

        res.json({ success: true, message: 'Timesheet rejected — returned to employee', data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to reject', error: error.message });
    }
};

// ─── Admin/PM: Compile monthly timesheet from L1-approved weekly sheets ───────
export const compileMonthlyTimesheet = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, year, month } = req.body;
        const targetUserId = parseInt(userId);
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month); // 1–12

        const monthStart = new Date(targetYear, targetMonth - 1, 1);
        const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Fetch all L1-approved weekly sheets whose week overlaps this month
        const weeklySheets = await prisma.weeklyTimesheet.findMany({
            where: {
                userId: targetUserId,
                status: 'L1_APPROVED',
                weekStartDate: { lte: monthEnd },
                weekEndDate: { gte: monthStart },
            },
            include: { timeLogs: true },
        });

        if (weeklySheets.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No L1-approved weekly timesheets found for this period',
            });
        }

        const allLogs = weeklySheets.flatMap(ws => ws.timeLogs);
        const totalHours = allLogs.reduce((sum, l) => sum + Number(l.hours), 0);
        const billableHours = allLogs.filter(l => l.billable).reduce((sum, l) => sum + Number(l.hours), 0);
        const workingDays = 22; // standard working days per month
        const utilization = Math.min((totalHours / (workingDays * 8)) * 100, 100);

        // Upsert monthly timesheet (unique: userId + month + year)
        const monthly = await prisma.monthlyTimesheet.upsert({
            where: { userId_month_year: { userId: targetUserId, month: targetMonth, year: targetYear } },
            create: {
                userId: targetUserId,
                year: targetYear,
                month: targetMonth,
                totalHours,
                billableHours,
                utilization,
                status: 'SUBMITTED',
                compiledAt: new Date(),
            },
            update: {
                totalHours,
                billableHours,
                utilization,
                status: 'SUBMITTED',
                compiledAt: new Date(),
            },
        });

        // Link all time logs of those weekly sheets to this monthly sheet
        const weeklyIds = weeklySheets.map(ws => ws.id);
        await prisma.timeLog.updateMany({
            where: { weeklyTimesheetId: { in: weeklyIds } },
            data: { monthlyTimesheetId: monthly.id },
        });

        res.json({ success: true, message: 'Monthly timesheet compiled and submitted for L2 approval', data: monthly });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to compile monthly timesheet', error: error.message });
    }
};

// ─── L2: Get all monthly timesheets ──────────────────────────────────────────
export const getAllMonthlyTimesheets = async (_req: AuthRequest, res: Response) => {
    try {
        const sheets = await prisma.monthlyTimesheet.findMany({
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, employeeId: true } },
            },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });

        res.json({ success: true, data: sheets });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch monthly timesheets', error: error.message });
    }
};

// ─── L2: Get pending L2 approvals ────────────────────────────────────────────
export const getL2PendingTimesheets = async (_req: AuthRequest, res: Response) => {
    try {
        const sheets = await prisma.monthlyTimesheet.findMany({
            where: { status: 'SUBMITTED' },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, employeeId: true } },
            },
            orderBy: { compiledAt: 'asc' },
        });

        res.json({ success: true, data: sheets });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch L2 pending', error: error.message });
    }
};

// ─── L2: Approve monthly timesheet ───────────────────────────────────────────
export const approveMonthlyTimesheetL2 = async (req: AuthRequest, res: Response) => {
    try {
        const sheetId = parseInt(req.params.monthlyTimesheetId);
        const { remarks } = req.body;
        const approverId = req.user!.userId;

        const sheet = await prisma.monthlyTimesheet.findUnique({ where: { id: sheetId } });
        if (!sheet) return res.status(404).json({ success: false, message: 'Monthly timesheet not found' });
        if (sheet.status !== 'SUBMITTED') {
            return res.status(400).json({ success: false, message: `Expected SUBMITTED, got ${sheet.status}` });
        }

        const updated = await prisma.monthlyTimesheet.update({
            where: { id: sheetId },
            data: {
                status: 'L2_APPROVED',
                l2ApproverId: approverId,
                l2ApprovedAt: new Date(),
                l2RejectionReason: remarks || null,
            },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });

        // Lock all underlying time logs for payroll
        await prisma.timeLog.updateMany({
            where: { monthlyTimesheetId: sheetId },
            data: { status: 'LOCKED', l2ApproverId: approverId, l2ApprovedAt: new Date() },
        });

        res.json({ success: true, message: 'Monthly timesheet L2 approved and locked for payroll', data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to L2 approve', error: error.message });
    }
};

// ─── L2: Reject monthly timesheet ────────────────────────────────────────────
export const rejectMonthlyTimesheetL2 = async (req: AuthRequest, res: Response) => {
    try {
        const sheetId = parseInt(req.params.monthlyTimesheetId);
        const { remarks } = req.body;

        const sheet = await prisma.monthlyTimesheet.findUnique({ where: { id: sheetId } });
        if (!sheet) return res.status(404).json({ success: false, message: 'Monthly timesheet not found' });

        const updated = await prisma.monthlyTimesheet.update({
            where: { id: sheetId },
            data: { status: 'L2_REJECTED', l2RejectionReason: remarks || 'No reason given' },
        });

        // Revert linked time logs to L1_APPROVED so they can be recompiled
        await prisma.timeLog.updateMany({
            where: { monthlyTimesheetId: sheetId },
            data: { status: 'L1_APPROVED' },
        });

        res.json({ success: true, message: 'Monthly timesheet rejected', data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to reject monthly timesheet', error: error.message });
    }
};
