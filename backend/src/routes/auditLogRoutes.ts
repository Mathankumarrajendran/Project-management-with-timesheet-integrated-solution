
import express from 'express';
import { getAllAuditLogs, getAuditLogs } from '../controllers/auditLogController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Admin: get all audit logs with filters + pagination
router.get('/', authenticate, authorize('SUPER_ADMIN', 'PROJECT_MANAGER'), getAllAuditLogs);

export default router;
