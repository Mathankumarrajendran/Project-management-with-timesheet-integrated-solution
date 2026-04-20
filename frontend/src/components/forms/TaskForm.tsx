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
    Chip,
    Tooltip,
} from '@mui/material';
import { AccessTime, AutoAwesome } from '@mui/icons-material';
import apiClient from '@/lib/apiClient';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

// Priority → SLA policy key mapping
const PRIORITY_SLA_KEY: Record<string, string> = {
    HIGH: 'HIGH',
    URGENT: 'URGENT',  // URGENT has its own SLA bucket
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
};

export default function TaskForm({ open, onClose, onSave, initialData }: TaskFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        taskType: 'DEVELOPMENT',
        priority: 'MEDIUM',
        assignedTo: '',
        estimatedHours: '',
        dueDate: '',
        slaTargetHours: '',
        status: 'OPEN',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    // Store slaPolicy of the currently selected project
    const [projectSlaPolicy, setProjectSlaPolicy] = useState<Record<string, number> | null>(null);
    const [slaAutoFilled, setSlaAutoFilled] = useState(false);

    useEffect(() => {
        if (open) {
            fetchProjects();
            fetchUsers();

            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    projectId: initialData.projectId || '',
                    taskType: initialData.taskType || 'DEVELOPMENT',
                    priority: initialData.priority || 'MEDIUM',
                    assignedTo: initialData.assignedTo || '',
                    estimatedHours: initialData.estimatedHours || '',
                    slaTargetHours: initialData.slaTargetHours || '',
                    dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
                    status: initialData.status || 'OPEN',
                });
                setSlaAutoFilled(false);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    projectId: '',
                    taskType: 'DEVELOPMENT',
                    priority: 'MEDIUM',
                    assignedTo: '',
                    estimatedHours: '',
                    dueDate: '',
                    slaTargetHours: '',
                    status: 'OPEN',
                });
                setProjectSlaPolicy(null);
                setSlaAutoFilled(false);
            }
        }
    }, [open, initialData]);

    // Auto-fill SLA target (in days) and due date whenever project or priority changes
    useEffect(() => {
        if (!formData.projectId || !formData.priority || initialData) return;

        const selected = projects.find((p) => String(p.id) === String(formData.projectId));
        if (!selected?.slaPolicy) {
            setProjectSlaPolicy(null);
            setSlaAutoFilled(false);
            return;
        }

        const policy = selected.slaPolicy as Record<string, number>;
        setProjectSlaPolicy(policy);

        const key = PRIORITY_SLA_KEY[formData.priority] ?? 'MEDIUM';
        const days = policy[key];  // policy now stores DAYS

        if (days) {
            setFormData((prev) => ({
                ...prev,
                slaTargetHours: String(days), // field renamed conceptually to "days", sent as days
            }));
            setSlaAutoFilled(true);
        }
    }, [formData.projectId, formData.priority, projects]);

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/projects');
            setProjects(response.data.data.projects || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data.data.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // If user manually edits SLA or due date, clear the auto-filled flag
        if (name === 'slaTargetHours' || name === 'dueDate') {
            setSlaAutoFilled(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload: any = {
                title: formData.title,
                description: formData.description,
                taskType: formData.taskType,
                priority: formData.priority,
                assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
                estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
                slaTargetHours: formData.slaTargetHours ? parseInt(formData.slaTargetHours) : null,
                // NOTE: dueDate intentionally NOT sent on create — backend auto-calculates from SLA.
                // On edit, dueDate changes go through the dedicated PM override panel, not this form.
            };

            if (!initialData) {
                payload.projectId = parseInt(formData.projectId);
            } else {
                payload.status = formData.status;
            }

            // Strip empty/null/NaN values
            Object.keys(payload).forEach((key) => {
                if (payload[key] === '' || payload[key] === null || payload[key] === undefined || Number.isNaN(payload[key])) {
                    delete payload[key];
                }
            });

            await onSave(payload);
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to save task';
            const details = err.response?.data?.errors?.map((e: any) => e.message).join(', ');
            setError(details ? `${message}: ${details}` : message);
        } finally {
            setLoading(false);
        }
    };

    // Helper: number of SLA days for current priority
    const slaDays = (() => {
        if (!projectSlaPolicy) return null;
        const key = PRIORITY_SLA_KEY[formData.priority] ?? 'MEDIUM';
        return projectSlaPolicy[key] ?? null;  // policy stores DAYS directly
    })();

    // Preview auto-calculated due date shown in create mode (backend will compute the real one)
    const autoDueDatePreview = slaDays
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() + slaDays);
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        })()
        : null;

    // SLA hint shows days
    const slaHint = projectSlaPolicy
        ? `Project SLA — HIGH: ${projectSlaPolicy.HIGH ?? '—'}d, MEDIUM: ${projectSlaPolicy.MEDIUM ?? '—'}d, LOW: ${projectSlaPolicy.LOW ?? '—'}d`
        : null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {initialData ? 'Edit Task' : 'New Task'}
                {slaAutoFilled && (
                    <Chip
                        icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                        label="SLA auto-filled"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ ml: 1, fontSize: 11 }}
                    />
                )}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Title */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Task Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Project and Type */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Project"
                                name="projectId"
                                value={formData.projectId}
                                onChange={handleChange}
                                disabled={!!initialData}
                                helperText={slaHint ?? (initialData ? 'Cannot change project on edit' : '')}
                            >
                                <MenuItem value="">Select Project</MenuItem>
                                {projects.map((project) => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.code} - {project.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Task Type"
                                name="taskType"
                                value={formData.taskType}
                                onChange={handleChange}
                            >
                                <MenuItem value="DEVELOPMENT">Development</MenuItem>
                                <MenuItem value="TESTING">Testing</MenuItem>
                                <MenuItem value="DESIGN">Design</MenuItem>
                                <MenuItem value="DOCUMENTATION">Documentation</MenuItem>
                                <MenuItem value="BUG_FIX">Bug Fix</MenuItem>
                                <MenuItem value="ENHANCEMENT">Enhancement</MenuItem>
                                <MenuItem value="MEETING">Meeting</MenuItem>
                                <MenuItem value="SUPPORT">Support</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Priority and Status */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                helperText={
                                    projectSlaPolicy
                                        ? `SLA: ${projectSlaPolicy[PRIORITY_SLA_KEY[formData.priority]] ?? '—'}d for ${formData.priority}`
                                        : 'Select a project to see SLA'
                                }
                            >
                                <MenuItem value="LOW">Low</MenuItem>
                                <MenuItem value="MEDIUM">Medium</MenuItem>
                                <MenuItem value="HIGH">High</MenuItem>
                                <MenuItem value="URGENT">Urgent</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="OPEN">Open</MenuItem>
                                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="IN_REVIEW">In Review</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Assignee */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Assign To"
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} - {user.role}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Estimates and SLA */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Estimated Hours"
                                name="estimatedHours"
                                value={formData.estimatedHours}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.5 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Tooltip title={slaAutoFilled ? 'Auto-filled from project SLA policy in days.' : ''}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="SLA Target (Days)"
                                    name="slaTargetHours"
                                    value={formData.slaTargetHours}
                                    onChange={handleChange}
                                    inputProps={{ min: 1 }}
                                    helperText={slaAutoFilled ? '✨ Auto from project SLA' : 'Days to resolve the task'}
                                    InputProps={{
                                        endAdornment: slaAutoFilled ? (
                                            <AccessTime sx={{ color: 'info.main', fontSize: 18 }} />
                                        ) : undefined,
                                    }}
                                />
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            {/* Create mode: show read-only auto-calculated due date */}
                            {!initialData ? (
                                <TextField
                                    fullWidth
                                    label="Scheduled Due Date"
                                    value={
                                        autoDueDatePreview
                                            ? `${autoDueDatePreview} (${slaDays}d SLA)`
                                            : 'Auto-calculated after project & priority selected'
                                    }
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    helperText={
                                        autoDueDatePreview
                                            ? `✨ ${formData.priority} priority = ${slaDays} day(s). Only PM can change after creation.`
                                            : 'Select project & priority first'
                                    }
                                />
                            ) : (
                                /* Edit mode: show current due date, changes are PM-only via Task Detail */
                                <TextField
                                    fullWidth
                                    label="Due Date"
                                    value={
                                        formData.dueDate
                                            ? new Date(formData.dueDate).toLocaleDateString('en-IN')
                                            : '—'
                                    }
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    helperText="To change due date, use the PM Override on Task Detail."
                                />
                            )}
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
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
                        {loading ? 'Saving...' : 'Save Task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
