import { Router } from 'express';
import {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deactivateClient,
} from '../controllers/clientController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createClientSchema, updateClientSchema } from '../validators/clientValidator';

const router = Router();

router.use(authenticate);

// Get all clients
router.get('/', getAllClients);

// Get client by ID
router.get('/:id', getClientById);

// Create client (Admin and PM only)
router.post(
    '/',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    validate(createClientSchema),
    createClient
);

// Update client (Admin and PM only)
router.put(
    '/:id',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    validate(updateClientSchema),
    updateClient
);

// Deactivate client (Admin only)
router.delete(
    '/:id',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN'),
    deactivateClient
);

export default router;
