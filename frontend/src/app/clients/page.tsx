'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    Dialog,
    Tabs,
    Tab,
    IconButton,
} from '@mui/material';
import { Add, History } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/apiClient';
import ClientForm from '@/components/forms/ClientForm';
import AuditLogList from '@/components/common/AuditLogList';
import TimeLogList from '@/components/common/TimeLogList';

interface Client {
    id: number;
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contractType: string;
    status: string;
    _count?: {
        projects: number;
    };
}

export default function ClientsPage() {
    useAuth(true);
    const { user } = useAppSelector((state: any) => state.auth);
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyClient, setHistoryClient] = useState<Client | null>(null);
    const [tabValue, setTabValue] = useState(0);

    // Role guard: only PM and Super Admin
    useEffect(() => {
        if (user && !['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
            router.push('/dashboard');
        }
    }, [user, router]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await apiClient.get('/clients');
            // Backend returns data: { clients: [], pagination: {} }
            // We need to extract the clients array
            setClients(response.data.data.clients || []);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setFormOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setFormOpen(true);
    };

    const handleHistory = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setHistoryClient(client);
        setHistoryOpen(true);
    };

    const handleSaveClient = async (data: any) => {
        if (selectedClient) {
            // Edit existing client
            await apiClient.put(`/clients/${selectedClient.id}`, data);
        } else {
            // Create new client
            await apiClient.post('/clients', data);
        }
        await fetchClients(); // Refresh list
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

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Clients
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your client relationships
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddClient}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            },
                        }}
                    >
                        New Client
                    </Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell><strong>Contact Person</strong></TableCell>
                                        <TableCell><strong>Email</strong></TableCell>
                                        <TableCell><strong>Phone</strong></TableCell>
                                        <TableCell><strong>Contract Type</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Projects</strong></TableCell>
                                        <TableCell><strong>History</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {clients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No clients found. Add your first client!
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        clients.map((client) => (
                                            <TableRow
                                                key={client.id}
                                                onClick={() => handleEditClient(client)}
                                                sx={{
                                                    '&:hover': { bgcolor: '#f9f9f9', cursor: 'pointer' },
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {client.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{client.contactName}</TableCell>
                                                <TableCell>{client.contactEmail}</TableCell>
                                                <TableCell>{client.contactPhone}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={client.contractType}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={client.status}
                                                        size="small"
                                                        color={client.status === 'ACTIVE' ? 'success' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={client._count?.projects || 0}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleHistory(client, e)}
                                                    >
                                                        <History fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                <ClientForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSaveClient}
                    initialData={selectedClient}
                />

                <Dialog
                    open={historyOpen}
                    onClose={() => setHistoryOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {historyClient?.name} - History
                        </Typography>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                            <Tab label="Time Logs" />
                            <Tab label="Audit Logs" />
                        </Tabs>

                        {historyOpen && historyClient && (
                            <>
                                {tabValue === 0 && <TimeLogList entityType="client" entityId={historyClient.id} />}
                                {tabValue === 1 && <AuditLogList entityType="Client" entityId={historyClient.id} />}
                            </>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setHistoryOpen(false)}>Close</Button>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
