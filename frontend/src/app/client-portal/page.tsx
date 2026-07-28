'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Divider,
    LinearProgress,
    MenuItem,
    TextField,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Business,
    Assignment,
    FolderSpecial,
    ReceiptLong,
    Print,
    CheckCircle,
    HelpOutline,
} from '@mui/icons-material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Project {
    id: number;
    code: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    budgetHours: number | null;
    budgetAmount: number | null;
    projectManager: {
        firstName: string;
        lastName: string;
    } | null;
    _count: {
        tasks: number;
        members: number;
    };
}

interface Task {
    id: number;
    code: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
    priority: string;
    slaStatus: string;
    dueDate: string | null;
    project: {
        name: string;
        code: string;
    };
    assignee: {
        firstName: string;
        lastName: string;
    } | null;
}

interface Invoice {
    id: number;
    invoiceNumber: string;
    totalHours: number;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    startDate: string;
    endDate: string;
}

export default function ClientPortalPage() {
    useAuth(true);
    const { user, hydrated } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
    const [activeTab, setActiveTab] = useState(0);

    const isAdmin = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'].includes(user?.role || '');

    // Fetch list of clients for Admin preview selector
    const fetchClients = useCallback(async () => {
        try {
            const response = await apiClient.get('/clients');
            const clientList = response.data.data.clients || [];
            setClients(clientList);
            if (clientList.length > 0) {
                setSelectedClientId(String(clientList[0].id));
            }
        } catch (err) {
            console.error('Failed to fetch clients list:', err);
        }
    }, []);

    const fetchDashboardData = useCallback(async (clientIdVal?: string) => {
        try {
            setLoading(true);
            setError('');
            let url = '/client-portal/dashboard';
            if (clientIdVal) {
                url += `?clientId=${clientIdVal}`;
            }
            const response = await apiClient.get(url);
            setDashboardData(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load client portal dashboard');
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hydrated && user) {
            if (isAdmin) {
                fetchClients();
            } else if (user.role === 'CLIENT') {
                fetchDashboardData();
            } else {
                router.push('/dashboard');
            }
        }
    }, [hydrated, user, isAdmin, fetchClients, fetchDashboardData, router]);

    useEffect(() => {
        if (isAdmin && selectedClientId) {
            fetchDashboardData(selectedClientId);
        }
    }, [isAdmin, selectedClientId, fetchDashboardData]);

    const getStatusColor = (status: string) => {
        const colors: any = {
            DRAFT: 'default',
            SENT: 'info',
            PAID: 'success',
            OVERDUE: 'error',
            CANCELLED: 'warning',
            TODO: 'default',
            IN_PROGRESS: 'primary',
            IN_REVIEW: 'warning',
            COMPLETED: 'success',
            ACTIVE: 'success',
        };
        return colors[status] || 'default';
    };

    if (loading && !dashboardData) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    const { client, projects = [], tasksSummary, tasks = [], invoices = [] } = dashboardData || {};

    // Filter tasks based on selected tab filter
    const filteredTasks = tasks.filter((t: Task) => {
        if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
        if (taskFilter === 'PENDING') return t.status !== 'COMPLETED';
        return true;
    });

    // Calculate invoice stats
    const totalInvoiced = invoices.reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.totalAmount.toString()), 0);
    const totalOutstanding = invoices
        .filter((inv: Invoice) => inv.status !== 'PAID')
        .reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.totalAmount.toString()), 0);

    // Recharts Data for Task completion Donut
    const totalTasks = tasksSummary?.totalTasks ?? 0;
    const completedTasksCount = tasksSummary?.completedTasks ?? 0;
    const pendingTasksCount = tasksSummary?.pendingTasks ?? 0;

    const taskPieData = [
        { name: 'Completed', value: completedTasksCount, color: '#4caf50' },
        { name: 'Pending', value: pendingTasksCount, color: '#ff9800' },
    ].filter(d => d.value > 0);

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Business fontSize="large" sx={{ color: '#667eea' }} />
                            Client Portal Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {client ? `${client.name} (${client.code})` : 'Monitor projects, tasks and invoices in real time.'}
                        </Typography>
                    </Box>

                    {/* Admin Switcher */}
                    {isAdmin && clients.length > 0 && (
                        <Box sx={{ minWidth: 240 }}>
                            <TextField
                                select
                                fullWidth
                                label="Previewing Dashboard As Client"
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                size="small"
                            >
                                {clients.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    )}
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {dashboardData && (
                    <Box>
                        {/* KPI Widgets */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ borderLeft: '4px solid #667eea' }}>
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                            ACTIVE PROJECTS
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="primary">
                                            {projects.length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ borderLeft: '4px solid #4caf50' }}>
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                            COMPLETED TASKS
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="success.main">
                                            {completedTasksCount} / {totalTasks}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ borderLeft: '4px solid #ff9800' }}>
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                            PENDING TASKS
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="warning.main">
                                            {pendingTasksCount}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ borderLeft: '4px solid #f44336' }}>
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                                            OUTSTANDING INVOICES
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="error.main">
                                            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Middle Layout (Projects List + Task Completion Donut) */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* Projects Summary */}
                            <Grid item xs={12} md={8}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FolderSpecial sx={{ color: '#667eea' }} /> Projects Summary
                                        </Typography>
                                        <Divider sx={{ my: 2 }} />

                                        {projects.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">No projects registered for this client.</Typography>
                                        ) : (
                                            projects.map((proj: Project) => {
                                                const projTasks = tasks.filter((t: Task) => t.project.name === proj.name);
                                                const projCompleted = projTasks.filter((t: Task) => t.status === 'COMPLETED').length;
                                                const completionPct = projTasks.length > 0 ? Math.round((projCompleted / projTasks.length) * 100) : 0;

                                                return (
                                                    <Box key={proj.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                                        <Grid container spacing={2} alignItems="center">
                                                            <Grid item xs={12} sm={4}>
                                                                <Typography variant="subtitle1" fontWeight="bold">{proj.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">Code: {proj.code}</Typography>
                                                            </Grid>
                                                            <Grid item xs={6} sm={3}>
                                                                <Typography variant="caption" color="text.secondary" display="block">MANAGER</Typography>
                                                                <Typography variant="body2" fontWeight="500">
                                                                    {proj.projectManager ? `${proj.projectManager.firstName} ${proj.projectManager.lastName}` : 'Unassigned'}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6} sm={2}>
                                                                <Typography variant="caption" color="text.secondary" display="block">STATUS</Typography>
                                                                <Chip label={proj.status} size="small" color={getStatusColor(proj.status)} />
                                                            </Grid>
                                                            <Grid item xs={12} sm={3}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                    <Typography variant="caption" color="text.secondary">Task Progress</Typography>
                                                                    <Typography variant="caption" fontWeight="bold">{completionPct}%</Typography>
                                                                </Box>
                                                                <LinearProgress variant="determinate" value={completionPct} sx={{ height: 6, borderRadius: 3 }} />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                );
                                            })
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Task Distribution Donut Chart */}
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckCircle sx={{ color: '#4caf50' }} /> Tasks Compliance
                                        </Typography>
                                        <Divider sx={{ my: 2 }} />

                                        {totalTasks === 0 ? (
                                            <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">No tasks assigned to projects.</Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                <Box sx={{ width: '100%', height: 180 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={taskPieData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={70}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                            >
                                                                {taskPieData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <ChartTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                                <Grid container spacing={2} sx={{ mt: 1, width: '100%' }} justifyContent="center">
                                                    <Grid item>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                            <Typography variant="body2" color="text.secondary">Completed ({completedTasksCount})</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                            <Typography variant="body2" color="text.secondary">Pending ({pendingTasksCount})</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Interactive Tab Sections */}
                        <Card>
                            <Tabs
                                value={activeTab}
                                onChange={(_, newValue) => setActiveTab(newValue)}
                                variant="fullWidth"
                                sx={{ borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { fontWeight: 'bold' } }}
                            >
                                <Tab icon={<Assignment />} iconPosition="start" label="Tasks Checklist" />
                                <Tab icon={<ReceiptLong />} iconPosition="start" label="Invoices & Downloads" />
                            </Tabs>

                            <CardContent sx={{ p: 0 }}>
                                {/* Tasks Checklist Tab */}
                                {activeTab === 0 && (
                                    <Box sx={{ p: 3 }}>
                                        {/* Filters Row */}
                                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                            <Button
                                                variant={taskFilter === 'ALL' ? 'contained' : 'outlined'}
                                                onClick={() => setTaskFilter('ALL')}
                                                size="small"
                                            >
                                                All Tasks ({totalTasks})
                                            </Button>
                                            <Button
                                                variant={taskFilter === 'PENDING' ? 'contained' : 'outlined'}
                                                color="warning"
                                                onClick={() => setTaskFilter('PENDING')}
                                                size="small"
                                            >
                                                Pending ({pendingTasksCount})
                                            </Button>
                                            <Button
                                                variant={taskFilter === 'COMPLETED' ? 'contained' : 'outlined'}
                                                color="success"
                                                onClick={() => setTaskFilter('COMPLETED')}
                                                size="small"
                                            >
                                                Completed ({completedTasksCount})
                                            </Button>
                                        </Box>

                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                                    <TableRow>
                                                        <TableCell><b>Project</b></TableCell>
                                                        <TableCell><b>Task Title</b></TableCell>
                                                        <TableCell><b>Assignee</b></TableCell>
                                                        <TableCell><b>Priority</b></TableCell>
                                                        <TableCell><b>SLA Status</b></TableCell>
                                                        <TableCell><b>Due Date</b></TableCell>
                                                        <TableCell><b>Status</b></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredTasks.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                                                <Typography variant="body2" color="text.secondary">No tasks found matching current filter.</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredTasks.map((t: Task) => (
                                                            <TableRow key={t.id} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="500">{t.project.name}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">{t.project.code}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ fontWeight: '500' }}>{t.title}</TableCell>
                                                                <TableCell>
                                                                    {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={t.priority}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: t.priority === 'URGENT' ? '#fee2e2' : t.priority === 'HIGH' ? '#fef3c7' : '#e0f2fe',
                                                                            color: t.priority === 'URGENT' ? '#dc2626' : t.priority === 'HIGH' ? '#d97706' : '#0284c7',
                                                                            fontWeight: 'bold',
                                                                            fontSize: 10,
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={(t.slaStatus || 'ON_TRACK').replace(/_/g, ' ')}
                                                                        size="small"
                                                                        color={getStatusColor(t.slaStatus || 'ON_TRACK')}
                                                                        sx={{ fontWeight: '600', fontSize: 10 }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={t.status}
                                                                        size="small"
                                                                        color={getStatusColor(t.status)}
                                                                        sx={{ fontWeight: '600', fontSize: 10 }}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Invoices Tab */}
                                {activeTab === 1 && (
                                    <Box sx={{ p: 3 }}>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                                    <TableRow>
                                                        <TableCell><b>Invoice Number</b></TableCell>
                                                        <TableCell><b>Billing Period</b></TableCell>
                                                        <TableCell><b>Billed Hours</b></TableCell>
                                                        <TableCell><b>Amount</b></TableCell>
                                                        <TableCell><b>Issue Date</b></TableCell>
                                                        <TableCell><b>Due Date</b></TableCell>
                                                        <TableCell><b>Status</b></TableCell>
                                                        <TableCell align="center"><b>Download</b></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {invoices.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                                <Typography variant="body2" color="text.secondary">No invoices available.</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        invoices.map((inv: Invoice) => (
                                                            <TableRow key={inv.id} hover>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</TableCell>
                                                                <TableCell>
                                                                    {new Date(inv.startDate).toLocaleDateString()} - {new Date(inv.endDate).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>{parseFloat(inv.totalHours.toString()).toFixed(2)} hrs</TableCell>
                                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                                    ${parseFloat(inv.totalAmount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                                <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                                                                <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={inv.status}
                                                                        size="small"
                                                                        color={getStatusColor(inv.status)}
                                                                        sx={{ fontWeight: 'bold', fontSize: 10 }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        startIcon={<Print />}
                                                                        onClick={() => {
                                                                            // Open printable view in new window
                                                                            window.open(`/invoices/${inv.id}`, '_blank');
                                                                        }}
                                                                        sx={{
                                                                            color: '#667eea',
                                                                            borderColor: '#667eea',
                                                                            '&:hover': { borderColor: '#764ba2' },
                                                                        }}
                                                                    >
                                                                        Print / Save PDF
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}
