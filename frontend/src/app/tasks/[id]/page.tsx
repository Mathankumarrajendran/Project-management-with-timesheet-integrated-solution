'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Card, CardContent, Typography, Chip, CircularProgress, Alert,
    Grid, Divider, Button, TextField, Avatar, LinearProgress, Tooltip,
} from '@mui/material';
import {
    Assignment, ArrowBack, Schedule, Person, FolderOpen, Warning,
    CheckCircle, Comment, AccessTime, EditCalendar, LockClock, History,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/apiClient';

const PRIORITY_COLOR: Record<string, any> = {
    URGENT: 'error', HIGH: 'warning', MEDIUM: 'info', LOW: 'success',
};
const SLA_COLOR: Record<string, any> = {
    BREACHED: 'error', AT_RISK: 'warning', ON_TRACK: 'success', NOT_STARTED: 'default',
};
const STATUS_COLOR: Record<string, any> = {
    OPEN: 'default', ASSIGNED: 'default', IN_PROGRESS: 'primary', IN_REVIEW: 'secondary',
    COMPLETED: 'success', APPROVED: 'success', ON_HOLD: 'warning',
};

const PM_ROLES = ['SUPER_ADMIN', 'PROJECT_MANAGER'];

function SlaBar({ slaStartTime, slaTargetHours }: { slaStartTime?: string | null; slaTargetHours?: number | null }) {
    if (!slaStartTime || !slaTargetHours) return <Typography variant="caption" color="text.secondary">SLA not configured</Typography>;
    const elapsed = (Date.now() - new Date(slaStartTime).getTime()) / 3600000;
    const pct = Math.min((elapsed / slaTargetHours) * 100, 100);
    const color = pct >= 100 ? 'error' : pct >= 80 ? 'warning' : 'success';
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">{elapsed.toFixed(1)}h elapsed</Typography>
                <Typography variant="caption">{slaTargetHours}h target</Typography>
            </Box>
            <LinearProgress
                variant="determinate" value={pct} color={color}
                sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color={`${color}.main`}>{pct.toFixed(0)}% of SLA used</Typography>
        </Box>
    );
}

