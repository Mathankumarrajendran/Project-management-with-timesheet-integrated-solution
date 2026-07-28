import { Request, Response } from 'express';
import prisma from '../config/database';

// Helper to resolve hourly rate for a user on a project
async function getHourlyRate(userId: number, projectId: number): Promise<number> {
    // 1. Check ProjectMember rate
    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });

    if (member && member.hourlyRate) {
        return parseFloat(member.hourlyRate.toString());
    }

    // 2. Check User default rate
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { hourlyRate: true },
    });

    if (user && user.hourlyRate) {
        return parseFloat(user.hourlyRate.toString());
    }

    // 3. Fallback
    return 0.00;
}

// Helper to calculate invoice items and totals
async function calculateInvoiceDetails(clientId: number, startDate: Date, endDate: Date) {
    // Fetch time logs meeting the criteria:
    // - Under the client
    // - Within the date range
    // - Billable
    // - Submitted or approved (status in SUBMITTED, L1_APPROVED, L2_APPROVED, LOCKED)
    const timeLogs = await prisma.timeLog.findMany({
        where: {
            project: { clientId },
            date: {
                gte: startDate,
                lte: endDate,
            },
            billable: true,
            status: {
                in: ['L1_APPROVED', 'L2_APPROVED', 'LOCKED'],
            },
        },
        include: {
            project: {
                select: { id: true, name: true, code: true },
            },
            task: {
                select: { id: true, title: true, code: true },
            },
            user: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
        },
        orderBy: { date: 'asc' },
    });

    const items: any[] = [];
    let totalHours = 0;
    let totalAmount = 0;

    for (const log of timeLogs) {
        const hours = parseFloat(log.hours.toString());
        const rate = await getHourlyRate(log.userId, log.projectId);
        const amount = hours * rate;

        totalHours += hours;
        totalAmount += amount;

        items.push({
            timeLogId: log.id,
            date: log.date.toISOString().split('T')[0],
            projectId: log.projectId,
            projectName: log.project.name,
            projectCode: log.project.code,
            taskId: log.taskId,
            taskTitle: log.task.title,
            taskCode: log.task.code,
            userId: log.userId,
            userName: `${log.user.firstName} ${log.user.lastName}`,
            userEmail: log.user.email,
            description: log.description,
            hours,
            rate,
            amount,
        });
    }

    return {
        items,
        totalHours,
        totalAmount,
    };
}

// Helper to parse payment terms and return a due date
function calculateDueDate(issueDate: Date, paymentTerms: string | null): Date {
    const defaultDays = 30;
    if (!paymentTerms) {
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + defaultDays);
        return dueDate;
    }

    // Match "NET 30", "NET 15", "30 Days", "30"
    const match = paymentTerms.match(/\d+/);
    const days = match ? parseInt(match[0]) : defaultDays;

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
}

// GET /api/invoices — List all invoices
export const getInvoices = async (req: Request, res: Response) => {
    try {
        const { clientId, status } = req.query;

        const where: any = {};
        if (clientId) where.clientId = parseInt(clientId as string);
        if (status) where.status = status as any;

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                client: {
                    select: { id: true, name: true, code: true, paymentTerms: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: invoices,
        });
    } catch (error: any) {
        console.error('Failed to get invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message,
        });
    }
};

// GET /api/invoices/:id — Get invoice details
export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                client: {
                    select: { id: true, name: true, code: true, billingAddress: true, contactName: true, contactEmail: true },
                },
            },
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        res.json({
            success: true,
            data: invoice,
        });
    } catch (error: any) {
        console.error('Failed to get invoice by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice details',
            error: error.message,
        });
    }
};

// POST /api/invoices/preview — Preview invoice items before creating
export const previewInvoice = async (req: Request, res: Response) => {
    try {
        const { clientId, startDate, endDate } = req.body;

        if (!clientId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: clientId, startDate, endDate',
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const details = await calculateInvoiceDetails(clientId, start, end);

        res.json({
            success: true,
            data: {
                clientId,
                startDate,
                endDate,
                ...details,
            },
        });
    } catch (error: any) {
        console.error('Failed to preview invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate invoice preview',
            error: error.message,
        });
    }
};

// POST /api/invoices — Generate and save invoice
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { clientId, startDate, endDate, paymentTerms, status = 'DRAFT' } = req.body;

        if (!clientId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: clientId, startDate, endDate',
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Fetch client details
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { paymentTerms: true, code: true },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found',
            });
        }

        // Calculate items and totals
        const { items, totalHours, totalAmount } = await calculateInvoiceDetails(clientId, start, end);

        if (items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No billable hours found for the selected client and period',
            });
        }

        // Generate unique Invoice Number (e.g. INV-2026-0001)
        const year = new Date().getFullYear();
        const invoiceCount = await prisma.invoice.count();
        const nextNumber = String(invoiceCount + 1).padStart(4, '0');
        const invoiceNumber = `INV-${year}-${nextNumber}`;

        const issueDate = new Date();
        const terms = paymentTerms || client.paymentTerms;
        const dueDate = calculateDueDate(issueDate, terms);

        // Create the invoice record
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                clientId,
                startDate: start,
                endDate: end,
                paymentTerms: terms,
                issueDate,
                dueDate,
                totalHours,
                totalAmount,
                status,
                items,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: invoice,
        });
    } catch (error: any) {
        console.error('Failed to create invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate invoice',
            error: error.message,
        });
    }
};

// PATCH /api/invoices/:id/status — Update invoice status
export const updateInvoiceStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Missing status field in request body',
            });
        }

        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json({
            success: true,
            message: 'Invoice status updated successfully',
            data: invoice,
        });
    } catch (error: any) {
        console.error('Failed to update invoice status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice status',
            error: error.message,
        });
    }
};
