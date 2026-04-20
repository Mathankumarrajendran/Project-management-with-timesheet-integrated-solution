import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    updatePassword,
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updatePasswordSchema,
} from '../validators/authValidator';

const router = Router();

// Public routes
router.post('/register', authenticate, authorize('SUPER_ADMIN'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/update-password', authenticate, validate(updatePasswordSchema), updatePassword);

export default router;