export default function TaskDetailPage() {
    useAuth(true);
    const params = useParams();
    const router = useRouter();
    const taskId = params?.id as string;
    const { user } = useAppSelector((s: any) => s.auth);
    const isPM = PM_ROLES.includes(user?.role ?? '');

    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Comments
    const [comment, setComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [comments, setComments] = useState<any[]>([]);

    // Status update
    const [updatingStatus, setUpdatingStatus] = useState('');

    // Due date override (PM only)
    const [dueDateOverrideMode, setDueDateOverrideMode] = useState(false);
    const [newDueDate, setNewDueDate] = useState('');
    const [dueDateReason, setDueDateReason] = useState('');
    const [savingDueDate, setSavingDueDate] = useState(false);
    const [dueDateMsg, setDueDateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Audit logs for due date overrides
    const [dueDateLogs, setDueDateLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    const fetchTask = () =>
        Promise.all([
            apiClient.get(`/tasks/${taskId}`),
            apiClient.get(`/tasks/${taskId}/comments`).catch(() => ({ data: { data: [] } })),
        ]).then(([tr, cr]) => {
            setTask(tr.data.data);
            setComments(cr.data.data ?? []);
        }).catch(e => setError(e.response?.data?.message || 'Failed to load task'))
            .finally(() => setLoading(false));

    useEffect(() => {
        if (!taskId) return;
        fetchTask();
    }, [taskId]);

    const handleStatusChange = async (newStatus: string) => {
        setUpdatingStatus(newStatus);
        try {
            const updated = await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
            setTask(updated.data.data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to update status');
        } finally { setUpdatingStatus(''); }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        setPosting(true);
        try {
            const r = await apiClient.post(`/tasks/${taskId}/comments`, { content: comment });
            setComments(prev => [r.data.data, ...prev]);
            setComment('');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to post comment');
        } finally { setPosting(false); }
    };

    const handleDueDateOverride = async () => {
        if (!newDueDate) { setDueDateMsg({ type: 'error', text: 'Please select a new due date.' }); return; }
        if (!dueDateReason.trim()) { setDueDateMsg({ type: 'error', text: 'A reason is required to change the due date.' }); return; }
        setSavingDueDate(true); setDueDateMsg(null);
        try {
            const res = await apiClient.put(`/tasks/${taskId}`, {
                dueDate: new Date(newDueDate).toISOString(),
                dueDateReason: dueDateReason.trim(),
            });
            setTask(res.data.data);
            setDueDateMsg({ type: 'success', text: 'Due date updated and logged successfully.' });
            setDueDateOverrideMode(false);
            setNewDueDate('');
            setDueDateReason('');
            // Reload audit logs
            if (showLogs) fetchDueDateLogs();
        } catch (e: any) {
            setDueDateMsg({ type: 'error', text: e.response?.data?.message || 'Failed to update due date.' });
        } finally { setSavingDueDate(false); }
    };

    const fetchDueDateLogs = async () => {
        try {
            const res = await apiClient.get(`/audit-logs?entityType=Task&entityId=${taskId}&action=DUE_DATE_OVERRIDE`);
            setDueDateLogs(res.data.data?.logs ?? res.data.data ?? []);
        } catch {
            setDueDateLogs([]);
        }
    };

    const toggleLogs = () => {
        if (!showLogs) fetchDueDateLogs();
        setShowLogs(p => !p);
    };

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box></DashboardLayout>;
    if (error && !task) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    const NEXT_STATUSES: Record<string, string[]> = {
        OPEN: ['ASSIGNED', 'IN_PROGRESS'],
        ASSIGNED: ['IN_PROGRESS', 'ON_HOLD'],
        IN_PROGRESS: ['IN_REVIEW', 'ON_HOLD'],
        IN_REVIEW: ['COMPLETED', 'IN_PROGRESS'],
        ON_HOLD: ['IN_PROGRESS'],
        COMPLETED: [],
        APPROVED: [],
    };

    const nextStatuses = NEXT_STATUSES[task?.status] ?? [];

    return (
        <DashboardLayout>
            <Box>
                {/* Back + header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => router.back()} variant="text" size="small">Back</Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontWeight={700}>
                                {task?.code}
                            </Typography>
                            <Chip label={task?.status?.replace(/_/g, ' ')} size="small" color={STATUS_COLOR[task?.status] ?? 'default'} />
                            <Chip label={task?.priority} size="small" color={PRIORITY_COLOR[task?.priority] ?? 'default'} />
                            {task?.slaStatus && (
                                <Chip icon={task?.slaStatus === 'BREACHED' ? <Warning fontSize="small" /> : <Schedule fontSize="small" />}
                                    label={task?.slaStatus?.replace(/_/g, ' ')} size="small" color={SLA_COLOR[task?.slaStatus] ?? 'default'} />
                            )}
                        </Box>
                        <Typography variant="h4" fontWeight={700}>{task?.title}</Typography>
                    </Box>

                    {/* Status transitions */}
                    {nextStatuses.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {nextStatuses.map(s => (
                                <Button
                                    key={s}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleStatusChange(s)}
                                    disabled={!!updatingStatus}
                                    startIcon={updatingStatus === s ? <CircularProgress size={12} /> : <CheckCircle fontSize="small" />}
                                >
                                    → {s.replace(/_/g, ' ')}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {/* Main details */}
                    <Grid item xs={12} md={8}>
                        {/* Description */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Assignment sx={{ color: '#667eea', fontSize: 20 }} />
                                    <Typography variant="h6" fontWeight={700}>Description</Typography>
                                </Box>
                                <Typography variant="body1" color={task?.description ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
                                    {task?.description || 'No description provided.'}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* SLA Bar */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Schedule sx={{ color: '#667eea', fontSize: 20 }} />
                                    <Typography variant="h6" fontWeight={700}>SLA Progress</Typography>
                                </Box>
                                <SlaBar slaStartTime={task?.slaStartTime} slaTargetHours={task?.slaTargetHours} />
                            </CardContent>
                        </Card>

                        {/* Comments */}
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Comment sx={{ color: '#667eea', fontSize: 20 }} />
                                    <Typography variant="h6" fontWeight={700}>Comments ({comments.length})</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                    <TextField
                                        fullWidth multiline minRows={2} placeholder="Add a comment…"
                                        value={comment} onChange={e => setComment(e.target.value)}
                                        size="small"
                                    />
                                    <Button
                                        variant="contained" onClick={handleComment}
                                        disabled={posting || !comment.trim()}
                                        sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', minWidth: 80 }}
                                    >
                                        {posting ? <CircularProgress size={16} color="inherit" /> : 'Post'}
                                    </Button>
                                </Box>

                                {comments.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                                )}
                                {comments.map((c: any) => (
                                    <Box key={c.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea', fontSize: 13 }}>
                                            {c.user?.firstName?.charAt(0)}{c.user?.lastName?.charAt(0)}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>{c.user?.firstName} {c.user?.lastName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Task Details card */}
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Task Details</Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FolderOpen fontSize="small" sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Project</Typography>
                                            <Typography variant="body2" fontWeight={500}>{task?.project?.name ?? '—'}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Assignee</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {task?.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Due Date Row */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <LockClock fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                                        <Box flex={1}>
                                            <Typography variant="caption" color="text.secondary">Scheduled Due Date</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {task?.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </Typography>
                                            {isPM && !dueDateOverrideMode && (
                                                <Button
                                                    size="small"
                                                    startIcon={<EditCalendar fontSize="small" />}
                                                    onClick={() => {
                                                        setDueDateOverrideMode(true);
                                                        setDueDateMsg(null);
                                                        setNewDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                                                    }}
                                                    sx={{ mt: 0.5, fontSize: 11, px: 1 }}
                                                    variant="outlined"
                                                    color="warning"
                                                >
                                                    Override (PM)
                                                </Button>
                                            )}
                                            {!isPM && (
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.3 }}>
                                                    🔒 Only PM can change
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Estimated Hours</Typography>
                                            <Typography variant="body2" fontWeight={500}>{task?.estimatedHours ?? '—'} hrs</Typography>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Task Type</Typography>
                                        <Typography variant="body2" fontWeight={500}>{task?.taskType?.replace(/_/g, ' ') ?? '—'}</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Sprint</Typography>
                                        <Typography variant="body2" fontWeight={500}>{task?.sprint?.name ?? 'No Sprint'}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* ── PM Due Date Override Panel ─────────────── */}
                        {isPM && dueDateOverrideMode && (
                            <Card sx={{ mb: 2, border: '2px solid', borderColor: 'warning.main' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <EditCalendar sx={{ color: 'warning.main', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
                                            Override Due Date
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                        This change will be permanently logged in the audit trail.
                                    </Typography>

                                    {dueDateMsg && (
                                        <Alert severity={dueDateMsg.type} sx={{ mb: 1.5 }} onClose={() => setDueDateMsg(null)}>
                                            {dueDateMsg.text}
                                        </Alert>
                                    )}

                                    <TextField
                                        fullWidth type="date" label="New Due Date" size="small"
                                        value={newDueDate}
                                        onChange={e => setNewDueDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ mb: 1.5 }}
                                    />
                                    <TextField
                                        fullWidth multiline rows={2} size="small"
                                        label="Reason for change *"
                                        placeholder="e.g. Client requested extension, resource conflict…"
                                        value={dueDateReason}
                                        onChange={e => setDueDateReason(e.target.value)}
                                        sx={{ mb: 1.5 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined" size="small"
                                            onClick={() => { setDueDateOverrideMode(false); setDueDateMsg(null); }}
                                            disabled={savingDueDate}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained" size="small" color="warning"
                                            onClick={handleDueDateOverride}
                                            disabled={savingDueDate || !newDueDate || !dueDateReason.trim()}
                                            startIcon={savingDueDate ? <CircularProgress size={12} color="inherit" /> : <CheckCircle fontSize="small" />}
                                        >
                                            {savingDueDate ? 'Saving…' : 'Confirm Override'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Due Date Override History */}
                        <Card sx={{ mb: 2 }}>
                            <CardContent sx={{ pb: '12px !important' }}>
                                <Box
                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                    onClick={toggleLogs}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <History fontSize="small" sx={{ color: '#667eea' }} />
                                        <Typography variant="subtitle2" fontWeight={700}>Due Date Override Log</Typography>
                                    </Box>
                                    <Typography variant="caption" color="primary">{showLogs ? 'Hide ▲' : 'Show ▼'}</Typography>
                                </Box>

                                {showLogs && (
                                    <Box sx={{ mt: 1.5 }}>
                                        {dueDateLogs.length === 0 ? (
                                            <Typography variant="caption" color="text.secondary">No overrides recorded.</Typography>
                                        ) : (
                                            dueDateLogs.map((log: any, i: number) => {
                                                const meta = log.newValues ?? log.metadata ?? {};
                                                return (
                                                    <Box key={i} sx={{ mb: 1.5, p: 1, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #eee' }}>
                                                        <Typography variant="caption" fontWeight={600} color="warning.dark">
                                                            {meta.oldDueDate ? new Date(meta.oldDueDate).toLocaleDateString('en-GB') : '—'}
                                                            {' '}→{' '}
                                                            {meta.newDueDate ? new Date(meta.newDueDate).toLocaleDateString('en-GB') : '—'}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3 }}>
                                                            Reason: {meta.reason ?? '—'}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" color="text.disabled">
                                                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timestamps */}
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Timestamps</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Created: {task?.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Updated: {task?.updatedAt ? new Date(task.updatedAt).toLocaleString() : '—'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
