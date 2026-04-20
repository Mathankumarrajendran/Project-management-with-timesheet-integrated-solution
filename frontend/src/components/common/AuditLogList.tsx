import { useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Paper,
    Chip,
} from '@mui/material';
import apiClient from '@/lib/apiClient';

interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entityId: number;
    changes: any;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface AuditLogListProps {
    entityType: string; // 'Project', 'Task', etc. (Capitalized as stored in DB)
    entityId: number;
}

export default function AuditLogList({ entityType, entityId }: AuditLogListProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (entityId) {
            fetchLogs();
        }
    }, [entityId, entityType]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/audit-logs?entity=${entityType}&entityId=${entityId}`);
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderChanges = (changes: any) => {
        if (!changes) return '-';
        if (typeof changes === 'string') return changes;
        if (Object.keys(changes).length === 0) return 'No changes recorded';

        return (
            <Box sx={{ maxHeight: 100, overflowY: 'auto' }}>
                {Object.entries(changes).map(([key, value]) => (
                    <Typography key={key} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                    </Typography>
                ))}
            </Box>
        );
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (logs.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No audit logs found for this {entityType}.
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>User</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                        <TableCell><strong>Changes</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id} hover>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {new Date(log.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        {log.user.firstName} {log.user.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {log.user.email}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={log.action}
                                    size="small"
                                    color={getActionColor(log.action) as any}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 400 }}>
                                {renderChanges(log.changes)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
