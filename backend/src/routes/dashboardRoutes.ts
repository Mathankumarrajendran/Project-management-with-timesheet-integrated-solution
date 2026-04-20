import { Router } from 'express';
import {
    getSuperAdminDashboard,
    getProjectDashboard,
    getEmployeeDashboard,
    getFinanceDashboard,
    getClientDashboard,
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Super Admin / PM / Finance Dashboard
router.get(
    '/admin',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'FINANCE_ADMIN'),
    getSuperAdminDashboard
);

// Project Dashboard
router.get('/project/:projectId', getProjectDashboard);

// Employee Dashboard
router.get('/employee', getEmployeeDashboard);

// Finance Dashboard
router.get(
    '/finance',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN'),
    getFinanceDashboard
);

// Client Portal Dashboard
router.get(
    '/client/:clientId',
    authorize('SUPER_ADMIN', 'CLIENT'),
    getClientDashboard
);

export default router;
