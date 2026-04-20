'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Chip, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    Select, FormControl, InputLabel, Alert, Avatar, Tooltip, Divider,
    IconButton, LinearProgress,
} from '@mui/material';
import {
    Add, PlayArrow, CheckCircle, Pause, Speed, DragIndicator,
    FolderOpen, Person, Schedule, Edit,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Sprint {
    id: number;
    name: string;
    goal: string;
    status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    endDate: string;
    sprintDuration: number;
    project: { id: number; name: string; code: string };
    tasks: Task[];
    _count: { tasks: number };
}

interface Task {
    id: number;
    code: string;
    title: string;
    status: string;
    priority: string;
    slaStatus: string;
    assignee?: { firstName: string; lastName: string };
    estimatedHours?: number;
}

// ── KANBAN COLUMNS ─────────────────────────────────────────────────────────────
const COLUMNS = [
    { key: 'OPEN', label: 'Open', color: '#78909c' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#1976d2' },
    { key: 'IN_REVIEW', label: 'In Review', color: '#7b1fa2' },
    { key: 'COMPLETED', label: 'Done', color: '#2e7d32' },
];

const PRIORITY_DOT: Record<string, string> = {
    URGENT: '#d32f2f', HIGH: '#f57c00', MEDIUM: '#1976d2', LOW: '#4caf50',
};
const SLA_BADGE: Record<string, { label: string; color: string }> = {
    BREACHED: { label: '🔴 Breached', color: '#fdecea' },
    AT_RISK: { label: '🟡 At Risk', color: '#fff8e1' },
    ON_TRACK: { label: '🟢 On Track', color: '#e8f5e9' },
};

// ── Kanban Task Card ────────────────────────────────────────────────────────────
function KanbanCard({ task, onMoveNext, onMovePrev, onView }: {
    task: Task;
    onMoveNext: () => void;
    onMovePrev: () => void;
    onView: () => void;
}) {
    const slaBadge = SLA_BADGE[task.slaStatus];
    return (
        <Card
            sx={{
                mb: 1.5, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.14)', transform: 'translateY(-2px)' },
                borderLeft: `4px solid ${PRIORITY_DOT[task.priority] ?? '#ccc'}`,
                ...(slaBadge && { bgcolor: slaBadge.color }),
            }}
            onClick={onView}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontWeight={700}>
                        {task.code}
                    </Typography>
                    {slaBadge && <Typography variant="caption" fontSize={10}>{slaBadge.label}</Typography>}
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                    {task.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {task.assignee ? (
                        <Tooltip title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#667eea' }}>
                                {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
                            </Avatar>
                        </Tooltip>
                    ) : <Box />}
                    <Chip label={task.priority} size="small" sx={{
                        height: 16, fontSize: 9,
                        bgcolor: `${PRIORITY_DOT[task.priority]}20`,
                        color: PRIORITY_DOT[task.priority] ?? '#666',
                    }} />
                </Box>
            </CardContent>
        </Card>
    );
}

// ── New Sprint Dialog ───────────────────────────────────────────────────────────
function NewSprintDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [projectId, setProjectId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) apiClient.get('/projects?limit=100').then(r => setProjects(r.data.data?.projects ?? []));
    }, [open]);

    const handleCreate = async () => {
        if (!name || !projectId || !startDate || !endDate) { setError('Name, project, start and end dates are required.'); return; }
        setSaving(true); setError('');
        try {
            await apiClient.post('/sprints', { name, goal, projectId: parseInt(projectId), startDate, endDate, sprintDuration: 14 });
            onCreated();
            onClose();
            setName(''); setGoal(''); setProjectId(''); setStartDate(''); setEndDate('');
        } catch (e: any) { setError(e.response?.data?.message || 'Failed to create sprint'); }
        finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                <Box display="flex" alignItems="center" gap={1}><Speed /><Typography variant="h6">New Sprint</Typography></Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField label="Sprint Name *" value={name} onChange={e => setName(e.target.value)} fullWidth />
                    <TextField label="Sprint Goal" value={goal} onChange={e => setGoal(e.target.value)} fullWidth multiline rows={2} />
                    <FormControl fullWidth>
                        <InputLabel>Project *</InputLabel>
                        <Select value={projectId} label="Project *" onChange={e => setProjectId(e.target.value)}>
                            {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.code})</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="Start Date *" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label="End Date *" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleCreate} disabled={saving}
                    sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    {saving ? <CircularProgress size={16} color="inherit" /> : 'Create Sprint'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SprintsPage() {
    useAuth(true);
    const router = useRouter();
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newOpen, setNewOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
    const [sprintTasks, setSprintTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const fetchSprints = async () => {
        setLoading(true);
        apiClient.get('/sprints').then(r => setSprints(r.data.data ?? []))
            .catch(e => setError(e.response?.data?.message || 'Failed to load'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSprints(); }, []);

    const openKanban = async (sprint: Sprint) => {
        setSelectedSprint(sprint);
        setLoadingTasks(true);
        apiClient.get(`/tasks?sprintId=${sprint.id}&limit=200`)
            .then(r => setSprintTasks(r.data.data?.tasks ?? []))
            .catch(console.error)
            .finally(() => setLoadingTasks(false));
    };

    const moveTask = async (taskId: number, newStatus: string) => {
        try {
            await apiClient.patch(`/tasks/${taskId}`, { status: newStatus });
            setSprintTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (e) { console.error(e); }
    };

    const getNextStatus = (status: string) => {
        const order = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];
        const i = order.indexOf(status);
        return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
    };
    const getPrevStatus = (status: string) => {
        const order = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];
        const i = order.indexOf(status);
        return i > 0 ? order[i - 1] : null;
    };

    const STATUS_COLOR: Record<string, any> = { PLANNED: 'default', ACTIVE: 'primary', COMPLETED: 'success', CANCELLED: 'error' };

    // ── Kanban Board View ──────────────────────────────────────────────────────
    if (selectedSprint) {
        const now = Date.now();
        const start = new Date(selectedSprint.startDate).getTime();
        const end = new Date(selectedSprint.endDate).getTime();
        const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
        const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
        const completedTasks = sprintTasks.filter(t => t.status === 'COMPLETED').length;

        return (
            <DashboardLayout>
                <Box>
                    {/* Sprint header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Button onClick={() => setSelectedSprint(null)} size="small" sx={{ mb: 1 }}>← All Sprints</Button>
                            <Typography variant="h4" fontWeight={700}>{selectedSprint.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{selectedSprint.goal || 'No goal set'}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Chip label={selectedSprint.project.code} size="small" variant="outlined" />
                                <Chip label={selectedSprint.status} size="small" color={STATUS_COLOR[selectedSprint.status]} />
                                <Chip label={`${completedTasks}/${sprintTasks.length} tasks`} size="small" />
                                <Chip label={`${daysLeft} days left`} size="small" color={daysLeft < 3 ? 'error' : 'default'} />
                            </Box>
                        </Box>
                        <Box sx={{ minWidth: 240 }}>
                            <Typography variant="caption" color="text.secondary">Sprint Progress</Typography>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 0.5, mb: 0.5 }} />
                            <Typography variant="caption">{progress.toFixed(0)}% time elapsed</Typography>
                        </Box>
                    </Box>

                    {/* Kanban columns */}
                    {loadingTasks ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                            {COLUMNS.map(col => {
                                const colTasks = sprintTasks.filter(t => t.status === col.key);
                                return (
                                    <Box
                                        key={col.key}
                                        sx={{
                                            minWidth: 260, width: 280, flexShrink: 0,
                                            bgcolor: '#f4f6f8', borderRadius: 2, p: 1.5,
                                            borderTop: `3px solid ${col.color}`,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                            <Typography variant="subtitle2" fontWeight={700} color={col.color}>{col.label}</Typography>
                                            <Chip label={colTasks.length} size="small" sx={{ bgcolor: col.color, color: 'white', height: 20, fontSize: 11 }} />
                                        </Box>
                                        {colTasks.length === 0 && (
                                            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                                <Typography variant="caption">No tasks</Typography>
                                            </Box>
                                        )}
                                        {colTasks.map(task => {
                                            const nextS = getNextStatus(task.status);
                                            const prevS = getPrevStatus(task.status);
                                            return (
                                                <KanbanCard
                                                    key={task.id}
                                                    task={task}
                                                    onView={() => router.push(`/tasks/${task.id}`)}
                                                    onMoveNext={() => nextS && moveTask(task.id, nextS)}
                                                    onMovePrev={() => prevS && moveTask(task.id, prevS)}
                                                />
                                            );
                                        })}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </DashboardLayout>
        );
    }

    // ── Sprint List View ───────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Sprint Board</Typography>
                        <Typography variant="body2" color="text.secondary">Plan and track your agile sprints — click a sprint to open the Kanban board</Typography>
                    </Box>
                    <Button
                        variant="contained" startIcon={<Add />}
                        onClick={() => setNewOpen(true)}
                        sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                        New Sprint
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

                {/* Sprint cards grouped by status */}
                {['ACTIVE', 'PLANNED', 'COMPLETED'].map(status => {
                    const group = sprints.filter(s => s.status === status);
                    if (group.length === 0) return null;
                    return (
                        <Box key={status} sx={{ mb: 4 }}>
                            <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                {status === 'ACTIVE' ? '🟢 Active' : status === 'PLANNED' ? '📅 Planned' : '✅ Completed'}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {group.map(sprint => {
                                    const now = Date.now();
                                    const start = new Date(sprint.startDate).getTime();
                                    const end = new Date(sprint.endDate).getTime();
                                    const progress = sprint.status === 'ACTIVE'
                                        ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
                                        : sprint.status === 'COMPLETED' ? 100 : 0;
                                    return (
                                        <Card
                                            key={sprint.id}
                                            sx={{
                                                width: 300, cursor: 'pointer', transition: 'all 0.2s',
                                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
                                                borderTop: `3px solid ${sprint.status === 'ACTIVE' ? '#2e7d32' : sprint.status === 'PLANNED' ? '#667eea' : '#9e9e9e'}`,
                                            }}
                                            onClick={() => openKanban(sprint)}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="h6" fontWeight={700}>{sprint.name}</Typography>
                                                    <Chip label={sprint.status} size="small" color={STATUS_COLOR[sprint.status]} />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 36 }}>
                                                    {sprint.goal || 'No goal set'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Chip label={sprint.project.code} size="small" variant="outlined" />
                                                    <Chip label={`${sprint._count?.tasks ?? 0} tasks`} size="small" variant="outlined" />
                                                </Box>
                                                {sprint.status === 'ACTIVE' && (
                                                    <Box>
                                                        <LinearProgress variant="determinate" value={progress}
                                                            sx={{ height: 6, borderRadius: 3, mb: 0.5 }} />
                                                        <Typography variant="caption" color="text.secondary">{progress.toFixed(0)}% elapsed</Typography>
                                                    </Box>
                                                )}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(sprint.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(sprint.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                })}

                {!loading && sprints.length === 0 && (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 8 }}>
                            <Speed sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No sprints yet</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Create your first sprint to start organizing work</Typography>
                            <Button variant="contained" startIcon={<Add />} onClick={() => setNewOpen(true)}
                                sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                Create First Sprint
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </Box>

            <NewSprintDialog open={newOpen} onClose={() => setNewOpen(false)} onCreated={fetchSprints} />
        </DashboardLayout>
    );
}
