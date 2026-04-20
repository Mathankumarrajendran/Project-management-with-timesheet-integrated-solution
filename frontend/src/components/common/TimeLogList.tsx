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
    Chip,
    Paper,
} from '@mui/material';
import apiClient from '@/lib/apiClient';

interface TimeLog {
    id: number;
    date: string;
    hours: number;
    description: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    task?: {
        code: string;
        title: string;
    };
    project?: {
        code: string;
        name: string;
    };
}

interface TimeLogListProps {
    entityType: 'project' | 'client' | 'task';
    entityId: number;
}

export default function TimeLogList({ entityType, entityId }: TimeLogListProps) {
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (entityId) {
            fetchLogs();
        }
    }, [entityId, entityType]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const param = `${entityType}Id`;
            const response = await apiClient.get(`/timelogs?${param}=${entityId}`);
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch time logs:', error);
        } finally {
            setLoading(false);
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
                    No time logs found for this {entityType}.
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
                        {entityType !== 'task' && <TableCell><strong>Task</strong></TableCell>}
                        <TableCell><strong>Hours</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id} hover>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {new Date(log.date).toLocaleDateString()}
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
                            {entityType !== 'task' && (
                                <TableCell>
                                    {log.task ? (
                                        <Box>
                                            <Chip label={log.task.code} size="small" sx={{ height: 20, fontSize: '0.7rem', mb: 0.5 }} />
                                            <Typography variant="caption" display="block">
                                                {log.task.title.length > 30 ? log.task.title.substring(0, 30) + '...' : log.task.title}
                                            </Typography>
                                        </Box>
                                    ) : '-'}
                                </TableCell>
                            )}
                            <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                    {log.hours}h
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300 }}>
                                <Typography variant="body2">
                                    {log.description}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
