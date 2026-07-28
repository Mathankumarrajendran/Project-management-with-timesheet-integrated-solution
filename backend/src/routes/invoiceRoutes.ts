import { Router } from 'express';
import {
    getInvoices,
    getInvoiceById,
    previewInvoice,
    createInvoice,
    updateInvoiceStatus,
} from '../controllers/invoiceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All invoice routes require authentication
router.use(authenticate);

// List generated invoices (Admin, Finance, PM can view)
router.get(
    '/',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    getInvoices
);

// Preview invoice items (Admin, Finance, PM can generate previews)
router.post(
    '/preview',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    previewInvoice
);

// Create / Generate invoice
router.post(
    '/',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    createInvoice
);

// View specific invoice details
router.get(
    '/:id',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    getInvoiceById
);

// Update invoice status (Admin, Finance, PM can edit)
router.patch(
    '/:id/status',
    authorize('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'),
    updateInvoiceStatus
);

export default router;
