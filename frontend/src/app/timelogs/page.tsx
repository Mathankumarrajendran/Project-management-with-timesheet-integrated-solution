'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Alert,
    Snackbar,
    Chip,
    CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';

interface TimeLog {
    id: number;
    date: string;
    hoursWorked: number;
    description: string;
    isBillable: boolean;
    status: string;
    task: any;
    project: any;
}

interface Project {
    id: number;
    name: string;
    code: string;
}

interface Task {
    id: number;
    title: string;
    code: string;
}

export default function TimeLogsPage() {
    const { user } = useAuth(true);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

    const [formData, setFormData] = useState({
        projectId: '',
        taskId: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        billable: true,
    });

    useEffect(() => {
        fetchTimeLogs();
        fetchProjects();
    }, []);

    useEffect(() => {
        if (formData.projectId) {
            fetchTasksByProject(formData.projectId);
        }
    }, [formData.projectId]);

    const fetchTimeLogs = async () => {
        try {
            const response = await apiClient.get('/time-logs/my');
            setTimeLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch time logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/projects');
            setProjects(response.data.data.projects || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const fetchTasksByProject = async (projectId: string) => {
        try {
            const response = await apiClient.get(`/tasks?projectId=${projectId}`);
            setTasks(response.data.data.tasks || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/time-logs', {
                ...formData,
                projectId: parseInt(formData.projectId),
                taskId: parseInt(formData.taskId),
                hours: parseFloat(formData.hours),
            });
            setSnackbar({ open: true, message: 'Time log created successfully!', severity: 'success' });
            setOpenDialog(false);
            setFormData({
                projectId: '',
                taskId: '',
                date: new Date().toISOString().split('T')[0],
                hours: '',
                description: '',
                billable: true,
            });
            fetchTimeLogs();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to create time log',
                severity: 'error',
            });
        }
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

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Time Tracking
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Log your daily work hours
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            },
                        }}
                    >
                        Log Time
                    </Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Project</strong></TableCell>
                                        <TableCell><strong>Task</strong></TableCell>
                                        <TableCell><strong>Hours</strong></TableCell>
                                        <TableCell><strong>Description</strong></TableCell>
                                        <TableCell><strong>Billable</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {timeLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No time logs yet. Start logging your work hours!
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        timeLogs.map((log) => (
                                            <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{log.project?.code}</TableCell>
                                                <TableCell>{log.task?.code}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {log.hoursWorked}h
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{log.description}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={log.isBillable ? 'Billable' : 'Non-billable'}
                                                        size="small"
                                                        color={log.isBillable ? 'success' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={log.status}
                                                        size="small"
                                                        color={
                                                            log.status === 'LOCKED' ? 'default' :
                                                                log.status === 'L2_APPROVED' ? 'success' :
                                                                    log.status === 'L1_APPROVED' ? 'info' :
                                                                        log.status === 'SUBMITTED' ? 'warning' :
                                                                            'default'
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Add Time Log Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <form onSubmit={handleSubmit}>
                        <DialogTitle>Log Work Hours</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Project"
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleChange}
                                        required
                                    >
                                        {projects.map((project) => (
                                            <MenuItem key={project.id} value={project.id}>
                                                {project.code} - {project.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Task"
                                        name="taskId"
                                        value={formData.taskId}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.projectId}
                                    >
                                        {tasks.map((task) => (
                                            <MenuItem key={task.id} value={task.id}>
                                                {task.code} - {task.title}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Hours Worked"
                                        name="hours"
                                        type="number"
                                        inputProps={{ min: 0.25, max: 24, step: 0.25 }}
                                        value={formData.hours}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        multiline
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Billable"
                                        name="billable"
                                        value={formData.billable}
                                        onChange={(e) => setFormData({ ...formData, billable: e.target.value === 'true' })}
                                    >
                                        <MenuItem value="true">Billable</MenuItem>
                                        <MenuItem value="false">Non-billable</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
}
