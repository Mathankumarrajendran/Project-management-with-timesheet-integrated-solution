'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
    CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
    TextField, IconButton, Tooltip, Collapse, Pagination, Button,
} from '@mui/material';
import {
    Security, FilterList, Refresh, ExpandMore, ExpandLess,
    Create, Edit, Delete, Person,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/apiClient';

const ACTION_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    CREATE: 'success', UPDATE: 'warning', DELETE: 'error',
    DUE_DATE_OVERRIDE: 'warning', STATUS_CHANGE: 'default',
};

const ACTION_ICON: Record<string, React.ReactElement> = {
    CREATE: <Create fontSize="small" />,
    UPDATE: <Edit fontSize="small" />,
    DELETE: <Delete fontSize="small" />,
};

function ChangesRow({ changes }: { changes: any }) {
    const [open, setOpen] = useState(false);
    if (!changes) return <Typography variant="caption" color="text.secondary">—</Typography>;
    let displayStr = '';
    try {
        displayStr = typeof changes === 'string' ? changes : JSON.stringify(changes, null, 2);
    } catch {
        displayStr = String(changes);
    }
    const preview = displayStr.length > 60 ? displayStr.slice(0, 60) + '…' : displayStr;
    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" fontFamily="monospace" color="text.secondary"
                    sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {preview}
                </Typography>
                {displayStr.length > 60 && (
                    <IconButton size="small" onClick={() => setOpen(p => !p)}>
                        {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                )}
            </Box>
            <Collapse in={open}>
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1, mt: 0.5, maxWidth: 340 }}>
                    <Typography variant="caption" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {displayStr}
                    </Typography>
                </Box>
            </Collapse>
        </Box>
    );
}

export default function AuditLogsPage() {
    useAuth(true);
    const { user } = useAppSelector((s: any) => s.auth);
    const [logs, setLogs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [entity, setEntity] = useState('');
    const [action, setAction] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page: String(page), limit: '25' });
            if (entity) params.set('entity', entity);
            if (action) params.set('action', action);
            const res = await apiClient.get(`/audit-logs?${params}`);
            const data = res.data.data;
            setLogs(data.logs ?? []);
            setTotal(data.total ?? 0);
            setPages(data.pages ?? 1);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [entity, action, page]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // Client-side search on user name
    const filtered = search.trim()
        ? logs.filter(l =>
            `${l.user?.firstName} ${l.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            l.entity.toLowerCase().includes(search.toLowerCase())
        )
        : logs;

    const isAdmin = user?.role === 'SUPER_ADMIN';

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Security sx={{ color: '#667eea', fontSize: 32 }} />
                    <Box>
                        <Typography variant="h4" fontWeight={700}>Audit Logs</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {total} total records — system activity trail
                        </Typography>
                    </Box>
                    <Box flex={1} />
                    <Button
                        variant="outlined" size="small" startIcon={<Refresh />}
                        onClick={fetchLogs}
                        sx={{ borderRadius: 6, borderColor: '#667eea', color: '#667eea' }}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Filter bar */}
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FilterList sx={{ color: 'text.secondary' }} />

                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Entity Type</InputLabel>
                                <Select value={entity} label="Entity Type" onChange={e => { setEntity(e.target.value); setPage(1); }}>
                                    <MenuItem value="">All</MenuItem>
                                    {['Task', 'Project', 'User', 'Sprint', 'TimeLog', 'Client'].map(e => (
                                        <MenuItem key={e} value={e}>{e}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>Action</InputLabel>
                                <Select value={action} label="Action" onChange={e => { setAction(e.target.value); setPage(1); }}>
                                    <MenuItem value="">All</MenuItem>
                                    {['CREATE', 'UPDATE', 'DELETE', 'DUE_DATE_OVERRIDE', 'STATUS_CHANGE'].map(a => (
                                        <MenuItem key={a} value={a}>{a.replace(/_/g, ' ')}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                size="small"
                                placeholder="Search by user or entity…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                sx={{ minWidth: 220 }}
                            />

                            {(entity || action || search) && (
                                <Button
                                    size="small" variant="text"
                                    onClick={() => { setEntity(''); setAction(''); setSearch(''); setPage(1); }}
                                    sx={{ color: '#d32f2f' }}
                                >
                                    Clear
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Entity ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Changes</TableCell>
                                        {isAdmin && <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                No audit logs found
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map(log => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(log.createdAt).toLocaleString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: '#667eea' }}>
                                                        {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                                            {log.user?.firstName} {log.user?.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {log.user?.role?.replace(/_/g, ' ')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.action.replace(/_/g, ' ')}
                                                    size="small"
                                                    color={ACTION_COLOR[log.action] ?? 'default'}
                                                    icon={ACTION_ICON[log.action]}
                                                    sx={{ fontWeight: 600, fontSize: 11 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.entity}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: 11, borderColor: '#667eea', color: '#667eea' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" fontFamily="monospace">
                                                    #{log.entityId}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <ChangesRow changes={log.changes} />
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                        {log.ipAddress ?? '—'}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={pages}
                                page={page}
                                onChange={(_, p) => setPage(p)}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    </>
                )}
            </Box>
        </DashboardLayout>
    );
}
