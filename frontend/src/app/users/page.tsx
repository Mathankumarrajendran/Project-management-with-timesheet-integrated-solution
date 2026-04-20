'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth, useRole } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';
import UserForm from '@/components/forms/UserForm';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: string;
    status: string;
    employeeId: string;
}

export default function UsersPage() {
    useAuth(true);
    const hasAccess = useRole(['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (hasAccess && isMounted) {
            fetchUsers();
        }
    }, [hasAccess, isMounted]);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users?limit=100');
            console.log('🔍 Full API Response:', response);
            console.log('🔍 response.data:', response.data);
            console.log('🔍 response.data.data:', response.data.data);
            console.log('🔍 response.data.data.users:', response.data.data.users);
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('❌ Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormOpen(true);
    };

    const handleSaveUser = async (data: any) => {
        try {
            if (selectedUser) {
                await apiClient.put(`/users/${selectedUser.id}`, data);
            } else {
                await apiClient.post('/auth/register', data);
            }
            await fetchUsers();
            setFormOpen(false); // Only close on success
        } catch (error: any) {
            // Re-throw the error so UserForm can display it
            throw error;
        }
    };

    if (!isMounted) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!hasAccess) {
        return (
            <DashboardLayout>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h5" color="error">
                        Access Denied
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        You don't have permission to view this page.
                    </Typography>
                </Box>
            </DashboardLayout>
        );
    }

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    const getRoleColor = (role: string) => {
        const colors: any = {
            SUPER_ADMIN: 'error',
            FINANCE_ADMIN: 'warning',
            PROJECT_MANAGER: 'primary',
            TEAM_LEAD: 'info',
            EMPLOYEE: 'default',
        };
        return colors[role] || 'default';
    };

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            User Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage system users and roles
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddUser}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            },
                        }}
                    >
                        New User
                    </Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Employee ID</strong></TableCell>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Email</strong></TableCell>
                                        <TableCell><strong>Role</strong></TableCell>
                                        <TableCell><strong>Department</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No users found.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                onClick={() => handleEditUser(user)}
                                                sx={{
                                                    '&:hover': { bgcolor: '#f9f9f9', cursor: 'pointer' },
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {user.employeeId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {user.firstName} {user.lastName}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.role.replace('_', ' ')}
                                                        size="small"
                                                        color={getRoleColor(user.role)}
                                                    />
                                                </TableCell>
                                                <TableCell>{user.department || '-'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.status}
                                                        size="small"
                                                        color={user.status === 'ACTIVE' ? 'success' : 'default'}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                <UserForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSaveUser}
                    initialData={selectedUser}
                />
            </Box>
        </DashboardLayout>
    );
}
