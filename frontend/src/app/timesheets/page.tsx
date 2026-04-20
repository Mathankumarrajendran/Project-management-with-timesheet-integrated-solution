'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Button, CircularProgress, Alert,
    Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Collapse, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Tooltip, Stack,
} from '@mui/material';
import {
    ExpandMore, ExpandLess, Send, AccessTime, CheckCircle, Schedule,
    CalendarMonth, ErrorOutline, AllInclusive,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';

const STATUS_MAP: Record<string, { label: string; color: any; icon: React.ReactNode }> = {
    DRAFT: { label: 'Draft', color: 'default', icon: <Schedule fontSize="small" /> },
    SUBMITTED: { label: 'Submitted', color: 'warning', icon: <Send fontSize="small" /> },
    L1_APPROVED: { label: 'L1 Approved', color: 'info', icon: <CheckCircle fontSize="small" /> },
    L1_REJECTED: { label: 'L1 Rejected', color: 'error', icon: <ErrorOutline fontSize="small" /> },
    L2_APPROVED: { label: 'L2 Approved / Locked', color: 'success', icon: <CheckCircle fontSize="small" /> },
    L2_REJECTED: { label: 'L2 Rejected', color: 'error', icon: <ErrorOutline fontSize="small" /> },
    LOCKED: { label: 'Locked', color: 'default', icon: <CheckCircle fontSize="small" /> },
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Confirm Submit Dialog ─────────────────────────────────────────────────────
function SubmitConfirmDialog({
    sheet, open, onClose, onConfirm, loading,
}: {
    sheet: any; open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
    if (!sheet) return null;
    const logs = sheet.timeLogs ?? [];
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Send />
                    <Typography variant="h6" fontWeight={700}>Submit Weekly Timesheet for L1 Approval</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {/* Week summary banner */}
                <Box sx={{ bgcolor: '#f0f4ff', borderRadius: 2, p: 2, mb: 2, display: 'flex', gap: 4 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Week</Typography>
                        <Typography fontWeight={700}>{fmt(sheet.weekStartDate)} – {fmt(sheet.weekEndDate)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                        <Typography fontWeight={700}>{Number(sheet.totalHours).toFixed(1)} hrs</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Billable Hours</Typography>
                        <Typography fontWeight={700}>{Number(sheet.billableHours).toFixed(1)} hrs</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Entries</Typography>
                        <Typography fontWeight={700}>{logs.length}</Typography>
                    </Box>
                </Box>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    All {logs.length} time entries below will be submitted together:
                </Typography>

                <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell><b>Date</b></TableCell>
                                <TableCell><b>Project</b></TableCell>
                                <TableCell><b>Task</b></TableCell>
                                <TableCell><b>Description</b></TableCell>
                                <TableCell align="right"><b>Hours</b></TableCell>
                                <TableCell><b>Billable</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</TableCell>
                                    <TableCell>{log.project?.name ?? log.project?.code ?? '—'}</TableCell>
                                    <TableCell>{log.task?.code ?? '—'}</TableCell>
                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.description}
                                    </TableCell>
                                    <TableCell align="right"><b>{Number(log.hours).toFixed(1)}</b></TableCell>
                                    <TableCell>
                                        <Chip label={log.billable ? 'Yes' : 'No'} size="small"
                                            color={log.billable ? 'success' : 'default'} variant="outlined" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Alert severity="info" sx={{ mt: 2 }}>
                    Once submitted, your timesheet will be locked for editing until it is reviewed by your Manager.
                </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading || logs.length === 0}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                    sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                >
                    {loading ? 'Submitting…' : `Submit ${logs.length} Entries for L1 Approval`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Single week row ───────────────────────────────────────────────────────────
function WeekRow({ sheet, onSubmit }: { sheet: any; onSubmit: () => void }) {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const canSubmit = sheet.status === 'DRAFT' || sheet.status === 'L1_REJECTED';
    const s = STATUS_MAP[sheet.status] ?? { label: sheet.status, color: 'default', icon: null };

    const doSubmit = async () => {
        setSubmitting(true); setError('');
        try {
            await apiClient.post(`/timesheets/weekly/${sheet.id}/submit`);
            setConfirmOpen(false);
            onSubmit();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to submit');
        } finally { setSubmitting(false); }
    };

    return (
        <>
            <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' }, bgcolor: sheet.status === 'L1_REJECTED' ? '#fff5f5' : undefined }}>
                {/* Expand */}
                <TableCell padding="checkbox">
                    <Tooltip title={open ? 'Hide entries' : `View ${sheet.timeLogs?.length ?? 0} entries`}>
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Tooltip>
                </TableCell>

                {/* Week range */}
                <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                        {fmt(sheet.weekStartDate)} – {fmt(sheet.weekEndDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {sheet.timeLogs?.length ?? 0} entries
                    </Typography>
                </TableCell>

                {/* Hours */}
                <TableCell align="right">
                    <Typography fontWeight={700}>{Number(sheet.totalHours).toFixed(1)}</Typography>
                    <Typography variant="caption" color="text.secondary">total hrs</Typography>
                </TableCell>
                <TableCell align="right">
                    <Typography>{Number(sheet.billableHours).toFixed(1)}</Typography>
                    <Typography variant="caption" color="text.secondary">billable</Typography>
                </TableCell>

                {/* Status */}
                <TableCell>
                    <Chip icon={s.icon as any} label={s.label} size="small" color={s.color} />
                </TableCell>

                {/* Rejection reason */}
                <TableCell>
                    {sheet.status === 'L1_REJECTED' && sheet.l1RejectionReason && (
                        <Typography variant="caption" color="error.main" fontStyle="italic">
                            "{sheet.l1RejectionReason}"
                        </Typography>
                    )}
                </TableCell>

                {/* Action */}
                <TableCell align="right">
                    {canSubmit ? (
                        <Button
                            size="small" variant="contained"
                            startIcon={<Send fontSize="small" />}
                            onClick={() => setConfirmOpen(true)}
                            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', fontSize: 12, textTransform: 'none' }}
                        >
                            Submit Week
                        </Button>
                    ) : null}
                </TableCell>
            </TableRow>

            {/* Error row */}
            {error && (
                <TableRow>
                    <TableCell colSpan={7}><Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert></TableCell>
                </TableRow>
            )}

            {/* Expanded time entries */}
            <TableRow>
                <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 5, py: 2, bgcolor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                                TIME ENTRIES ({sheet.timeLogs?.length ?? 0}) — these are submitted together as one weekly timesheet
                            </Typography>
                            {(sheet.timeLogs ?? []).length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No time entries yet.</Typography>
                            ) : (
                                <Table size="small">
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
                                        {sheet.timeLogs.map((log: any) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</TableCell>
                                                <TableCell>{log.project?.name ?? log.project?.code ?? '—'}</TableCell>
                                                <TableCell>{log.task?.code ?? '—'}</TableCell>
                                                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.description}
                                                </TableCell>
                                                <TableCell align="right"><b>{Number(log.hours).toFixed(1)}</b></TableCell>
                                                <TableCell>
                                                    <Chip label={log.billable ? 'Billable' : 'Non-Billable'} size="small"
                                                        color={log.billable ? 'success' : 'default'} variant="outlined" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

            {/* Confirm submit dialog */}
            <SubmitConfirmDialog
                sheet={confirmOpen ? sheet : null}
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={doSubmit}
                loading={submitting}
            />
        </>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyTimesheetsPage() {
    useAuth(true);
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitAllLoading, setSubmitAllLoading] = useState(false);
    const [submitAllResult, setSubmitAllResult] = useState<{ success: number; failed: number } | null>(null);

    const fetchSheets = async () => {
        setLoading(true);
        apiClient.get('/timesheets/weekly/my')
            .then(r => setSheets(r.data.data ?? []))
            .catch(e => setError(e.response?.data?.message || 'Failed to load'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSheets(); }, []);

    const draftSheets = sheets.filter(s => s.status === 'DRAFT' || s.status === 'L1_REJECTED');

    // Submit ALL draft/rejected sheets one by one
    const handleSubmitAll = async () => {
        setSubmitAllLoading(true);
        setSubmitAllResult(null);
        let success = 0, failed = 0;
        for (const s of draftSheets) {
            if (!s.totalHours || Number(s.totalHours) <= 0) { failed++; continue; }
            try {
                await apiClient.post(`/timesheets/weekly/${s.id}/submit`);
                success++;
            } catch { failed++; }
        }
        setSubmitAllResult({ success, failed });
        setSubmitAllLoading(false);
        fetchSheets();
    };

    // Group by month
    const byMonth: Record<string, any[]> = {};
    sheets.forEach(s => {
        const d = new Date(s.weekStartDate);
        const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        (byMonth[key] = byMonth[key] || []).push(s);
    });

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccessTime sx={{ fontSize: 36, color: '#667eea' }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">My Timesheets</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Each row is one week's time logs — review all entries and submit the whole week to L1 approval.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Submit All Pending button */}
                    {draftSheets.length > 0 && (
                        <Tooltip title={`Submit ${draftSheets.length} pending week(s) all at once`}>
                            <Button
                                variant="contained"
                                startIcon={submitAllLoading
                                    ? <CircularProgress size={16} color="inherit" />
                                    : <AllInclusive />}
                                disabled={submitAllLoading}
                                onClick={handleSubmitAll}
                                sx={{
                                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                                    color: '#1a1a2e',
                                    fontWeight: 700,
                                    '&:hover': { opacity: 0.9 },
                                }}
                            >
                                Submit All ({draftSheets.length}) Pending Weeks
                            </Button>
                        </Tooltip>
                    )}
                </Box>

                {/* Submit All result */}
                {submitAllResult && (
                    <Alert
                        severity={submitAllResult.failed > 0 ? 'warning' : 'success'}
                        onClose={() => setSubmitAllResult(null)}
                        sx={{ mb: 2 }}
                    >
                        {submitAllResult.success > 0 && `${submitAllResult.success} week(s) submitted successfully. `}
                        {submitAllResult.failed > 0 && `${submitAllResult.failed} week(s) skipped (empty or error).`}
                    </Alert>
                )}

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

                {!loading && Object.keys(byMonth).length === 0 && (
                    <Alert severity="info">
                        No timesheets yet. Start logging time to see your weekly timesheets here.
                    </Alert>
                )}

                {!loading && Object.entries(byMonth).map(([month, monthSheets]) => {
                    const total = monthSheets.reduce((s, ws) => s + Number(ws.totalHours), 0);
                    const pending = monthSheets.filter(s => s.status === 'DRAFT' || s.status === 'L1_REJECTED').length;

                    return (
                        <Card key={month} sx={{ mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ pb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CalendarMonth sx={{ color: '#667eea' }} />
                                    <Typography variant="h6" fontWeight={700}>{month}</Typography>
                                    <Chip label={`${total.toFixed(1)} hrs total`} size="small" variant="outlined" />
                                    {pending > 0 && (
                                        <Chip label={`${pending} pending submission`} size="small" color="warning" />
                                    )}
                                </Box>
                            </CardContent>
                            <Divider />
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8f9ff' }}>
                                            <TableCell width={40} />
                                            <TableCell><b>Week</b></TableCell>
                                            <TableCell align="right"><b>Total Hrs</b></TableCell>
                                            <TableCell align="right"><b>Billable Hrs</b></TableCell>
                                            <TableCell><b>Status</b></TableCell>
                                            <TableCell><b>Remarks</b></TableCell>
                                            <TableCell align="right"><b>Action</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {monthSheets.map(sheet => (
                                            <WeekRow key={sheet.id} sheet={sheet} onSubmit={fetchSheets} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    );
                })}
            </Box>
        </DashboardLayout>
    );
}
