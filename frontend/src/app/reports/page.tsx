'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Tab, Tabs, CircularProgress,
    Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, LinearProgress,
} from '@mui/material';
import {
    BarChart as BarChartIcon, Assignment, AccessTime, FolderOpen, Warning,
} from '@mui/icons-material';
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

    const maxHours = Math.max(...(data?.byProject?.map((p: any) => p.totalHours) ?? [1]), 1);

    return (
        <Grid container spacing={3}>
            {/* Summary Card */}
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(102,126,234,0.07)', borderLeft: '4px solid #667eea' }}>
                    <CardContent>
                        <Typography variant="body2" color="text.secondary">Total Hours Logged</Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, color: '#667eea' }}>
                            {Number(data?.totals?.totalHours ?? 0).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Across all time logs</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* By Project */}
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Hours by Project</Typography>
                        {(data?.byProject ?? []).length === 0 && (
                            <Typography variant="body2" color="text.secondary">No time logs found.</Typography>
                        )}
                        {(data?.byProject ?? []).map((row: any, i: number) => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={500}>{row.project?.name ?? '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary">{Number(row.totalHours).toFixed(1)} hrs</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(row.totalHours / maxHours) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(102,126,234,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#667eea' } }}
                                />
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>

            {/* By User */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Hours by Team Member</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Name</b></TableCell>
                                        <TableCell align="right"><b>Total Hours</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(data?.byUser ?? []).map((row: any, i: number) => (
                                        <TableRow key={i} hover>
                                            <TableCell>{row.user?.firstName} {row.user?.lastName}</TableCell>
                                            <TableCell align="right">{Number(row.totalHours).toFixed(1)} hrs</TableCell>
                                        </TableRow>
                                    ))}
                                    {(data?.byUser ?? []).length === 0 && (
                                        <TableRow><TableCell colSpan={2}><Typography variant="body2" color="text.secondary">No data.</Typography></TableCell></TableRow>
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

    return (
        <Grid container spacing={3}>
            {/* By Status */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>By Status</Typography>
                        {(data?.byStatus ?? []).map((row: any, i: number) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                                <Chip label={row.status.replace(/_/g, ' ')} size="small" color={statusColor(row.status)} />
                                <Typography variant="body2" fontWeight={600}>{row._count}</Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>

            {/* By Priority */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>By Priority</Typography>
                        {(data?.byPriority ?? []).map((row: any, i: number) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                                <Chip
                                    label={row.priority}
                                    size="small"
                                    sx={{ bgcolor: row.priority === 'URGENT' ? '#fee2e2' : row.priority === 'HIGH' ? '#fef3c7' : row.priority === 'MEDIUM' ? '#dbeafe' : '#f0fdf4', color: row.priority === 'URGENT' ? '#dc2626' : row.priority === 'HIGH' ? '#d97706' : row.priority === 'MEDIUM' ? '#2563eb' : '#16a34a', fontWeight: 600 }}
                                />
                                <Typography variant="body2" fontWeight={600}>{row._count}</Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>

            {/* By SLA Status */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>By SLA Status</Typography>
                        {(data?.bySlaStatus ?? []).map((row: any, i: number) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                                <Chip label={row.slaStatus?.replace(/_/g, ' ') ?? 'N/A'} size="small" color={statusColor(row.slaStatus)} />
                                <Typography variant="body2" fontWeight={600}>{row._count}</Typography>
                            </Box>
                        ))}
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
                                                <TableCell>{t.title}</TableCell>
                                                <TableCell>{t.project?.name ?? '—'}</TableCell>
                                                <TableCell>{t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned'}</TableCell>
                                                <TableCell sx={{ color: 'error.main' }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</TableCell>
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

// ─── Project Report Tab ─────────────────────────────────────────────────────
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
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>All Projects Summary</Typography>
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
                                    <TableCell align="right" sx={{ color: p.budgetHours && p.loggedHours > p.budgetHours ? 'error.main' : 'inherit' }}>
                                        {Number(p.loggedHours).toFixed(1)}
                                    </TableCell>
                                    <TableCell align="right">{p.budgetHours ?? '—'}</TableCell>
                                </TableRow>
                            ))}
                            {projects.length === 0 && (
                                <TableRow><TableCell colSpan={8}><Typography variant="body2" color="text.secondary">No projects found.</Typography></TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
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
