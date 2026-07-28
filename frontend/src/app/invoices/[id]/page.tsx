'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider,
    MenuItem,
    TextField,
    Alert,
} from '@mui/material';
import { ArrowBack, Print, Save } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';

interface InvoiceItem {
    date: string;
    projectName: string;
    projectCode: string;
    taskTitle: string;
    taskCode: string;
    userName: string;
    userEmail: string;
    description: string;
    hours: number;
    rate: number;
    amount: number;
}

interface Invoice {
    id: number;
    invoiceNumber: string;
    clientId: number;
    startDate: string;
    endDate: string;
    issueDate: string;
    dueDate: string;
    totalHours: number;
    totalAmount: number;
    currency: string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paymentTerms: string;
    items: InvoiceItem[];
    client: {
        name: string;
        code: string;
        billingAddress: string;
        contactName: string;
        contactEmail: string;
    };
}

export default function InvoiceDetailPage() {
    useAuth(true);
    const params = useParams();
    const router = useRouter();
    const invoiceId = params?.id as string;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [error, setError] = useState('');

    const fetchInvoice = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/invoices/${invoiceId}`);
            setInvoice(response.data.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load invoice details');
            console.error('Failed to fetch invoice:', error);
        } finally {
            setLoading(false);
        }
    }, [invoiceId]);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId, fetchInvoice]);

    const handleStatusChange = async (newStatus: string) => {
        setStatusUpdating(true);
        try {
            await apiClient.patch(`/invoices/${invoiceId}/status`, {
                status: newStatus,
            });
            // Update local state status
            setInvoice(prev => prev ? { ...prev, status: newStatus as any } : null);
        } catch (err: any) {
            console.error('Failed to update invoice status:', err);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (error || !invoice) {
        return (
            <DashboardLayout>
                <Alert severity="error">{error || 'Invoice not found'}</Alert>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Embed print-only styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    header, 
                    nav, 
                    .no-print, 
                    .MuiDrawer-root,
                    .MuiAppBar-root,
                    button,
                    .MuiButton-root,
                    .MuiSelect-root,
                    .MuiInputBase-root {
                        display: none !important;
                    }
                    body, html, main, #__next, .MuiBox-root, .main-content-layout {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        left: 0 !important;
                        position: absolute !important;
                        top: 0 !important;
                    }
                    .print-invoice-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        border: none !important;
                        padding: 20px !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                    .print-table {
                        width: 100% !important;
                    }
                }
            `}} />

            <Box>
                {/* Actions Row */}
                <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => router.back()} variant="text">
                        Back to Invoices
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            select
                            label="Invoice Status"
                            value={invoice.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={statusUpdating}
                            size="small"
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="DRAFT">DRAFT</MenuItem>
                            <MenuItem value="SENT">SENT</MenuItem>
                            <MenuItem value="PAID">PAID</MenuItem>
                            <MenuItem value="OVERDUE">OVERDUE</MenuItem>
                            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                        </TextField>

                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={handlePrint}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                },
                            }}
                        >
                            Print Invoice
                        </Button>
                    </Box>
                </Box>

                {/* Printable Invoice Card */}
                <Card className="print-invoice-container" sx={{ p: 4, maxWidth: 850, mx: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                        {/* Header Details */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={6}>
                                <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                                    PM SYSTEM INC.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    100 Innovation Way<br />
                                    Engineering District, Tech City<br />
                                    billing@pmsystem.com
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                                    INVOICE
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                    #{invoice.invoiceNumber}
                                </Typography>
                                <Chip
                                    label={invoice.status}
                                    color={invoice.status === 'PAID' ? 'success' : invoice.status === 'SENT' ? 'info' : 'default'}
                                    sx={{ mt: 1 }}
                                    className="no-print"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ mb: 4 }} />

                        {/* Bill To & Bill Meta */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
                                    BILL TO:
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    {invoice.client.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {invoice.client.billingAddress || 'No billing address provided.'}
                                </Typography>
                                {invoice.client.contactName && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Attn: {invoice.client.contactName} ({invoice.client.contactEmail})
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" fontWeight="bold" align="right">Billing Period:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" align="right">
                                            {new Date(invoice.startDate).toLocaleDateString()} - {new Date(invoice.endDate).toLocaleDateString()}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" fontWeight="bold" align="right">Issue Date:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" align="right">
                                            {new Date(invoice.issueDate).toLocaleDateString()}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" fontWeight="bold" align="right">Due Date:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" align="right">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="body2" fontWeight="bold" align="right">Payment Terms:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" align="right">
                                            {invoice.paymentTerms || 'NET 30'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Items Table */}
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }} className="print-table">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Task</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Resource</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hours</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Cost</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoice.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="500">{item.projectName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.projectCode}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{item.taskTitle}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.taskCode}</Typography>
                                            </TableCell>
                                            <TableCell>{item.userName}</TableCell>
                                            <TableCell align="right">{parseFloat(item.hours.toString()).toFixed(2)}</TableCell>
                                            <TableCell align="right">${parseFloat(item.rate.toString()).toFixed(2)}</TableCell>
                                            <TableCell align="right">${parseFloat(item.amount.toString()).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Totals Summary */}
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Thank you for your business! Please remit payment via bank transfer to:
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Bank Name: Innovation Bank<br />
                                    Account: 1234-5678-9012<br />
                                    Routing / Swift: INNOUS33
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Box sx={{ width: 280, ml: 'auto' }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Total Billable Hours:</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" fontWeight="600">
                                                {parseFloat(invoice.totalHours.toString()).toFixed(2)} hrs
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Typography variant="subtitle1" fontWeight="bold">Total Amount Due:</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                ${parseFloat(invoice.totalAmount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}
