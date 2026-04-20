'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Grid, Card, CardContent, Typography, Box, CircularProgress, Chip, Alert,
    Button, Avatar, Tooltip, Badge, IconButton, Divider, LinearProgress,
    Select, MenuItem, FormControl,
} from '@mui/material';
import {
    People, Business, FolderOpen, Assignment, TrendingUp, Warning, AccessTime,
    CheckCircle, Schedule, Add, Refresh, OpenInNew, FilterList,
    PlayArrow, RateReview, DoneAll, Inbox, Person,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/apiClient';

// ─── Shared stat card ──────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon, color, bg, onClick }: any) {
    return (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } : {},
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>{value}</Typography>
                        <Typography variant="caption" color="text.secondary">{sub}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: bg, color, p: 1.5, borderRadius: 2 }}>{icon}</Box>
                </Box>
            </CardContent>
        </Card>
    );
}

// ─── Priority colour map ──────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
    URGENT: '#d32f2f', HIGH: '#ed6c02', MEDIUM: '#0288d1', LOW: '#2e7d32',
};
const PRIORITY_BG: Record<string, string> = {
    URGENT: '#fdecea', HIGH: '#fff3e0', MEDIUM: '#e3f2fd', LOW: '#e8f5e9',
};

// ─── Kanban task card ─────────────────────────────────────────────────────
function TaskCard({
    task, onClick, onDragStart, onDragEnd, isDragging,
}: {
    task: any;
    onClick: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    isDragging: boolean;
}) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const slaBreached = task.slaStatus === 'BREACHED';

    return (
        <Card
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onClick}
            sx={{
                mb: 1.5,
                cursor: 'grab',
                opacity: isDragging ? 0.45 : 1,
                border: `1px solid ${slaBreached ? '#ffcdd2' : isOverdue ? '#ffe0b2' : '#e8eaf6'}`,
                borderLeft: `4px solid ${PRIORITY_COLOR[task.priority] ?? '#9e9e9e'}`,
                transition: 'box-shadow 0.2s, transform 0.15s, opacity 0.15s',
                '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.13)', transform: 'translateY(-2px)' },
                '&:active': { cursor: 'grabbing' },
                bgcolor: PRIORITY_BG[task.priority] ?? '#fff',
                userSelect: 'none',
            }}
        >
            <CardContent sx={{ p: '10px 14px !important' }}>
                {/* Task code + SLA badge */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="text.secondary">
                        {task.code}
                    </Typography>
                    {slaBreached && (
                        <Chip label="SLA BREACHED" size="small" color="error" sx={{ fontSize: 9, height: 16, px: 0.3 }} />
                    )}
                    {!slaBreached && isOverdue && (
                        <Chip label="OVERDUE" size="small" color="warning" sx={{ fontSize: 9, height: 16, px: 0.3 }} />
                    )}
                </Box>

                {/* Title */}
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.8, lineHeight: 1.3 }}>
                    {task.title}
                </Typography>

                {/* Project + Priority */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.8 }}>
                    <Chip
                        label={task.project?.code ?? '—'}
                        size="small"
                        sx={{ fontSize: 10, height: 18, bgcolor: 'rgba(102,126,234,0.1)', color: '#667eea' }}
                    />
                    <Chip
                        label={task.priority}
                        size="small"
                        sx={{ fontSize: 10, height: 18, bgcolor: `${PRIORITY_COLOR[task.priority]}22`, color: PRIORITY_COLOR[task.priority] }}
                    />
                </Box>

                {/* Due date + Assignee */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {task.dueDate ? (
                        <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>
                            📅 {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </Typography>
                    ) : <span />}
                    {task.assignee && (
                        <Tooltip title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#764ba2' }}>
                                {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                            </Avatar>
                        </Tooltip>
                    )}
                </Box>

                {/* SLA progress micro-bar */}
                {task.slaStartTime && task.slaTargetHours && (
                    <Box sx={{ mt: 0.8 }}>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(
                                ((Date.now() - new Date(task.slaStartTime).getTime()) / 3600000 / task.slaTargetHours) * 100,
                                100
                            )}
                            color={slaBreached ? 'error' : 'success'}
                            sx={{ height: 3, borderRadius: 2 }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Kanban column definitions ───────────────────────────────────────────────
type ColumnDef = { key: string; label: string; icon: React.ReactElement; color: string; bg: string };
const COLUMNS: ColumnDef[] = [
    { key: 'OPEN', label: 'Open', icon: <Inbox fontSize="small" />, color: '#9e9e9e', bg: '#f5f5f5' },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: <PlayArrow fontSize="small" />, color: '#0288d1', bg: '#e3f2fd' },
    { key: 'IN_REVIEW', label: 'In Review', icon: <RateReview fontSize="small" />, color: '#ed6c02', bg: '#fff3e0' },
    { key: 'COMPLETED', label: 'Done', icon: <DoneAll fontSize="small" />, color: '#2e7d32', bg: '#e8f5e9' },
];

// ─── Kanban column ────────────────────────────────────────────────────────
function KanbanColumn({
    col, tasks, onTaskClick, onDrop, onDragStart, onDragEnd, draggingId, draggingFromCol,
}: {
    col: ColumnDef;
    tasks: any[];
    onTaskClick: (t: any) => void;
    onDrop: (targetColKey: string) => void;
    onDragStart: (taskId: number, colKey: string) => void;
    onDragEnd: () => void;
    draggingId: number | null;
    draggingFromCol: string | null;
}) {
    const [isOver, setIsOver] = useState(false);
    const canDrop = draggingId !== null && draggingFromCol !== col.key;

    const handleDragOver = (e: React.DragEvent) => {
        if (!canDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleDragEnter = (e: React.DragEvent) => {
        if (!canDrop) return;
        e.preventDefault();
        setIsOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the column box itself
        if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
            setIsOver(false);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        if (canDrop) onDrop(col.key);
    };

    return (
        <Box
            sx={{ flex: '1 1 0', minWidth: 220, maxWidth: 320 }}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column header */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 1.5, py: 1,
                bgcolor: isOver ? `${col.color}18` : col.bg,
                borderRadius: 2,
                border: isOver ? `2px dashed ${col.color}` : `1px solid ${col.color}30`,
                transition: 'background 0.15s, border 0.15s',
            }}>
                <Box sx={{ color: col.color }}>{col.icon}</Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: col.color, flex: 1 }}>
                    {col.label}
                </Typography>
                <Badge badgeContent={tasks.length} color="default"
                    sx={{ '& .MuiBadge-badge': { bgcolor: col.color, color: '#fff', fontSize: 11 } }} />
            </Box>

            {/* Drop zone + cards */}
            <Box
                sx={{
                    minHeight: 100,
                    borderRadius: 2,
                    border: isOver && canDrop ? `2px dashed ${col.color}80` : '2px solid transparent',
                    bgcolor: isOver && canDrop ? `${col.color}08` : 'transparent',
                    transition: 'background 0.15s, border 0.15s',
                    p: isOver && canDrop ? 0.5 : 0,
                }}
            >
                {tasks.length === 0 && !isOver ? (
                    <Box sx={{ py: 3, textAlign: 'center', opacity: 0.4 }}>
                        <Typography variant="caption">No tasks</Typography>
                    </Box>
                ) : (
                    tasks.map(t => (
                        <TaskCard
                            key={t.id}
                            task={t}
                            onClick={() => onTaskClick(t)}
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('taskId', String(t.id));
                                onDragStart(t.id, col.key);
                            }}
                            onDragEnd={() => { onDragEnd(); }}
                            isDragging={draggingId === t.id}
                        />
                    ))
                )}
                {isOver && canDrop && (
                    <Box sx={{
                        height: 48, borderRadius: 2, border: `2px dashed ${col.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: col.color, opacity: 0.7, mt: 0.5,
                    }}>
                        <Typography variant="caption" fontWeight={700}>Drop here</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// ─── Role-based Quick Actions ─────────────────────────────────────────────
function QuickActions({ role, router }: { role: string; router: any }) {
    const isAdmin = role === 'SUPER_ADMIN';
    const isPM = role === 'PROJECT_MANAGER';

    const actions = [
        { label: 'New Task', icon: <Add fontSize="small" />, path: '/tasks', roles: ['SUPER_ADMIN', 'PROJECT_MANAGER'] },
        { label: 'New Project', icon: <FolderOpen fontSize="small" />, path: '/projects', roles: ['SUPER_ADMIN'] },
        { label: 'Manage Users', icon: <People fontSize="small" />, path: '/users', roles: ['SUPER_ADMIN'] },
        { label: 'Sprint Board', icon: <Schedule fontSize="small" />, path: '/sprints', roles: ['SUPER_ADMIN', 'PROJECT_MANAGER'] },
        { label: 'Timesheets', icon: <AccessTime fontSize="small" />, path: '/timesheets/l1-approval', roles: ['SUPER_ADMIN', 'PROJECT_MANAGER'] },
        { label: 'Audit Logs', icon: <CheckCircle fontSize="small" />, path: '/audit-logs', roles: ['SUPER_ADMIN'] },
    ].filter(a => a.roles.includes(role));

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {actions.map(a => (
                <Button
                    key={a.label}
                    variant="outlined"
                    size="small"
                    startIcon={a.icon}
                    onClick={() => router.push(a.path)}
                    sx={{
                        borderRadius: 6, fontWeight: 600, fontSize: 12,
                        borderColor: '#667eea', color: '#667eea',
                        '&:hover': { bgcolor: 'rgba(102,126,234,0.08)' },
                    }}
                >
                    {a.label}
                </Button>
            ))}
        </Box>
    );
}

// ─── Main Kanban Admin/PM Dashboard ──────────────────────────────────────
function KanbanDashboard({ role }: { role: string }) {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'URGENT' | 'BREACHED'>('ALL');
    const [userFilter, setUserFilter] = useState<number | 'ALL'>('ALL');

    // Drag state
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [draggingFromCol, setDraggingFromCol] = useState<string | null>(null);

    const fetch = useCallback(() => {
        setLoading(true);
        Promise.all([
            apiClient.get('/dashboard/admin').catch(() => ({ data: { data: {} } })),
            apiClient.get('/tasks?limit=200'),
        ])
            .then(([dr, tr]) => {
                setStats(dr.data.data);
                setTasks(tr.data.data?.tasks ?? []);
            })
            .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    // Optimistic drag-and-drop status change
    // Map: Kanban column key → the DB status value to send
    const COLUMN_STATUS_MAP: Record<string, string> = {
        OPEN: 'OPEN',
        IN_PROGRESS: 'IN_PROGRESS',
        IN_REVIEW: 'IN_REVIEW',
        COMPLETED: 'COMPLETED',
    };

    // Map task's current DB status → which Kanban column it belongs in
    const statusToColKey = (status: string): string => {
        if (status === 'ASSIGNED') return 'OPEN'; // ASSIGNED tasks live in OPEN column
        if (['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].includes(status)) return status;
        return ''; // CANCELLED, ON_HOLD — not shown
    };

    const handleDrop = async (taskId: number, fromCol: string, toCol: string) => {
        if (fromCol === toCol) return;
        const newStatus = COLUMN_STATUS_MAP[toCol];
        if (!newStatus) return;
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        setDraggingId(null);
        setDraggingFromCol(null);
        try {
            await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
        } catch {
            // Rollback on failure
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: fromCol === 'OPEN' ? 'OPEN' : fromCol } : t));
        }
    };
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    // Extract unique assignees from all tasks
    const uniqueUsers = Array.from(
        new Map(
            tasks
                .filter(t => t.assignee)
                .map(t => [t.assignee.id, t.assignee])
        ).values()
    ).sort((a: any, b: any) => `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`));

    // Apply priority filter
    const filtered = tasks.filter(t => {
        if (filter === 'ALL') return true;
        if (filter === 'BREACHED') return t.slaStatus === 'BREACHED';
        return t.priority === filter;
    });

    // Apply user filter
    const userFiltered = userFilter === 'ALL'
        ? filtered
        : filtered.filter(t => t.assignee?.id === userFilter);

    // Exclude only CANCELLED and ON_HOLD (not ASSIGNED — it goes in OPEN column)
    const activeTasks = userFiltered.filter(t => !['CANCELLED', 'ON_HOLD'].includes(t.status));

    // Group by status — ASSIGNED maps to OPEN column
    const grouped: Record<string, any[]> = { OPEN: [], IN_PROGRESS: [], IN_REVIEW: [], COMPLETED: [] };
    activeTasks.forEach(t => {
        const colKey = t.status === 'ASSIGNED' ? 'OPEN' : t.status;
        if (grouped[colKey] !== undefined) grouped[colKey].push(t);
    });

    // Stats cards — role-specific
    const isAdmin = role === 'SUPER_ADMIN';
    const statCards = [
        { title: 'Active Projects', value: stats?.projects?.active ?? 0, sub: `${stats?.projects?.total ?? 0} total`, icon: <FolderOpen sx={{ fontSize: 32 }} />, color: '#667eea', bg: 'rgba(102,126,234,0.1)', path: '/projects' },
        { title: 'Open Tasks', value: stats?.tasks?.open ?? 0, sub: `${stats?.tasks?.total ?? 0} total tasks`, icon: <Assignment sx={{ fontSize: 32 }} />, color: '#0288d1', bg: 'rgba(2,136,209,0.1)', path: '/tasks' },
        { title: 'SLA Breached', value: stats?.tasks?.breached ?? 0, sub: 'Needs attention', icon: <Warning sx={{ fontSize: 32 }} />, color: '#d32f2f', bg: 'rgba(211,47,47,0.1)', path: '' },
        { title: 'Pending Approvals', value: (stats?.approvals?.pendingL1 ?? 0) + (stats?.approvals?.pendingL2 ?? 0), sub: `L1: ${stats?.approvals?.pendingL1 ?? 0} | L2: ${stats?.approvals?.pendingL2 ?? 0}`, icon: <TrendingUp sx={{ fontSize: 32 }} />, color: '#ed6c02', bg: 'rgba(237,108,2,0.1)', path: '/timesheets/l1-approval' },
        ...(isAdmin ? [
            { title: 'Total Users', value: stats?.users?.total ?? 0, sub: `${stats?.users?.active ?? 0} active`, icon: <People sx={{ fontSize: 32 }} />, color: '#764ba2', bg: 'rgba(118,75,162,0.1)', path: '/users' },
            { title: 'Total Clients', value: stats?.clients?.total ?? 0, sub: 'Clients managed', icon: <Business sx={{ fontSize: 32 }} />, color: '#2e7d32', bg: 'rgba(46,125,50,0.1)', path: '/clients' },
        ] : []),
    ];

    return (
        <Box>
            {/* Quick Actions */}
            <QuickActions role={role} router={router} />

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {statCards.map((c, i) => (
                    <Grid item xs={12} sm={6} md={isAdmin ? 2 : 3} key={i}>
                        <StatCard {...c} onClick={c.path ? () => router.push(c.path) : undefined} />
                    </Grid>
                ))}
            </Grid>

            {/* Kanban Board header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment sx={{ color: '#667eea' }} />
                    <Typography variant="h6" fontWeight={700}>
                        Task Board {role === 'PROJECT_MANAGER' ? '(Your Projects)' : '(All Projects)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {activeTasks.length} tasks
                    </Typography>
                </Box>

                {/* Filter chips + User dropdown */}
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FilterList fontSize="small" sx={{ color: 'text.secondary' }} />

                    {/* Priority filters */}
                    {(['ALL', 'URGENT', 'HIGH', 'BREACHED'] as const).map(f => (
                        <Chip
                            key={f}
                            label={f}
                            size="small"
                            onClick={() => setFilter(f)}
                            variant={filter === f ? 'filled' : 'outlined'}
                            color="default"
                            sx={{
                                fontWeight: filter === f ? 700 : 400,
                                bgcolor: filter === f ? (f === 'BREACHED' ? '#d32f2f' : '#667eea') : undefined,
                                color: filter === f ? '#fff' : undefined,
                                borderColor: f === 'BREACHED' ? '#d32f2f' : '#667eea',
                                cursor: 'pointer',
                            }}
                        />
                    ))}

                    {/* Divider */}
                    <Box sx={{ width: '1px', height: 22, bgcolor: '#e0e0e0', mx: 0.5 }} />

                    {/* Assignee / User filter */}
                    <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={userFilter}
                            onChange={e => setUserFilter(e.target.value as number | 'ALL')}
                            displayEmpty
                            renderValue={selected => {
                                if (selected === 'ALL') return (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        All Assignees
                                    </Typography>
                                );
                                const u: any = uniqueUsers.find((x: any) => x.id === selected);
                                return u ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        <Avatar sx={{ width: 18, height: 18, fontSize: 9, bgcolor: '#764ba2' }}>
                                            {u.firstName[0]}{u.lastName[0]}
                                        </Avatar>
                                        <Typography variant="caption">{u.firstName} {u.lastName}</Typography>
                                    </Box>
                                ) : 'All Assignees';
                            }}
                            sx={{
                                fontSize: 13,
                                height: 32,
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                            }}
                        >
                            <MenuItem value="ALL">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#9e9e9e' }}>
                                        <People sx={{ fontSize: 14 }} />
                                    </Avatar>
                                    <Typography variant="body2">All Assignees</Typography>
                                </Box>
                            </MenuItem>
                            {(uniqueUsers as any[]).map((u: any) => (
                                <MenuItem key={u.id} value={u.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#764ba2' }}>
                                            {u.firstName[0]}{u.lastName[0]}
                                        </Avatar>
                                        <Typography variant="body2">{u.firstName} {u.lastName}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <IconButton size="small" onClick={fetch} title="Refresh">
                        <Refresh fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* Kanban columns */}
            <Box sx={{
                display: 'flex', gap: 2, overflowX: 'auto', pb: 2,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3 },
            }}>
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.key}
                        col={col}
                        tasks={grouped[col.key]}
                        onTaskClick={t => router.push(`/tasks/${t.id}`)}
                        onDrop={(toCol) => {
                            if (draggingId !== null && draggingFromCol !== null) {
                                handleDrop(draggingId, draggingFromCol, toCol);
                            }
                        }}
                        onDragStart={(taskId, colKey) => {
                            setDraggingId(taskId);
                            setDraggingFromCol(colKey);
                        }}
                        onDragEnd={() => {
                            setDraggingId(null);
                            setDraggingFromCol(null);
                        }}
                        draggingId={draggingId}
                        draggingFromCol={draggingFromCol}
                    />
                ))}
            </Box>

            {/* Role-specific notice */}
            {role === 'PROJECT_MANAGER' && (
                <Alert severity="info" sx={{ mt: 2 }} icon={<Schedule />}>
                    You are viewing tasks from projects assigned to you. Contact a Super Admin to access other projects.
                </Alert>
            )}
        </Box>
    );
}

// ─── Finance Admin Dashboard ────────────────────────────────────────────────
function FinanceDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/dashboard/finance')
            .then(r => setData(r.data.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load finance data'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const cards = [
        { title: 'Pending L2 Approvals', value: data?.pendingApprovals ?? 0, sub: 'Monthly timesheets', icon: <CheckCircle sx={{ fontSize: 32 }} />, color: '#d32f2f', bg: 'rgba(211,47,47,0.1)' },
        { title: 'Approved Payroll Hrs', value: `${Number(data?.approvedPayrollHours ?? 0).toFixed(0)}h`, sub: 'Month-to-date', icon: <AccessTime sx={{ fontSize: 32 }} />, color: '#2e7d32', bg: 'rgba(46,125,50,0.1)' },
        { title: 'Billable Hours', value: `${Number(data?.billableHours ?? 0).toFixed(0)}h`, sub: 'Month-to-date', icon: <TrendingUp sx={{ fontSize: 32 }} />, color: '#0288d1', bg: 'rgba(2,136,209,0.1)' },
        { title: 'Active Project Budget', value: `₹${Number(data?.activeProjectBudget ?? 0).toLocaleString('en-IN')}`, sub: 'All active projects', icon: <Business sx={{ fontSize: 32 }} />, color: '#764ba2', bg: 'rgba(118,75,162,0.1)' },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button variant="outlined" size="small" startIcon={<CheckCircle fontSize="small" />}
                    onClick={() => router.push('/timesheets/l2-approval')}
                    sx={{ borderRadius: 6, color: '#667eea', borderColor: '#667eea' }}>
                    L2 Approval
                </Button>
            </Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {cards.map((c, i) => <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...c} /></Grid>)}
            </Grid>

            {data?.monthlyTimesheets?.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} mb={2}>Monthly Timesheet Summary</Typography>
                        {data.monthlyTimesheets.slice(0, 8).map((ts: any) => (
                            <Box key={ts.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                                <Typography variant="body2">{ts.user?.firstName} {ts.user?.lastName}</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography variant="body2">{Number(ts.totalHours).toFixed(1)}h</Typography>
                                    <Chip label={ts.status.replace(/_/g, ' ')} size="small"
                                        color={ts.status === 'L2_APPROVED' ? 'success' : ts.status === 'SUBMITTED' ? 'warning' : 'default'} />
                                </Box>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

// ─── Employee Dashboard ───────────────────────────────────────────────────
function UserDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/dashboard/employee')
            .then(r => setData(r.data.data))
            .catch(() => null)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    const cards = [
        { title: 'Hours This Month', value: `${Number(data?.stats?.thisMonthHours ?? 0).toFixed(0)}h`, sub: 'Logged this month', icon: <AccessTime sx={{ fontSize: 32 }} />, color: '#667eea', bg: 'rgba(102,126,234,0.1)' },
        { title: 'Hours This Week', value: `${Number(data?.stats?.thisWeekHours ?? 0).toFixed(0)}h`, sub: 'Logged this week', icon: <Schedule sx={{ fontSize: 32 }} />, color: '#2e7d32', bg: 'rgba(46,125,50,0.1)' },
        { title: 'Pending Approvals', value: data?.stats?.pendingApprovals ?? 0, sub: 'Timesheets pending', icon: <TrendingUp sx={{ fontSize: 32 }} />, color: '#ed6c02', bg: 'rgba(237,108,2,0.1)' },
        { title: 'My Tasks', value: data?.recentTasks?.length ?? 0, sub: 'Recent tasks', icon: <Assignment sx={{ fontSize: 32 }} />, color: '#0288d1', bg: 'rgba(2,136,209,0.1)' },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button variant="outlined" size="small" startIcon={<Add fontSize="small" />}
                    onClick={() => router.push('/timelogs')}
                    sx={{ borderRadius: 6, color: '#667eea', borderColor: '#667eea' }}>Log Time</Button>
                <Button variant="outlined" size="small" startIcon={<Assignment fontSize="small" />}
                    onClick={() => router.push('/tasks')}
                    sx={{ borderRadius: 6, color: '#667eea', borderColor: '#667eea' }}>My Tasks</Button>
            </Box>
            <Grid container spacing={2}>
                {cards.map((c, i) => <Grid item xs={12} sm={6} md={3} key={i}><StatCard {...c} /></Grid>)}
            </Grid>
        </Box>
    );
}

// ─── Root page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    useAuth(true);
    const { user, hydrated } = useAppSelector((s: any) => s.auth);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const ready = isMounted && hydrated;
    const role = user?.role ?? '';
    const isAdminOrPM = ready && ['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(role);
    const isFinance = ready && role === 'FINANCE_ADMIN';

    const greeting = !ready ? 'Dashboard'
        : isAdminOrPM ? (role === 'SUPER_ADMIN' ? 'Admin Dashboard' : 'Project Manager Dashboard')
            : isFinance ? 'Finance Dashboard'
                : 'My Dashboard';

    const welcome = !ready ? ''
        : isAdminOrPM ? (role === 'SUPER_ADMIN' ? "Full system overview with task Kanban board." : "Your assigned projects and task Kanban board.")
            : isFinance ? "Finance and payroll overview."
                : "Your work summary and recent tasks.";

    return (
        <DashboardLayout>
            <Box>
                {ready ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" fontWeight="bold">{greeting}</Typography>
                        <Chip
                            label={role.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                                bgcolor: isAdminOrPM ? 'rgba(102,126,234,0.15)' : isFinance ? 'rgba(46,125,50,0.15)' : 'rgba(2,136,209,0.1)',
                                color: isAdminOrPM ? '#667eea' : isFinance ? '#2e7d32' : '#0288d1',
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                ) : (
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Dashboard</Typography>
                )}

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {ready ? `Welcome back, ${user?.firstName}! ${welcome}` : 'Loading...'}
                </Typography>

                {isMounted && !hydrated && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
                )}

                {ready && (
                    isAdminOrPM
                        ? <KanbanDashboard role={role} />
                        : isFinance
                            ? <FinanceDashboard />
                            : <UserDashboard />
                )}
            </Box>
        </DashboardLayout>
    );
}
