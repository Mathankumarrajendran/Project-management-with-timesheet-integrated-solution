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

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function UserForm({ open, onClose, onSave, initialData }: UserFormProps) {
    const [formData, setFormData] = useState(initialData || {
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        password: '',
        role: 'EMPLOYEE',
        department: '',
        phone: '',
        hourlyRate: '',
        status: 'ACTIVE',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update formData when initialData changes (when editing different users)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset to empty form when creating new user
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                employeeId: '',
                password: '',
                role: 'EMPLOYEE',
                department: '',
                phone: '',
                hourlyRate: '',
                status: 'ACTIVE',
            });
        }
    }, [initialData]);

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
            let payload: any = {
                ...formData,
                hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
            };

            // When editing (updating existing user)
            if (initialData) {
                // Remove fields that cannot be updated or are read-only
                delete payload.id;
                delete payload.email;
                delete payload.employeeId;
                delete payload.createdAt;
                delete payload.updatedAt;
                delete payload.lastLoginAt;
                delete payload.profilePicture; // If profile picture upload is handled separately
                delete payload.manager;        // If manager is an object or handled separately

                // ALWAYS remove password when editing (update endpoint doesn't support password changes)
                delete payload.password;
            } else {
                // When creating new user - register endpoint doesn't accept status
                delete payload.status;
            }

            await onSave(payload);
            // Don't close here - let parent component close after refresh completes
        } catch (err: any) {
            // Display error message from backend
            let errorMessage = err.response?.data?.message || err.message || 'Failed to save user';

            // If there are detailed validation errors, show them
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                const fieldErrors = err.response.data.errors
                    .map((e: any) => `${e.field}: ${e.message}`)
                    .join(', ');
                errorMessage = `${errorMessage} - ${fieldErrors}`;
            }

            setError(errorMessage);
            // Don't close the dialog - keep it open so user can see error and fix it
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Edit User' : 'New User'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Email and Employee ID */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="email"
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                InputProps={{
                                    readOnly: !!initialData,
                                }}
                                helperText={initialData ? "Email cannot be changed" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Employee ID"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputProps={{
                                    readOnly: !!initialData,
                                }}
                                helperText={initialData ? "Employee ID cannot be changed" : ""}
                            />
                        </Grid>

                        {/* Password (only for new users or if changing) */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                label={initialData ? 'Password (cannot be changed here)' : 'Password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!initialData}
                                disabled={!!initialData}
                                helperText={initialData ? "Use password reset feature to change password" : ""}
                            />
                        </Grid>

                        {/* Role and Department */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                                <MenuItem value="FINANCE_ADMIN">Finance Admin</MenuItem>
                                <MenuItem value="PROJECT_MANAGER">Project Manager</MenuItem>
                                <MenuItem value="TEAM_LEAD">Team Lead</MenuItem>
                                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                                <MenuItem value="CLIENT">Client</MenuItem>
                                <MenuItem value="AUDITOR">Auditor</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g., Engineering, Finance"
                            />
                        </Grid>

                        {/* Phone and Hourly Rate */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Hourly Rate (USD)"
                                name="hourlyRate"
                                value={formData.hourlyRate}
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
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save User'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
