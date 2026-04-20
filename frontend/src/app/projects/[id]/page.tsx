'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    Divider,
    CircularProgress,
    IconButton,
    Tabs,
    Tab,
    Dialog,
} from '@mui/material';
import { Edit, ArrowBack, AccessTime, AttachMoney, People, Assignment, History } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';
import ProjectForm from '@/components/forms/ProjectForm';
import TimeLogList from '@/components/common/TimeLogList';
import AuditLogList from '@/components/common/AuditLogList';

export default function ProjectDetailsPage() {
    const { user } = useAuth(true);
    const params = useParams();
    const router = useRouter();
    // Handle both string and array param types safely
    const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [logHistoryOpen, setLogHistoryOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            const response = await apiClient.get(`/projects/${projectId}`);
            setProject(response.data.data);
        } catch (error) {
            console.error('Failed to fetch project details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProject = () => {
        setFormOpen(true);
    };

    const handleSaveProject = async (data: any) => {
        await apiClient.put(`/projects/${projectId}`, data);
        await fetchProjectDetails();
        setFormOpen(false);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>Project not found</Typography>
                    <Button variant="outlined" onClick={() => router.push('/projects')}>
                        Back to Projects
                    </Button>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => router.push('/projects')} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" fontWeight="bold">
                            {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Chip label={project.code} size="small" variant="outlined" />
                            <Chip
                                label={project.status}
                                size="small"
                                color={project.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                            />
                            {project.client && (
                                <Chip
                                    label={project.client.name}
                                    size="small"
                                    variant="outlined"
                                    avatar={<People style={{ width: 16, height: 16 }} />}
                                />
                            )}
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<History />}
                        onClick={() => setLogHistoryOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        History
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={handleEditProject}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        Edit Project
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Info */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Description</Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    {project.description || 'No description provided.'}
                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" gutterBottom>SLA Policy</Typography>
                                {project.slaPolicy ? (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Chip label={`High: ${project.slaPolicy.HIGH}h`} color="error" variant="outlined" />
                                        <Chip label={`Medium: ${project.slaPolicy.MEDIUM}h`} color="warning" variant="outlined" />
                                        <Chip label={`Low: ${project.slaPolicy.LOW}h`} color="info" variant="outlined" />
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No SLA Policy defined</Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tasks Overview */}
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">Recent Tasks</Typography>
                                    <Button size="small" onClick={() => router.push(`/tasks?projectId=${project.id}`)}>
                                        View All
                                    </Button>
                                </Box>
                                {project.tasks && project.tasks.length > 0 ? (
                                    project.tasks.slice(0, 5).map((task: any) => (
                                        <Box key={task.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle2">{task.title}</Typography>
                                                <Chip label={task.status} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {task.code} • Priority: {task.priority}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No tasks found.</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sidebar Info */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Details</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Project Manager</Typography>
                                        <Typography variant="body2">
                                            {project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : 'Unassigned'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Billing Type</Typography>
                                        <Typography variant="body2">{project.billingType}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Start Date</Typography>
                                        <Typography variant="body2">
                                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Due Date</Typography>
                                        <Typography variant="body2">
                                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Budget</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Budget Hours</Typography>
                                            <Typography variant="body2">{project.budgetHours || 0} hrs</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AttachMoney color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Budget Amount</Typography>
                                            <Typography variant="body2">${project.budgetAmount || 0}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <ProjectForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSaveProject}
                    initialData={project}
                />

                {/* Log History Dialog */}
                <Dialog
                    open={logHistoryOpen}
                    onClose={() => setLogHistoryOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Project History
                        </Typography>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                            <Tab label="Time Logs" />
                            <Tab label="Audit Logs" />
                        </Tabs>

                        {tabValue === 0 && <TimeLogList entityType="project" entityId={project.id} />}
                        {tabValue === 1 && <AuditLogList entityType="Project" entityId={project.id} />}

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setLogHistoryOpen(false)}>Close</Button>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
