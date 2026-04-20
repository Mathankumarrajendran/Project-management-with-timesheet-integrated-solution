'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Badge, IconButton, Popover, Box, Typography, List, ListItem, ListItemText,
    Button, Divider, Chip, Tooltip, CircularProgress,
} from '@mui/material';
import {
    Notifications, NotificationsNone, Clear, DoneAll, CheckCircle, Info, Warning, Error as ErrorIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/apiClient';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: any;
}

const typeIcon = (type: string) => {
    if (type.includes('APPROVED')) return <CheckCircle fontSize="small" sx={{ color: '#4caf50' }} />;
    if (type.includes('REJECTED')) return <ErrorIcon fontSize="small" sx={{ color: '#f44336' }} />;
    if (type.includes('WARN')) return <Warning fontSize="small" sx={{ color: '#ff9800' }} />;
    return <Info fontSize="small" sx={{ color: '#667eea' }} />;
};

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [clearing, setClearing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const r = await apiClient.get('/notifications');
            setNotifications(r.data.data.notifications ?? []);
            setUnreadCount(r.data.data.unreadCount ?? 0);
        } catch {
            // Silently fail
        }
    }, []);

    // Poll every 30s for new notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
        // Mark all read when opening
        if (unreadCount > 0) {
            apiClient.patch('/notifications/read-all').then(fetchNotifications).catch(() => { });
        }
    };

    const handleClose = () => setAnchorEl(null);

    const handleClearOne = async (id: number) => {
        try {
            await apiClient.delete(`/notifications/${id}`);
            fetchNotifications();
        } catch { }
    };

    const handleClearAll = async () => {
        setClearing(true);
        try {
            await apiClient.delete('/notifications/clear-all');
            fetchNotifications();
        } catch { }
        finally { setClearing(false); }
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton onClick={handleOpen} size="medium">
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                        {unreadCount > 0
                            ? <Notifications sx={{ color: '#667eea' }} />
                            : <NotificationsNone sx={{ color: '#888' }} />
                        }
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 520,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    },
                }}
            >
                {/* Header */}
                <Box sx={{
                    px: 2, py: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    borderRadius: '8px 8px 0 0',
                }}>
                    <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {notifications.length > 0 && (
                            <Button
                                size="small"
                                startIcon={clearing ? <CircularProgress size={12} color="inherit" /> : <Clear />}
                                onClick={handleClearAll}
                                disabled={clearing}
                                sx={{ color: 'white', fontSize: 12, textTransform: 'none', minWidth: 0 }}
                            >
                                Clear all
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* List */}
                <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    {!loading && notifications.length === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1 }}>
                            <DoneAll sx={{ fontSize: 40, color: '#ccc' }} />
                            <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
                        </Box>
                    )}
                    {!loading && notifications.length > 0 && (
                        <List disablePadding>
                            {notifications.map((notif, idx) => (
                                <Box key={notif.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            bgcolor: notif.read ? 'transparent' : 'rgba(102,126,234,0.06)',
                                            transition: 'background 0.2s',
                                            '&:hover': { bgcolor: '#f5f5f5' },
                                            pr: 1,
                                        }}
                                        secondaryAction={
                                            <Tooltip title="Dismiss">
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleClearOne(notif.id)}
                                                    sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                                                >
                                                    <Clear fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    >
                                        <Box sx={{ mr: 1.5, mt: 0.5 }}>{typeIcon(notif.type)}</Box>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Typography variant="body2" fontWeight={notif.read ? 400 : 700} sx={{ lineHeight: 1.3 }}>
                                                        {notif.title}
                                                    </Typography>
                                                    {!notif.read && (
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#667eea', flexShrink: 0 }} />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                                                        {notif.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.25 }}>
                                                        {timeAgo(notif.createdAt)}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {idx < notifications.length - 1 && <Divider component="li" />}
                                </Box>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
}
