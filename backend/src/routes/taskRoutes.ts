import { Router } from 'express';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    addComment,
    getTaskComments,
    addAttachment,
    getTasksBySla,
} from '../controllers/taskController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    addCommentSchema,
    addAttachmentSchema,
} from '../validators/taskValidator';

const router = Router();

router.use(authenticate);

// Get all tasks (with filters)
router.get('/', getAllTasks);

// Get tasks by SLA status
router.get('/sla/:status', getTasksBySla);

// Get task by ID
router.get('/:id', getTaskById);

// Create task
router.post(
    '/',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
    validate(createTaskSchema),
    createTask
);

// Update task
router.put(
    '/:id',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
    validate(updateTaskSchema),
    updateTask
);

// Update task status
router.patch(
    '/:id/status',
    validate(updateTaskStatusSchema),
    updateTaskStatus
);

// Get comments for task
router.get('/:id/comments', getTaskComments);

// Add comment
router.post(
    '/:id/comments',
    validate(addCommentSchema),
    addComment
);

// Add attachment
router.post(
    '/:id/attachments',
    validate(addAttachmentSchema),
    addAttachment
);

export default router;
