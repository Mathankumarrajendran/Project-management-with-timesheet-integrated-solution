'use client';

import { useEffect, useState } from 'react';
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
    Dialog,
    Tabs,
    Tab,
    IconButton,
} from '@mui/material';
import { Add, AccessTime, History, OpenInNew } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import TaskForm from '@/components/forms/TaskForm';
import AuditLogList from '@/components/common/AuditLogList';
import TimeLogList from '@/components/common/TimeLogList';

interface Task {
    id: number;
    code: string;
    title: string;
    status: string;
    priority: string;
    slaStatus: string;
    dueDate: string;
    project: {
        name: string;
        code: string;
    };
}

export default function TasksPage() {
    const { user } = useAuth(true);
    const router = useRouter();
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyTask, setHistoryTask] = useState<Task | null>(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (user) {
            fetchMyTasks();
        }
    }, [user]);

    const fetchMyTasks = async () => {
        try {
            // Fetch all tasks instead of just assigned ones
            const response = await apiClient.get('/tasks');
            setMyTasks(response.data.data.tasks || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleAddTask = () => {
        setSelectedTask(null);
        setFormOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setFormOpen(true);
    };

    const handleHistory = (task: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        setHistoryTask(task);
        setHistoryOpen(true);
    };

    const handleSaveTask = async (data: any) => {
        if (selectedTask) {
            await apiClient.put(`/tasks/${selectedTask.id}`, data);
        } else {
            await apiClient.post('/tasks', data);
        }
        await fetchMyTasks();
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            TODO: 'default',
            IN_PROGRESS: 'primary',
            IN_REVIEW: 'info',
            COMPLETED: 'success',
            APPROVED: 'success',
            CANCELLED: 'error',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority: string) => {
        const colors: any = {
            LOW: 'default',
            MEDIUM: 'info',
            HIGH: 'warning',
            CRITICAL: 'error',
        };
        return colors[priority] || 'default';
    };

    const getSLAColor = (slaStatus: string) => {
        const colors: any = {
            NOT_STARTED: 'default',
            ON_TRACK: 'success',
            AT_RISK: 'warning',
            BREACHED: 'error',
        };
        return colors[slaStatus] || 'default';
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
                            All Tasks
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Track and manage all project tasks
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddTask}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            },
                        }}
                    >
                        New Task
                    </Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Code</strong></TableCell>
                                        <TableCell><strong>Title</strong></TableCell>
                                        <TableCell><strong>Project</strong></TableCell>
                                        <TableCell><strong>Priority</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>SLA Status</strong></TableCell>
                                        <TableCell><strong>Due Date</strong></TableCell>
                                        <TableCell><strong>History</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {myTasks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No tasks assigned yet!
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        myTasks.map((task) => (
                                            <TableRow
                                                key={task.id}
                                                onClick={() => handleEditTask(task)}
                                                sx={{
                                                    '&:hover': { bgcolor: '#f9f9f9', cursor: 'pointer' },
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {task.code}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        onClick={() => router.push(`/tasks/${task.id}`)}
                                                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: '#667eea', textDecoration: 'underline' } }}
                                                    >
                                                        <Typography variant="body2">{task.title}</Typography>
                                                        <OpenInNew sx={{ fontSize: 12, opacity: 0.5 }} />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.project?.code || 'N/A'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.priority}
                                                        size="small"
                                                        color={getPriorityColor(task.priority)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.status}
                                                        size="small"
                                                        color={getStatusColor(task.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.slaStatus}
                                                        size="small"
                                                        color={getSLAColor(task.slaStatus)}
                                                        icon={<AccessTime />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleHistory(task, e)}
                                                    >
                                                        <History fontSize="small" />
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

                <TaskForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSaveTask}
                    initialData={selectedTask}
                />

                <Dialog
                    open={historyOpen}
                    onClose={() => setHistoryOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {historyTask?.code} - History
                        </Typography>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                            <Tab label="Time Logs" />
                            <Tab label="Audit Logs" />
                        </Tabs>

                        {historyOpen && historyTask && (
                            <>
                                {tabValue === 0 && <TimeLogList entityType="task" entityId={historyTask.id} />}
                                {tabValue === 1 && <AuditLogList entityType="Task" entityId={historyTask.id} />}
                            </>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setHistoryOpen(false)}>Close</Button>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
