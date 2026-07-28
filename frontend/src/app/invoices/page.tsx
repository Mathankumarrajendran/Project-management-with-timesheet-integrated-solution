'use client';

import { useEffect, useState, useCallback } from 'react';
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
    IconButton,
} from '@mui/material';
import { Add, Visibility, ReceiptLong } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import InvoiceForm from '@/components/forms/InvoiceForm';

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
    client: {
        name: string;
        code: string;
    };
}

export default function InvoicesPage() {
    useAuth(true);
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/invoices');
            setInvoices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const getStatusColor = (status: string) => {
        const colors: any = {
            DRAFT: 'default',
            SENT: 'info',
            PAID: 'success',
            OVERDUE: 'error',
            CANCELLED: 'warning',
        };
        return colors[status] || 'default';
    };

    // Calculate invoice stats
    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);
    const totalPaid = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);
    const totalHours = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalHours.toString()), 0);

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptLong fontSize="large" sx={{ color: '#667eea' }} />
                            Invoices
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Generate and manage invoices for client billable hours
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setFormOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            },
                        }}
                    >
                        Generate Invoice
                    </Button>
                </Box>

                {/* Stats Summary cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ borderLeft: '4px solid #667eea' }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                    TOTAL INVOICED AMOUNT
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="primary">
                                    ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ borderLeft: '4px solid #4caf50' }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                    TOTAL RECEIVED (PAID)
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ borderLeft: '4px solid #ff9800' }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                    TOTAL BILLED HOURS
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {totalHours.toFixed(2)} hrs
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Invoice Table */}
                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Invoice #</strong></TableCell>
                                        <TableCell><strong>Client</strong></TableCell>
                                        <TableCell><strong>Billing Period</strong></TableCell>
                                        <TableCell><strong>Billed Hours</strong></TableCell>
                                        <TableCell><strong>Amount</strong></TableCell>
                                        <TableCell><strong>Issue Date</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No invoices generated yet. Click "Generate Invoice" to start!
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((inv) => (
                                            <TableRow
                                                key={inv.id}
                                                hover
                                                onClick={() => router.push(`/invoices/${inv.id}`)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell sx={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</TableCell>
                                                <TableCell>{inv.client.name}</TableCell>
                                                <TableCell>
                                                    {new Date(inv.startDate).toLocaleDateString()} - {new Date(inv.endDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>{parseFloat(inv.totalHours.toString()).toFixed(2)} hrs</TableCell>
                                                <TableCell sx={{ fontWeight: '600' }}>
                                                    ${parseFloat(inv.totalAmount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={inv.status}
                                                        size="small"
                                                        color={getStatusColor(inv.status)}
                                                    />
                                                </TableCell>
                                                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => router.push(`/invoices/${inv.id}`)}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Generate Invoice Modal Form */}
                <InvoiceForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={fetchInvoices}
                />
            </Box>
        </DashboardLayout>
    );
}
