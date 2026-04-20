import { Router } from 'express';
import {
    getAllSprints,
    getSprintById,
    createSprint,
    updateSprint,
    startSprint,
    completeSprint,
    getSprintBurndown,
} from '../controllers/sprintController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSprintSchema, updateSprintSchema } from '../validators/sprintValidator';

const router = Router();

router.use(authenticate);

// Get all sprints
router.get('/', getAllSprints);

// Get sprint by ID
router.get('/:id', getSprintById);

// Get sprint burndown data
router.get('/:id/burndown', getSprintBurndown);

// Create sprint (PM, Team Lead)
router.post(
    '/',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'),
    validate(createSprintSchema),
    createSprint
);

// Update sprint (PM, Team Lead)
router.put(
    '/:id',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'),
    validate(updateSprintSchema),
    updateSprint
);

// Start sprint (PM, Team Lead)
router.post(
    '/:id/start',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'),
    startSprint
);

// Complete sprint (PM, Team Lead)
router.post(
    '/:id/complete',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'),
    completeSprint
);

export default router;
