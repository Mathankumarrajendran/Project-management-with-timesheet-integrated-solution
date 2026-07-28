import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box,
} from '@mui/material';
import apiClient from '@/lib/apiClient';

interface InvoiceFormProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
}

export default function InvoiceForm({ open, onClose, onSave }: InvoiceFormProps) {
    const [clients, setClients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        clientId: '',
        startDate: '',
        endDate: '',
        paymentTerms: '',
    });
    const [previewData, setPreviewData] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchClients();
            // Reset form
            setFormData({
                clientId: '',
                startDate: '',
                endDate: '',
                paymentTerms: '',
            });
            setPreviewData(null);
            setError('');
        }
    }, [open]);

    const fetchClients = async () => {
        try {
            const response = await apiClient.get('/clients');
            setClients(response.data.data.clients || []);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    const handleClientChange = (clientIdVal: string) => {
        const selectedClient = clients.find(c => String(c.id) === String(clientIdVal));
        setFormData(prev => ({
            ...prev,
            clientId: clientIdVal,
            paymentTerms: selectedClient?.paymentTerms || 'NET 30',
        }));
        setPreviewData(null);
        setError('');
    };

    const handlePreview = async () => {
        setError('');
        if (!formData.clientId || !formData.startDate || !formData.endDate) {
            setError('Please fill in Client, Start Date, and End Date.');
            return;
        }

        setPreviewLoading(true);
        try {
            const res = await apiClient.post('/invoices/preview', {
                clientId: parseInt(formData.clientId),
                startDate: formData.startDate,
                endDate: formData.endDate,
            });
            setPreviewData(res.data.data);
            if (res.data.data.items.length === 0) {
                setError('No billable hours found for this period and client.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load preview');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!previewData || previewData.items.length === 0) {
            setError('Please load and review the preview before generating.');
            return;
        }

        setSaveLoading(true);
        try {
            await apiClient.post('/invoices', {
                clientId: parseInt(formData.clientId),
                startDate: formData.startDate,
                endDate: formData.endDate,
                paymentTerms: formData.paymentTerms,
                status: 'DRAFT', // initial status
            });
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Generate Client Invoice</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Select Client"
                            value={formData.clientId}
                            onChange={(e) => handleClientChange(e.target.value)}
                            size="small"
                        >
                            {clients.map((client) => (
                                <MenuItem key={client.id} value={client.id}>
                                    {client.name} ({client.code})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.endDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Payment Terms"
                            placeholder="e.g. NET 30, NET 15"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handlePreview}
                            disabled={previewLoading || !formData.clientId || !formData.startDate || !formData.endDate}
                            sx={{ color: '#667eea', borderColor: '#667eea', '&:hover': { borderColor: '#764ba2' } }}
                            fullWidth
                        >
                            {previewLoading ? <CircularProgress size={20} /> : 'Preview Billable Hours'}
                        </Button>
                    </Grid>
                </Grid>

                {previewData && previewData.items.length > 0 && (
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Preview Invoice Items ({previewData.items.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250, mb: 2 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Project</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Task</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Resource</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Hours</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Rate</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Cost</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.items.map((item: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.projectName}</TableCell>
                                            <TableCell>{item.taskTitle}</TableCell>
                                            <TableCell>{item.userName}</TableCell>
                                            <TableCell align="right">{item.hours.toFixed(2)}</TableCell>
                                            <TableCell align="right">${item.rate.toFixed(2)}</TableCell>
                                            <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fcfcfc', borderStyle: 'dashed' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Total Billable Hours</Typography>
                                    <Typography variant="h6" fontWeight="bold">{previewData.totalHours.toFixed(2)} hrs</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Total Invoice Amount</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary">${previewData.totalAmount.toFixed(2)}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="text">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={saveLoading || !previewData || previewData.items.length === 0}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                        },
                    }}
                >
                    {saveLoading ? <CircularProgress size={20} color="inherit" /> : 'Generate Invoice'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
