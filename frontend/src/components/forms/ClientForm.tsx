'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
} from '@mui/material';
import { contractTypes, currencies } from '@/lib/constants';

interface ClientFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function ClientForm({ open, onClose, onSave, initialData }: ClientFormProps) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        code: '',
        industry: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        billingAddress: '',
        paymentTerms: '',
        contractType: '',
        contractValue: '',
        contractStart: '',
        contractEnd: '',
        currency: 'USD',
        status: 'ACTIVE',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    contractValue: initialData.contractValue || '',
                    contractStart: initialData.contractStart ? new Date(initialData.contractStart).toISOString().split('T')[0] : '',
                    contractEnd: initialData.contractEnd ? new Date(initialData.contractEnd).toISOString().split('T')[0] : '',
                    currency: initialData.currency || 'USD',
                });
            } else {
                setFormData({
                    name: '',
                    code: '',
                    industry: '',
                    contactName: '',
                    contactEmail: '',
                    contactPhone: '',
                    billingAddress: '',
                    paymentTerms: '',
                    contractType: '',
                    contractValue: '',
                    contractStart: '',
                    contractEnd: '',
                    currency: 'USD',
                    status: 'ACTIVE',
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sanitize payload
            // Create strict payload with only allowed fields
            const payload: any = {
                name: formData.name,
                industry: formData.industry,
                contactName: formData.contactName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                billingAddress: formData.billingAddress,
                paymentTerms: formData.paymentTerms,
                contractType: formData.contractType,
                contractValue: formData.contractValue ? parseFloat(formData.contractValue.toString()) : null,
                contractStart: formData.contractStart || null,
                contractEnd: formData.contractEnd || null,
                currency: formData.currency || 'USD',
                status: formData.status, // Allowed in update
            };

            // Status is not allowed in create payload (defaulted by backend)
            // Code is only allowed in create
            if (!initialData) {
                delete payload.status;
                payload.code = formData.code;
            }

            // Remove empty strings and nulls (but keep explicit nulls if needed, though here we mostly strip)
            Object.keys(payload).forEach(key => {
                if (payload[key] === '' || payload[key] === undefined || Number.isNaN(payload[key])) {
                    if (payload[key] !== null) delete payload[key];
                }
            });

            await onSave(payload);
            onClose();
        } catch (err: any) {
            console.error('Save client error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Edit Client' : 'New Client'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Basic Information */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Client Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Client Code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contact Name"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="email"
                                label="Contact Email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contact Phone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Billing Information */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Billing Address"
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Payment Terms"
                                name="paymentTerms"
                                value={formData.paymentTerms}
                                onChange={handleChange}
                                placeholder="e.g., Net 30"
                            />
                        </Grid>

                        {/* Contract Information */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Contract Type"
                                name="contractType"
                                value={formData.contractType}
                                onChange={handleChange}
                            >
                                <MenuItem value="">Select Type</MenuItem>
                                <MenuItem value="FIXED_PRICE">Fixed Price</MenuItem>
                                <MenuItem value="TIME_AND_MATERIAL">Time & Material</MenuItem>
                                <MenuItem value="RETAINER">Retainer</MenuItem>
                                <MenuItem value="DEDICATED_TEAM">Dedicated Team</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Contract Value"
                                name="contractValue"
                                value={formData.contractValue}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                select
                                label="Currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                            >
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="GBP">GBP</MenuItem>
                                <MenuItem value="INR">INR</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Contract Start"
                                name="contractStart"
                                value={formData.contractStart}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Contract End"
                                name="contractEnd"
                                value={formData.contractEnd}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Client'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
