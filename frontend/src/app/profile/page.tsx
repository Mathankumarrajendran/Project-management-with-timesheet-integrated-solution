'use client';

import { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Avatar, Grid,
    Divider, Alert, CircularProgress, Chip, IconButton, InputAdornment, Tooltip,
} from '@mui/material';
import {
    Person, Email, Badge, Lock, Visibility, VisibilityOff, Save,
    Edit, CheckCircle, AccessTime, Phone,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/apiClient';

const ROLE_COLOR: Record<string, string> = {
    SUPER_ADMIN: '#667eea',
    PROJECT_MANAGER: '#764ba2',
    FINANCE_ADMIN: '#2e7d32',
    TEAM_LEAD: '#0288d1',
    EMPLOYEE: '#ed6c02',
    CLIENT: '#616161',
    AUDITOR: '#795548',
};

export default function ProfilePage() {
    useAuth(true);
    const { user: authUser } = useAppSelector((s: any) => s.auth);

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editMode, setEditMode] = useState(false);

    // Edit form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // Password form
    const [curPwd, setCurPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confPwd, setConfPwd] = useState('');
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [changingPwd, setChangingPwd] = useState(false);

    // Stats (optional — only for EMPLOYEE/TEAM_LEAD roles)
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Use GET /auth/profile — works for all roles, no user ID needed
        const fetchProfile = apiClient.get('/auth/profile');

        // Stats — only try for employee-like roles, swallow errors for others
        const fetchStats = authUser?.role && ['EMPLOYEE', 'TEAM_LEAD'].includes(authUser.role)
            ? apiClient.get('/dashboard/employee').catch(() => null)
            : Promise.resolve(null);

        Promise.all([fetchProfile, fetchStats])
            .then(([pr, sr]) => {
                const p = pr.data.data;
                setProfile(p);
                setFirstName(p.firstName ?? '');
                setLastName(p.lastName ?? '');
                setPhone(p.phone ?? '');
                if (sr) setStats(sr?.data?.data?.stats ?? null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [authUser?.role]);

    const handleSave = async () => {
        setSaving(true); setMsg(null);
        try {
            // PUT /users/profile — the dedicated "update own profile" endpoint
            const res = await apiClient.put('/users/profile', {
                firstName,
                lastName,
                phone: phone || null,
            });
            const updated = res.data.data;
            setProfile((p: any) => ({ ...p, ...updated }));
            setMsg({ type: 'success', text: 'Profile updated successfully.' });
            setEditMode(false);
        } catch (e: any) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Update failed.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFirstName(profile?.firstName ?? '');
        setLastName(profile?.lastName ?? '');
        setPhone(profile?.phone ?? '');
        setMsg(null);
        setEditMode(false);
    };

    const handleChangePassword = async () => {
        if (!curPwd) { setPwdMsg({ type: 'error', text: 'Please enter your current password.' }); return; }
        if (newPwd !== confPwd) { setPwdMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
        if (newPwd.length < 8) { setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return; }

        setChangingPwd(true); setPwdMsg(null);
        try {
            // PUT /auth/update-password — correct backend route
            await apiClient.put('/auth/update-password', { currentPassword: curPwd, newPassword: newPwd });
            setPwdMsg({ type: 'success', text: 'Password updated successfully.' });
            setCurPwd(''); setNewPwd(''); setConfPwd('');
        } catch (e: any) {
            setPwdMsg({ type: 'error', text: e.response?.data?.message || 'Password change failed.' });
        } finally {
            setChangingPwd(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    const initials = `${profile?.firstName?.charAt(0) ?? ''}${profile?.lastName?.charAt(0) ?? ''}`.toUpperCase();
    const roleColor = ROLE_COLOR[profile?.role] ?? '#667eea';

    return (
        <DashboardLayout>
            <Box sx={{ maxWidth: 960, mx: 'auto' }}>
                {/* Page header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Person sx={{ fontSize: 36, color: '#667eea' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">My Profile</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your account information and security settings
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* ── Left: Avatar card ───────────────────────── */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ textAlign: 'center', p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
                            <Avatar
                                sx={{
                                    width: 96, height: 96, mx: 'auto', mb: 2,
                                    bgcolor: roleColor, fontSize: 34, fontWeight: 700,
                                    boxShadow: `0 0 0 4px ${roleColor}30`,
                                }}
                            >
                                {initials || <Person />}
                            </Avatar>

                            <Typography variant="h6" fontWeight={700}>
                                {profile?.firstName} {profile?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {profile?.email}
                            </Typography>
                            <Chip
                                label={(profile?.role ?? '').replace(/_/g, ' ')}
                                size="small"
                                sx={{ bgcolor: `${roleColor}20`, color: roleColor, fontWeight: 700, mb: 1 }}
                            />
                            {profile?.employeeId && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                    Employee ID: {profile.employeeId}
                                </Typography>
                            )}
                            {profile?.department && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Dept: {profile.department}
                                </Typography>
                            )}

                            {/* Stats — only for employees/team leads with real data */}
                            {stats && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}
                                        sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                                        This Month
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" fontWeight={700} color="#667eea">
                                                {Number(stats?.thisMonthHours ?? 0).toFixed(0)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Hrs / Month</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" fontWeight={700} color="#2e7d32">
                                                {Number(stats?.thisWeekHours ?? 0).toFixed(0)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Hrs / Week</Typography>
                                        </Box>
                                    </Box>
                                    {(stats?.pendingApprovals ?? 0) > 0 && (
                                        <Chip
                                            label={`${stats.pendingApprovals} pending approvals`}
                                            size="small"
                                            color="warning"
                                            icon={<AccessTime fontSize="small" />}
                                            sx={{ mt: 0.5 }}
                                        />
                                    )}
                                </>
                            )}
                        </Card>
                    </Grid>

                    {/* ── Right: Edit + Password ───────────────────── */}
                    <Grid item xs={12} md={8}>
                        {/* Personal Information */}
                        <Card sx={{ mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Badge sx={{ color: '#667eea' }} />
                                        <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
                                    </Box>
                                    {!editMode && (
                                        <Tooltip title="Edit profile">
                                            <IconButton size="small" onClick={() => setEditMode(true)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 3 }} />

                                {msg && (
                                    <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>
                                        {msg.text}
                                    </Alert>
                                )}

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="First Name"
                                            value={editMode ? firstName : profile?.firstName ?? ''}
                                            onChange={e => setFirstName(e.target.value)}
                                            disabled={!editMode}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Last Name"
                                            value={editMode ? lastName : profile?.lastName ?? ''}
                                            onChange={e => setLastName(e.target.value)}
                                            disabled={!editMode}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth label="Email" value={profile?.email ?? ''} disabled
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Phone"
                                            value={editMode ? phone : (profile?.phone ?? '')}
                                            onChange={e => setPhone(e.target.value)}
                                            disabled={!editMode}
                                            placeholder="+91 98765 43210"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Role"
                                            value={(profile?.role ?? '').replace(/_/g, ' ')}
                                            disabled
                                        />
                                    </Grid>
                                    {profile?.employeeId && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth label="Employee ID"
                                                value={profile?.employeeId ?? ''}
                                                disabled
                                            />
                                        </Grid>
                                    )}
                                    {profile?.department && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth label="Department"
                                                value={profile?.department ?? ''}
                                                disabled
                                            />
                                        </Grid>
                                    )}
                                </Grid>

                                {editMode && (
                                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button variant="outlined" onClick={handleCancelEdit} disabled={saving}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                            onClick={handleSave}
                                            disabled={saving}
                                            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                                        >
                                            {saving ? 'Saving…' : 'Save Changes'}
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Change Password */}
                        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Lock sx={{ color: '#667eea' }} />
                                    <Typography variant="h6" fontWeight={700}>Change Password</Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />

                                {pwdMsg && (
                                    <Alert severity={pwdMsg.type} sx={{ mb: 2 }} onClose={() => setPwdMsg(null)}>
                                        {pwdMsg.text}
                                    </Alert>
                                )}

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth label="Current Password"
                                            type={showCur ? 'text' : 'password'}
                                            value={curPwd}
                                            onChange={e => setCurPwd(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowCur(p => !p)} edge="end">
                                                            {showCur ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="New Password"
                                            type={showNew ? 'text' : 'password'}
                                            value={newPwd}
                                            onChange={e => setNewPwd(e.target.value)}
                                            helperText="Minimum 8 characters"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowNew(p => !p)} edge="end">
                                                            {showNew ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Confirm New Password"
                                            type={showNew ? 'text' : 'password'}
                                            value={confPwd}
                                            onChange={e => setConfPwd(e.target.value)}
                                            error={confPwd.length > 0 && newPwd !== confPwd}
                                            helperText={confPwd.length > 0 && newPwd !== confPwd ? "Passwords don't match" : ' '}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={changingPwd
                                            ? <CircularProgress size={16} color="inherit" />
                                            : <CheckCircle />}
                                        onClick={handleChangePassword}
                                        disabled={changingPwd || !curPwd || !newPwd || !confPwd}
                                        sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                                    >
                                        {changingPwd ? 'Updating…' : 'Update Password'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
