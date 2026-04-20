import { Router } from 'express';
import { getTimeLogReport, getTaskReport, getProjectReport } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'FINANCE_ADMIN'));

router.get('/time-logs', getTimeLogReport);
router.get('/tasks', getTaskReport);
router.get('/projects', getProjectReport);

export default router;
