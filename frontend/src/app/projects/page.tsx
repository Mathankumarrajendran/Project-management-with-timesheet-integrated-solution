'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, CircularProgress,
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Avatar, Tooltip, Alert, Divider,
} from '@mui/material';
import { Add, Edit, GroupAdd, PersonRemove } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/apiClient';
import ProjectForm from '@/components/forms/ProjectForm';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Project {
    id: number;
    code: string;
    name: string;
    status: string;
    projectType: string;
    billingType: string;
    startDate: string;
    endDate?: string;
    projectManagerId?: number;
    members?: { userId: number; role: string; user: { id: number; firstName: string; lastName: string; email: string; role: string } }[];
}

// ─── Manage Members Dialog ───────────────────────────────────────────────────
function ManageMembersDialog({
    open, project, onClose, currentUserId, isSuperAdmin,
}: {
    open: boolean;
    project: Project | null;
    onClose: () => void;
    currentUserId: number;
    isSuperAdmin: boolean;
}) {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [memberRole, setMemberRole] = useState('MEMBER');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Determine if the current user can manage this project:
    // - Super Admin: always yes
    // - Project Manager: only if they ARE the project manager of this project
    const canManage = isSuperAdmin || (project?.projectManagerId === currentUserId);

    useEffect(() => {
        if (!open || !project) return;
        setError('');
        setSuccess('');
        setSelectedUserId('');
        setMemberRole('MEMBER');

        Promise.all([
            apiClient.get('/users?limit=100'),
            apiClient.get(`/projects/${project.id}`),
        ]).then(([usersRes, projectRes]) => {
            setAllUsers(usersRes.data.data.users ?? []);
            setMembers(projectRes.data.data.members ?? []);
        }).catch(() => setError('Failed to load data'));
    }, [open, project]);

    const memberUserIds = new Set(members.map((m: any) => m.userId));
    const availableUsers = allUsers.filter(u => !memberUserIds.has(u.id));

    const handleAdd = async () => {
        if (!selectedUserId || !project) return;
        setSaving(true);
        setError('');
        try {
            const res = await apiClient.post(`/projects/${project.id}/members`, {
                userId: parseInt(selectedUserId),
                role: memberRole,
            });
            setMembers(prev => [...prev, res.data.data]);
            setSelectedUserId('');
            setSuccess('Member added successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to add member');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (userId: number) => {
        if (!project) return;
        setError('');
        try {
            await apiClient.delete(`/projects/${project.id}/members/${userId}`);
            setMembers(prev => prev.filter((m: any) => m.userId !== userId));
            setSuccess('Member removed.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to remove member');
        }
    };

    if (!project) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupAdd sx={{ color: '#667eea' }} />
                Manage Members — {project.name}
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Current Members */}
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Current Members ({members.length})
                </Typography>
                {members.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No members yet.</Typography>
                )}
                {members.map((m: any) => (
                    <Box key={m.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, borderBottom: '1px solid #f0f0f0' }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea', fontSize: 13 }}>
                            {m.user.firstName[0]}{m.user.lastName[0]}
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="body2" fontWeight={500}>{m.user.firstName} {m.user.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{m.user.email} · {m.role}</Typography>
                        </Box>
                        <Chip label={m.user.role.replace(/_/g, ' ')} size="small" variant="outlined" />
                        {canManage && (
                            <Tooltip title="Remove member">
                                <IconButton size="small" color="error" onClick={() => handleRemove(m.userId)}>
                                    <PersonRemove fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                ))}

                {/* Add Member (only if allowed) */}
                {canManage && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Add New Member</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <TextField
                                select
                                label="Select User"
                                size="small"
                                value={selectedUserId}
                                onChange={e => setSelectedUserId(e.target.value)}
                                sx={{ flex: 2 }}
                            >
                                {availableUsers.length === 0 && (
                                    <MenuItem disabled>All users already added</MenuItem>
                                )}
                                {availableUsers.map(u => (
                                    <MenuItem key={u.id} value={u.id}>
                                        {u.firstName} {u.lastName} ({u.role.replace(/_/g, ' ')})
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Project Role"
                                size="small"
                                value={memberRole}
                                onChange={e => setMemberRole(e.target.value)}
                                sx={{ flex: 1 }}
                            >
                                {['MEMBER', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'QA', 'DEVOPS'].map(r => (
                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                ))}
                            </TextField>
                            <Button
                                variant="contained"
                                onClick={handleAdd}
                                disabled={!selectedUserId || saving}
                                sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', minWidth: 80 }}
                            >
                                {saving ? <CircularProgress size={18} color="inherit" /> : 'Add'}
                            </Button>
                        </Box>
                    </>
                )}

                {!canManage && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Only the project manager or a super admin can add or remove members.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProjectsPage() {
    useAuth(true);
    const router = useRouter();
    const { user } = useAppSelector((state: any) => state.auth);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [membersProject, setMembersProject] = useState<Project | null>(null);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isPrivileged = user && ['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(user.role);

    // Role guard: only PM and Super Admin
    useEffect(() => {
        if (user && !isPrivileged) router.push('/dashboard');
    }, [user, isPrivileged, router]);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/projects?limit=100');
            setProjects(response.data.data.projects || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProject = async (data: any) => {
        if (selectedProject) {
            await apiClient.put(`/projects/${selectedProject.id}`, data);
        } else {
            await apiClient.post('/projects', data);
        }
        await fetchProjects();
    };

    // A PM can only edit projects they manage
    const canEditProject = (p: Project) =>
        isSuperAdmin || (user?.role === 'PROJECT_MANAGER' && p.projectManagerId === user?.id);

    // A PM can manage members only on their own projects; Super Admin everywhere
    const canManageMembers = (p: Project) =>
        isSuperAdmin || (user?.role === 'PROJECT_MANAGER' && p.projectManagerId === user?.id);

    const getStatusColor = (status: string): any => {
        const c: any = { PLANNING: 'default', IN_PROGRESS: 'primary', ON_HOLD: 'warning', COMPLETED: 'success', CANCELLED: 'error' };
        return c[status] || 'default';
    };

    if (loading) {
        return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Projects</Typography>
                        <Typography variant="body1" color="text.secondary">Manage all your projects</Typography>
                    </Box>
                    {isSuperAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => { setSelectedProject(null); setFormOpen(true); }}
                            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)' } }}
                        >
                            New Project
                        </Button>
                    )}
                </Box>

                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Code</strong></TableCell>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell><strong>Billing</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Start Date</strong></TableCell>
                                        <TableCell><strong>End Date</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">No projects found. Create your first project!</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        projects.map(project => (
                                            <TableRow
                                                key={project.id}
                                                onClick={() => router.push(`/projects/${project.id}`)}
                                                sx={{ '&:hover': { bgcolor: '#f9f9f9', cursor: 'pointer' } }}
                                            >
                                                <TableCell><Typography variant="body2" fontWeight="600">{project.code}</Typography></TableCell>
                                                <TableCell>{project.name}</TableCell>
                                                <TableCell>{project.projectType}</TableCell>
                                                <TableCell>
                                                    <Chip label={project.billingType} size="small" color={project.billingType === 'BILLABLE' ? 'success' : 'default'} variant="outlined" />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={project.status.replace(/_/g, ' ')} size="small" color={getStatusColor(project.status)} />
                                                </TableCell>
                                                <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</TableCell>
                                                <TableCell align="center" onClick={e => e.stopPropagation()}>
                                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                        {canEditProject(project) && (
                                                            <Tooltip title="Edit project">
                                                                <IconButton size="small" onClick={() => { setSelectedProject(project); setFormOpen(true); }}>
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {canManageMembers(project) && (
                                                            <Tooltip title="Manage members">
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ color: '#667eea' }}
                                                                    onClick={() => setMembersProject(project)}
                                                                >
                                                                    <GroupAdd fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Project create/edit form */}
                <ProjectForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSaveProject}
                    initialData={selectedProject}
                />

                {/* Manage Members dialog */}
                <ManageMembersDialog
                    open={!!membersProject}
                    project={membersProject}
                    onClose={() => setMembersProject(null)}
                    currentUserId={user?.id}
                    isSuperAdmin={isSuperAdmin}
                />
            </Box>
        </DashboardLayout>
    );
}
