import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    updateOwnProfile,
    deactivateUser,
    activateUser,
    getUserStats,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema, updateProfileSchema } from '../validators/userValidator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin, PM, Team Lead can view)
router.get(
    '/',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'),
    getAllUsers
);

// Get user statistics (Admin only)
router.get(
    '/stats',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN'),
    getUserStats
);

// Update own profile (all authenticated users)
router.put(
    '/profile',
    validate(updateProfileSchema),
    updateOwnProfile
);

// Get user by ID
router.get('/:id', getUserById);

// Update user (Admin only)
router.put(
    '/:id',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN'),
    validate(updateUserSchema),
    updateUser
);

// Deactivate user (Admin only)
router.delete(
    '/:id',
    authorize('SUPER_ADMIN'),
    deactivateUser
);

// Activate user (Admin only)
router.post(
    '/:id/activate',
    authorize('SUPER_ADMIN'),
    activateUser
);

export default router;
