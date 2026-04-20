'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, CircularProgress, Alert, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Tooltip,
    Grid, Divider, IconButton,
} from '@mui/material';
import { CheckCircle, Cancel, AccountBalance, Refresh } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusColor = (s: string): any => ({
    DRAFT: 'default', SUBMITTED: 'warning', L1_APPROVED: 'info',
    L2_APPROVED: 'success', L2_REJECTED: 'error', LOCKED: 'default',
}[s] ?? 'default');

// ─── Compile Monthly Timesheet Dialog ─────────────────────────────────────────
function CompileDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
    const [users, setUsers] = useState<any[]>([]);
    const [userId, setUserId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (open) {
            apiClient.get('/users?limit=100').then(r => setUsers(r.data.data.users ?? []));
            setError(''); setSuccess('');
        }
    }, [open]);

    const handleCompile = async () => {
        setLoading(true); setError(''); setSuccess('');
        try {
            const r = await apiClient.post('/timesheets/monthly/compile', {
                userId: parseInt(userId), year: parseInt(year), month: parseInt(month),
            });
            setSuccess(r.data.message);
            onDone();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Compilation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Compile Monthly Timesheet</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This gathers all L1-approved weekly timesheets for the selected employee and month, and submits them for L2 approval.
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField select fullWidth label="Employee" size="small" value={userId} onChange={e => setUserId(e.target.value)}>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.employeeId})</option>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField select fullWidth label="Month" size="small" value={month} onChange={e => setMonth(e.target.value)}>
                            {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Year" size="small" type="number"
                            value={year} onChange={e => setYear(e.target.value)} inputProps={{ min: 2020, max: 2030 }} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleCompile} disabled={!userId || loading}
                    sx={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                    {loading ? <CircularProgress size={18} color="inherit" /> : 'Compile & Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── L2 Action Row ────────────────────────────────────────────────────────────
function L2Row({ sheet, onAction }: { sheet: any; onAction: () => void }) {
    const [loading, setLoading] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    const handleApprove = async () => {
        setLoading(true); setError('');
        try {
            await apiClient.post(`/timesheets/monthly/${sheet.id}/approve-l2`, { remarks: '' });
            onAction();
        } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    const handleReject = async () => {
        setLoading(true); setError('');
        try {
            await apiClient.post(`/timesheets/monthly/${sheet.id}/reject-l2`, { remarks });
            setRejectDialog(false); setRemarks(''); onAction();
        } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    const u = sheet.user;
    return (
        <>
            <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#764ba2', fontSize: 13 }}>
                            {u.firstName[0]}{u.lastName[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{u.firstName} {u.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{u.employeeId}</Typography>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{MONTH_NAMES[sheet.month - 1]} {sheet.year}</TableCell>
                <TableCell align="right"><strong>{Number(sheet.totalHours).toFixed(1)} hrs</strong></TableCell>
                <TableCell align="right">{Number(sheet.billableHours).toFixed(1)} hrs</TableCell>
                <TableCell align="right">{Number(sheet.utilization).toFixed(1)}%</TableCell>
                <TableCell>
                    <Chip label={sheet.status.replace(/_/g, ' ')} size="small" color={statusColor(sheet.status)} />
                </TableCell>
                <TableCell>
                    {sheet.status === 'SUBMITTED' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="L2 Approve — Lock for Payroll">
                                <IconButton size="small" color="success" onClick={handleApprove} disabled={loading}>
                                    <CheckCircle />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="L2 Reject">
                                <IconButton size="small" color="error" onClick={() => setRejectDialog(true)} disabled={loading}>
                                    <Cancel />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    {sheet.status === 'L2_APPROVED' && (
                        <Chip label="Locked for Payroll" size="small" color="success" variant="outlined" />
                    )}
                </TableCell>
            </TableRow>
            {error && (
                <TableRow><TableCell colSpan={7}><Alert severity="error" sx={{ py: 0 }}>{error}</Alert></TableCell></TableRow>
            )}
            <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>L2 Reject Monthly Timesheet</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Provide a reason for rejection. The monthly timesheet will be returned for recompilation.
                    </Typography>
                    <TextField fullWidth multiline rows={3} label="Rejection Reason" value={remarks} onChange={e => setRemarks(e.target.value)} required />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function L2ApprovalPage() {
    useAuth(true);
    const { user, hydrated } = useAppSelector((state: any) => state.auth);
    const router = useRouter();
    const [pending, setPending] = useState<any[]>([]);
    const [all, setAll] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [compileOpen, setCompileOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hydrated && user && !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
            router.push('/dashboard');
        }
    }, [hydrated, user, router]);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([
            apiClient.get('/timesheets/monthly/pending-l2'),
            apiClient.get('/timesheets/monthly/all'),
        ])
            .then(([p, a]) => { setPending(p.data.data ?? []); setAll(a.data.data ?? []); })
            .catch(e => setError(e.response?.data?.message || 'Failed'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const approved = all.filter(s => s.status === 'L2_APPROVED');

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccountBalance sx={{ fontSize: 32, color: '#667eea' }} />
                        <Typography variant="h4" fontWeight="bold">L2 Approval — Monthly Timesheets</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button startIcon={<Refresh />} onClick={fetchAll} variant="outlined" size="small">Refresh</Button>
                        <Button
                            variant="contained"
                            onClick={() => setCompileOpen(true)}
                            sx={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
                        >
                            Compile Monthly
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    L2 approval locks timesheets for payroll processing.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

                {/* Pending L2 */}
                {!loading && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ pb: 0 }}>
                            <Typography variant="h6" fontWeight={600}>
                                Pending L2 Approval ({pending.length})
                            </Typography>
                        </CardContent>
                        {pending.length === 0 ? (
                            <Box sx={{ px: 2, pb: 2 }}><Alert severity="success">No pending L2 approvals 🎉</Alert></Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><b>Employee</b></TableCell>
                                            <TableCell><b>Month</b></TableCell>
                                            <TableCell align="right"><b>Total Hrs</b></TableCell>
                                            <TableCell align="right"><b>Billable Hrs</b></TableCell>
                                            <TableCell align="right"><b>Utilization</b></TableCell>
                                            <TableCell><b>Status</b></TableCell>
                                            <TableCell><b>Actions</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pending.map(s => <L2Row key={s.id} sheet={s} onAction={fetchAll} />)}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Card>
                )}

                {/* Payroll History */}
                {!loading && approved.length > 0 && (
                    <Card>
                        <CardContent sx={{ pb: 0 }}>
                            <Typography variant="h6" fontWeight={600}>Approved / Payroll History ({approved.length})</Typography>
                        </CardContent>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><b>Employee</b></TableCell>
                                        <TableCell><b>Month</b></TableCell>
                                        <TableCell align="right"><b>Total Hrs</b></TableCell>
                                        <TableCell align="right"><b>Billable Hrs</b></TableCell>
                                        <TableCell><b>Status</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {approved.map((s: any) => (
                                        <TableRow key={s.id} hover>
                                            <TableCell>{s.user.firstName} {s.user.lastName}</TableCell>
                                            <TableCell>{MONTH_NAMES[s.month - 1]} {s.year}</TableCell>
                                            <TableCell align="right">{Number(s.totalHours).toFixed(1)}</TableCell>
                                            <TableCell align="right">{Number(s.billableHours).toFixed(1)}</TableCell>
                                            <TableCell><Chip label="Locked / Payroll" size="small" color="success" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}

                <CompileDialog open={compileOpen} onClose={() => setCompileOpen(false)} onDone={fetchAll} />
            </Box>
        </DashboardLayout>
    );
}
