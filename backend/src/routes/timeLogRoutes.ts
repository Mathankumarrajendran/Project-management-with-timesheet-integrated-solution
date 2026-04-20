import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    createTimeLog,
    getMyTimeLogs,
    getTimeLogs,
} from '../controllers/timeLogController';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Time log CRUD
router.post('/', createTimeLog);
router.get('/my', getMyTimeLogs);
router.get('/', getTimeLogs);

export default router;
