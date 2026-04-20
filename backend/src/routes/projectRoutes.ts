import { Router } from 'express';
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    addTeamMember,
    removeTeamMember,
} from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createProjectSchema,
    updateProjectSchema,
    addTeamMemberSchema,
} from '../validators/projectValidator';

const router = Router();

router.use(authenticate);

// Get all projects
router.get('/', getAllProjects);

// Get project by ID
router.get('/:id', getProjectById);

// Create project (Admin and PM only)
router.post(
    '/',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    validate(createProjectSchema),
    createProject
);

// Update project (Admin and PM only)
router.put(
    '/:id',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    validate(updateProjectSchema),
    updateProject
);

// Add team member (Admin and PM only)
router.post(
    '/:id/members',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER'),
    validate(addTeamMemberSchema),
    addTeamMember
);

// Remove team member (Admin and PM only)
router.delete(
    '/:id/members/:userId',
    authorize('SUPER_ADMIN', 'PROJECT_MANAGER'),
    removeTeamMember
);

export default router;
