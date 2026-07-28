'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Tab, Tabs, CircularProgress,
    Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, LinearProgress, Divider
} from '@mui/material';
import {
    BarChart as BarChartIcon, Assignment, AccessTime, FolderOpen, Warning,
    TrendingUp, Group, PieChart as PieIcon
} from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

// ─── Helpers ───────────────────────────────────────────────────────────────
const statusColor = (s: string): any => {
    const m: Record<string, any> = {
        COMPLETED: 'success', IN_PROGRESS: 'primary', OPEN: 'default',
        CANCELLED: 'default', BREACHED: 'error', AT_RISK: 'warning', ON_TRACK: 'success',
    };
    return m[s] ?? 'default';
};

// ─── Time Log Report Tab ────────────────────────────────────────────────────
function TimeLogReport() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/reports/time-logs')
            .then(r => setData(r.data.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load report'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    // Format user data for Recharts
    const userChartData = (data?.byUser ?? []).map((row: any) => ({
        name: `${row.user?.firstName} ${row.user?.lastName}`,
        hours: row.totalHours,
    }));

    return (
        <Grid container spacing={3}>
            {/* KPI Summary Card */}
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(102,126,234,0.07)', borderLeft: '4px solid #667eea', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <CardContent>
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">TOTAL HOURS LOGGED</Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, color: '#667eea' }}>
                            {Number(data?.totals?.totalHours ?? 0).toFixed(1)} <Typography component="span" variant="h6">hrs</Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Sum of all time tracking records recorded across the organization
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Hours by Project Chart */}
            <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp sx={{ color: '#667eea' }} /> Logged Hours by Project
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.byProject ?? []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis dataKey="project.name" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} unit="h" />
                                    <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                                    <Bar dataKey="totalHours" name="Hours Logged" fill="#667eea" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Team Member allocation Bar Chart */}
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Group sx={{ color: '#4caf50' }} /> Resource Hours Allocation
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userChartData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                                    <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} width={120} />
                                    <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                                    <Bar dataKey="hours" name="Hours Logged" fill="#4caf50" radius={[0, 4, 4, 0]} maxBarSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Hours by Team Member Table */}
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Hours Logged List</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#f9fafb', fontWeight: 'bold' }}>Name</TableCell>
                                        <TableCell align="right" sx={{ bgcolor: '#f9fafb', fontWeight: 'bold' }}>Total Hours</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(data?.byUser ?? []).map((row: any, i: number) => (
                                        <TableRow key={i} hover>
                                            <TableCell>{row.user?.firstName} {row.user?.lastName}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: '600' }}>{Number(row.totalHours).toFixed(1)} hrs</TableCell>
                                        </TableRow>
                                    ))}
                                    {(data?.byUser ?? []).length === 0 && (
                                        <TableRow><TableCell colSpan={2} align="center"><Typography variant="body2" color="text.secondary">No data.</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

// ─── Task Report Tab ────────────────────────────────────────────────────────
function TaskReport() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/reports/tasks')
            .then(r => setData(r.data.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load report'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const statusColors: Record<string, string> = {
        TODO: '#9ca3af',
        IN_PROGRESS: '#3b82f6',
        IN_REVIEW: '#f59e0b',
        COMPLETED: '#10b981',
        CANCELLED: '#6b7280',
        ON_TRACK: '#10b981',
        AT_RISK: '#f59e0b',
        BREACHED: '#ef4444',
    };

    // Format data for Recharts Pie
    const statusPieData = (data?.byStatus ?? []).map((row: any) => ({
        name: row.status.replace(/_/g, ' '),
        value: row._count,
        color: statusColors[row.status] || '#764ba2',
    }));

    const priorityBarData = (data?.byPriority ?? []).map((row: any) => ({
        name: row.priority,
        count: row._count,
    }));

    const slaPieData = (data?.bySlaStatus ?? []).map((row: any) => ({
        name: (row.slaStatus || 'N/A').replace(/_/g, ' '),
        value: row._count,
        color: statusColors[row.slaStatus] || '#9ca3af',
    }));

    return (
        <Grid container spacing={3}>
            {/* Task Status Donut Chart */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PieIcon sx={{ color: '#3b82f6' }} /> Task Status Distribution
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {statusPieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                                    <Legend formatter={(value, entry: any) => `${value} (${entry.payload.value})`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Task Priority Bar Chart */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BarChartIcon sx={{ color: '#764ba2' }} /> Task Priority Allocation
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                                    <Bar dataKey="count" name="Tasks Count" fill="#764ba2" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* SLA Compliance Donut Chart */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning sx={{ color: '#f59e0b' }} /> SLA Compliance Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={slaPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {slaPieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                                    <Legend formatter={(value, entry: any) => `${value} (${entry.payload.value})`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Breached Tasks */}
            {(data?.breachedTasks ?? []).length > 0 && (
                <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #fee2e2' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Warning color="error" />
                                <Typography variant="h6" fontWeight="bold" color="error">SLA Breached Tasks</Typography>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Task</b></TableCell>
                                            <TableCell><b>Project</b></TableCell>
                                            <TableCell><b>Assignee</b></TableCell>
                                            <TableCell><b>Due Date</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.breachedTasks ?? []).map((t: any) => (
                                            <TableRow key={t.id} hover>
                                                <TableCell sx={{ fontWeight: '500' }}>{t.title}</TableCell>
                                                <TableCell>{t.project?.name ?? '—'}</TableCell>
                                                <TableCell>{t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned'}</TableCell>
                                                <TableCell sx={{ color: 'error.main', fontWeight: '500' }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
}

// ─── Project Report Tab ────────────────────────────────────────────────────
function ProjectReport() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/reports/projects')
            .then(r => setProjects(r.data.data ?? []))
            .catch(e => setError(e.response?.data?.message || 'Failed to load report'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Grid container spacing={3}>
            {/* Composed Chart: Budget vs Logged vs Approved vs Billed */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp sx={{ color: '#667eea' }} /> Projects Analytical BI (Hours Comparison)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Compare total logged, approved, and billed hours against the assigned project budget hours.
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={projects} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                                    <CartesianGrid stroke="#f5f5f5" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} unit="h" />
                                    <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                                    <Legend />
                                    <Bar dataKey="loggedHours" name="Logged Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                    <Bar dataKey="approvedHours" name="Approved Hours" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                    <Bar dataKey="billedHours" name="Billed Hours" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                    <Line type="monotone" dataKey="budgetHours" name="Budget Hours" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Details Table */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>All Projects Summary</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                    <TableRow>
                                        <TableCell><b>Project</b></TableCell>
                                        <TableCell><b>Client</b></TableCell>
                                        <TableCell><b>Manager</b></TableCell>
                                        <TableCell><b>Status</b></TableCell>
                                        <TableCell align="right"><b>Tasks</b></TableCell>
                                        <TableCell align="right"><b>Members</b></TableCell>
                                        <TableCell align="right"><b>Logged Hrs</b></TableCell>
                                        <TableCell align="right"><b>Approved Hrs</b></TableCell>
                                        <TableCell align="right"><b>Billed Hrs</b></TableCell>
                                        <TableCell align="right"><b>Budget Hrs</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.map((p: any) => (
                                        <TableRow key={p.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{p.code}</Typography>
                                            </TableCell>
                                            <TableCell>{p.client?.name ?? '—'}</TableCell>
                                            <TableCell>{p.projectManager ? `${p.projectManager.firstName} ${p.projectManager.lastName}` : '—'}</TableCell>
                                            <TableCell><Chip label={p.status.replace(/_/g, ' ')} size="small" color={statusColor(p.status)} /></TableCell>
                                            <TableCell align="right">{p._count?.tasks ?? 0}</TableCell>
                                            <TableCell align="right">{p._count?.members ?? 0}</TableCell>
                                            <TableCell align="right" sx={{ color: p.budgetHours && p.loggedHours > p.budgetHours ? 'error.main' : 'inherit', fontWeight: '600' }}>
                                                {Number(p.loggedHours).toFixed(1)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: '600' }}>
                                                {Number(p.approvedHours ?? 0).toFixed(1)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: '600' }}>
                                                {Number(p.billedHours ?? 0).toFixed(1)}
                                            </TableCell>
                                            <TableCell align="right">{p.budgetHours ?? '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {projects.length === 0 && (
                                        <TableRow><TableCell colSpan={10}><Typography variant="body2" color="text.secondary">No projects found.</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ReportsPage() {
    useAuth(true);
    const { user, hydrated } = useAppSelector((state: any) => state.auth);
    const router = useRouter();
    const [tab, setTab] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    // Role guard
    useEffect(() => {
        if (hydrated && user && !['SUPER_ADMIN', 'PROJECT_MANAGER', 'FINANCE_ADMIN'].includes(user.role)) {
            router.push('/dashboard');
        }
    }, [hydrated, user, router]);

    if (!isMounted || !hydrated) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <BarChartIcon sx={{ fontSize: 32, color: '#667eea' }} />
                    <Typography variant="h4" fontWeight="bold">Reports</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Analytics and summaries across your projects, tasks, and time logs.
                </Typography>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ mb: 3, borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { fontWeight: 600 } }}
                >
                    <Tab icon={<AccessTime fontSize="small" />} iconPosition="start" label="Time Logs" />
                    <Tab icon={<Assignment fontSize="small" />} iconPosition="start" label="Tasks" />
                    <Tab icon={<FolderOpen fontSize="small" />} iconPosition="start" label="Projects" />
                </Tabs>

                {tab === 0 && <TimeLogReport />}
                {tab === 1 && <TaskReport />}
                {tab === 2 && <ProjectReport />}
            </Box>
        </DashboardLayout>
    );
}
