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
    Autocomplete,
    Chip,
    Typography,
} from '@mui/material';
import apiClient from '@/lib/apiClient';

interface ProjectFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function ProjectForm({ open, onClose, onSave, initialData }: ProjectFormProps) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        code: '',
        clientId: '',
        projectType: '',
        billingType: 'BILLABLE',
        projectManagerId: '',
        startDate: '',
        endDate: '',
        budgetHours: '',
        budgetAmount: '',
        description: '',
        status: 'PLANNING',
        healthStatus: 'ON_TRACK',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [clients, setClients] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            fetchClients();
            fetchUsers();

            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    code: initialData.code || '',
                    clientId: initialData.clientId || '',
                    projectType: initialData.projectType || '',
                    billingType: initialData.billingType || 'BILLABLE',
                    projectManagerId: initialData.projectManagerId || '',
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                    budgetHours: initialData.budgetHours || '',
                    budgetAmount: initialData.budgetAmount || '',
                    description: initialData.description || '',
                    status: initialData.status || 'PLANNING',
                    healthStatus: initialData.healthStatus || 'ON_TRACK',
                    slaPolicy: initialData.slaPolicy || { HIGH: 24, MEDIUM: 48, LOW: 72 },
                });
            } else {
                setFormData({
                    name: '',
                    code: '',
                    clientId: '',
                    projectType: '',
                    billingType: 'BILLABLE',
                    projectManagerId: '',
                    startDate: '',
                    endDate: '',
                    budgetHours: '',
                    budgetAmount: '',
                    description: '',
                    status: 'PLANNING',
                    healthStatus: 'ON_TRACK',
                    slaPolicy: { HIGH: 24, MEDIUM: 48, LOW: 72 },
                });
            }
        }
    }, [open, initialData]);

    const fetchClients = async () => {
        try {
            const response = await apiClient.get('/clients');
            setClients(response.data.data.clients || []);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            const data = response.data.data.users || [];
            const managers = data.filter((u: any) =>
                ['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'].includes(u.role)
            );
            setUsers(managers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

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
            // Convert string IDs to numbers
            // Convert types
            // Create strict payload with only allowed fields
            const payload: any = {
                name: formData.name,
                clientId: formData.clientId ? parseInt(formData.clientId) : null,
                projectManagerId: formData.projectManagerId ? parseInt(formData.projectManagerId) : null,
                projectType: formData.projectType,
                billingType: formData.billingType,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                budgetHours: formData.budgetHours ? parseFloat(formData.budgetHours) : null,
                budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
                description: formData.description,
                status: formData.status,
                healthStatus: formData.healthStatus,
                slaPolicy: formData.slaPolicy,
            };

            // Only include code for creation (it's not allowed in update)
            if (!initialData) {
                payload.code = formData.code;
            }

            // Remove empty/null/NaN values to satisfy Joi validation
            Object.keys(payload).forEach(key => {
                if (payload[key] === '' || payload[key] === undefined || Number.isNaN(payload[key])) {
                    // Keep nulls for optional fields that can be cleared
                    if (payload[key] !== null) {
                        delete payload[key];
                    }
                }
            });

            console.log('Submitting payload:', payload);
            await onSave(payload);
            onClose();
        } catch (err: any) {
            console.error('Save error:', err);
            const message = err.response?.data?.message || 'Failed to save project';
            const details = err.response?.data?.errors?.map((e: any) => e.message).join(', ');
            setError(details ? `${message}: ${details}` : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Edit Project' : 'New Project'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Basic Information */}
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                required
                                label="Project Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                required
                                label="Project Code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                            />
                        </Grid>

                        {/* Client and Manager */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Client"
                                name="clientId"
                                value={formData.clientId}
                                onChange={handleChange}
                            >
                                <MenuItem value="">Select Client</MenuItem>
                                {clients.map((client) => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Project Manager"
                                name="projectManagerId"
                                value={formData.projectManagerId}
                                onChange={handleChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.role})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Type and Billing */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Project Type"
                                name="projectType"
                                value={formData.projectType}
                                onChange={handleChange}
                                placeholder="e.g., Web Development, PCB Design"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Billing Type"
                                name="billingType"
                                value={formData.billingType}
                                onChange={handleChange}
                            >
                                <MenuItem value="BILLABLE">Billable</MenuItem>
                                <MenuItem value="NON_BILLABLE">Non-Billable</MenuItem>
                                <MenuItem value="INTERNAL">Internal</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Dates */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Start Date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="End Date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Budget */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Budget (Hours)"
                                name="budgetHours"
                                value={formData.budgetHours}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.5 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Budget (Amount)"
                                name="budgetAmount"
                                value={formData.budgetAmount}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
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
                                <MenuItem value="PLANNING">Planning</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Health Status"
                                name="healthStatus"
                                value={formData.healthStatus}
                                onChange={handleChange}
                            >
                                <MenuItem value="ON_TRACK">On Track</MenuItem>
                                <MenuItem value="AT_RISK">At Risk</MenuItem>
                                <MenuItem value="OFF_TRACK">Off Track</MenuItem>
                            </TextField>
                        </Grid>

                        {/* SLA Configuration */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                SLA Policy (Target Hours)
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="High Priority"
                                value={formData.slaPolicy?.HIGH || 24}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    slaPolicy: { ...formData.slaPolicy, HIGH: parseInt(e.target.value) }
                                })}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Medium Priority"
                                value={formData.slaPolicy?.MEDIUM || 48}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    slaPolicy: { ...formData.slaPolicy, MEDIUM: parseInt(e.target.value) }
                                })}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Low Priority"
                                value={formData.slaPolicy?.LOW || 72}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    slaPolicy: { ...formData.slaPolicy, LOW: parseInt(e.target.value) }
                                })}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Project'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
