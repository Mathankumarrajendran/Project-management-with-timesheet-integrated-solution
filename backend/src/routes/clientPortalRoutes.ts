import { Router } from 'express';
import { getClientDashboardData } from '../controllers/clientPortalController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all client portal routes
router.use(authenticate);

// Fetch client dashboard details
router.get(
    '/dashboard',
    authorize('CLIENT', 'SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    getClientDashboardData
);

export default router;
