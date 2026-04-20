import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
    getMyWeeklyTimesheets,
    submitWeeklyTimesheet,
    getL1PendingTimesheets,
    approveWeeklyTimesheetL1,
    rejectWeeklyTimesheetL1,
    compileMonthlyTimesheet,
    getL2PendingTimesheets,
    approveMonthlyTimesheetL2,
    rejectMonthlyTimesheetL2,
    getAllMonthlyTimesheets,
} from '../controllers/timesheetController';

const router = Router();
router.use(authenticate);

// ─── Employee routes ──────────────────────────────────────────────────────────
router.get('/weekly/my', getMyWeeklyTimesheets);
router.post('/weekly/:weeklyTimesheetId/submit', submitWeeklyTimesheet);

// ─── L1 Approval (PM + Super Admin) ──────────────────────────────────────────
router.get('/weekly/pending-l1', authorize('SUPER_ADMIN', 'PROJECT_MANAGER'), getL1PendingTimesheets);
router.post('/weekly/:weeklyTimesheetId/approve-l1', authorize('SUPER_ADMIN', 'PROJECT_MANAGER'), approveWeeklyTimesheetL1);
router.post('/weekly/:weeklyTimesheetId/reject-l1', authorize('SUPER_ADMIN', 'PROJECT_MANAGER'), rejectWeeklyTimesheetL1);

// ─── Monthly compilation + L2 Approval (Super Admin / Finance) ───────────────
router.post('/monthly/compile', authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'FINANCE_ADMIN'), compileMonthlyTimesheet);
router.get('/monthly/all', authorize('SUPER_ADMIN', 'FINANCE_ADMIN'), getAllMonthlyTimesheets);
router.get('/monthly/pending-l2', authorize('SUPER_ADMIN', 'FINANCE_ADMIN'), getL2PendingTimesheets);
router.post('/monthly/:monthlyTimesheetId/approve-l2', authorize('SUPER_ADMIN', 'FINANCE_ADMIN'), approveMonthlyTimesheetL2);
router.post('/monthly/:monthlyTimesheetId/reject-l2', authorize('SUPER_ADMIN', 'FINANCE_ADMIN'), rejectMonthlyTimesheetL2);

export default router;
