import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getMyNotifications,
    markNotificationRead,
    markAllRead,
    clearAllNotifications,
    clearNotification,
} from '../controllers/notificationController';

const router = Router();
router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', clearNotification);

export default router;
