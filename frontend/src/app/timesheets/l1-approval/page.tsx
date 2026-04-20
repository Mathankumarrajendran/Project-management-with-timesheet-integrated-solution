'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, CircularProgress, Alert, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse,
    IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, Tooltip, Paper,
} from '@mui/material';
import { ExpandMore, ExpandLess, CheckCircle, Cancel, HowToVote } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

const statusColor = (s: string): any => ({
    SUBMITTED: 'warning', L1_APPROVED: 'success', L1_REJECTED: 'error',
}[s] ?? 'default');

function ApprovalRow({ sheet, onAction }: { sheet: any; onAction: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    const handleApprove = async () => {
        setLoading(true);
        setError('');
        try {
            await apiClient.post(`/timesheets/weekly/${sheet.id}/approve-l1`, { remarks: '' });
            onAction();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        setError('');
        try {
            await apiClient.post(`/timesheets/weekly/${sheet.id}/reject-l1`, { remarks });
            setRejectDialog(false);
            setRemarks('');
            onAction();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const u = sheet.user;
    return (
        <>
            <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea', fontSize: 13 }}>
                            {u.firstName[0]}{u.lastName[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{u.firstName} {u.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{u.employeeId} · {u.email}</Typography>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>
                    {new Date(sheet.weekStartDate).toLocaleDateString()} — {new Date(sheet.weekEndDate).toLocaleDateString()}
                </TableCell>
                <TableCell align="right"><strong>{Number(sheet.totalHours).toFixed(1)} hrs</strong></TableCell>
                <TableCell align="right">{Number(sheet.billableHours).toFixed(1)} hrs</TableCell>
                <TableCell>
                    <Chip label={sheet.status.replace(/_/g, ' ')} size="small" color={statusColor(sheet.status)} />
                </TableCell>
                <TableCell>
                    {sheet.status === 'SUBMITTED' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Approve L1">
                                <IconButton size="small" color="success" onClick={handleApprove} disabled={loading}>
                                    <CheckCircle />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject L1">
                                <IconButton size="small" color="error" onClick={() => setRejectDialog(true)} disabled={loading}>
                                    <Cancel />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </TableCell>
            </TableRow>
            {error && (
                <TableRow>
                    <TableCell colSpan={7}><Alert severity="error" sx={{ py: 0 }}>{error}</Alert></TableCell>
                </TableRow>
            )}
            <TableRow>
                <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Collapse in={open} timeout="auto">
                        <Box sx={{ px: 4, py: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                TIME ENTRIES ({sheet.timeLogs?.length ?? 0})
                            </Typography>
                            <Table size="small" sx={{ mt: 1 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Project</TableCell>
                                        <TableCell>Task</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Hours</TableCell>
                                        <TableCell>Billable</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(sheet.timeLogs ?? []).map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{log.project?.code} — {log.project?.name}</TableCell>
                                            <TableCell>{log.task?.code}</TableCell>
                                            <TableCell sx={{ maxWidth: 220 }}>{log.description}</TableCell>
                                            <TableCell align="right">{Number(log.hours).toFixed(1)}</TableCell>
                                            <TableCell>
                                                <Chip label={log.billable ? 'Yes' : 'No'} size="small" color={log.billable ? 'success' : 'default'} variant="outlined" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

            {/* Reject dialog */}
            <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Reject Timesheet</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Provide a reason for rejection. The employee will be notified and can resubmit after making corrections.
                    </Typography>
                    <TextField
                        fullWidth multiline rows={3}
                        label="Rejection Reason"
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleReject} disabled={!remarks || loading}>
                        {loading ? <CircularProgress size={18} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default function L1ApprovalPage() {
    useAuth(true);
    const { user, hydrated } = useAppSelector((state: any) => state.auth);
    const router = useRouter();
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hydrated && user && !['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
            router.push('/dashboard');
        }
    }, [hydrated, user, router]);

    const fetchSheets = () => {
        setLoading(true);
        apiClient.get('/timesheets/weekly/pending-l1')
            .then(r => setSheets(r.data.data ?? []))
            .catch(e => setError(e.response?.data?.message || 'Failed'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSheets(); }, []);

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <HowToVote sx={{ fontSize: 32, color: '#667eea' }} />
                    <Typography variant="h4" fontWeight="bold">L1 Approval — Weekly Timesheets</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Review and approve or reject weekly timesheet submissions.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

                {!loading && sheets.length === 0 && (
                    <Alert severity="success">🎉 No timesheets pending L1 approval!</Alert>
                )}

                {!loading && sheets.length > 0 && (
                    <Card>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {sheets.length} timesheet{sheets.length !== 1 ? 's' : ''} pending approval
                                </Typography>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell width={40} />
                                            <TableCell><b>Employee</b></TableCell>
                                            <TableCell><b>Week</b></TableCell>
                                            <TableCell align="right"><b>Total Hrs</b></TableCell>
                                            <TableCell align="right"><b>Billable Hrs</b></TableCell>
                                            <TableCell><b>Status</b></TableCell>
                                            <TableCell><b>Actions</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sheets.map(sheet => (
                                            <ApprovalRow key={sheet.id} sheet={sheet} onAction={fetchSheets} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </DashboardLayout>
    );
}
