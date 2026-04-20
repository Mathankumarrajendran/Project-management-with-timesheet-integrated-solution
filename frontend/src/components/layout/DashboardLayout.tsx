'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, IconButton,
    ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar,
    Menu, MenuItem, Divider, Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, People, Business, FolderOpen, Assignment,
    AccessTime, BarChart, Timeline, AccountCircle, Logout,
    EventNote, HowToVote, AccountBalance, ExpandLess, ExpandMore,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import NotificationBell from '@/components/ui/NotificationBell';

const drawerWidth = 260;

interface NavItem {
    text: string;
    icon: React.ReactNode;
    path?: string;
    roles?: string[];
    children?: NavItem[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user, hydrated } = useAppSelector((state) => state.auth);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [timesheetOpen, setTimesheetOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    // Keep Timesheets section open when on any /timesheets path
    useEffect(() => {
        if (pathname.startsWith('/timesheets')) setTimesheetOpen(true);
    }, [pathname]);

    const handleLogout = () => { dispatch(logout()); router.push('/login'); };

    const isAllowed = (roles?: string[]) => {
        if (!roles) return true;
        if (!isMounted) return true; // show all items until mounted to prevent hydration mismatch
        return roles.includes(user?.role || '');
    };

    const topNavItems: NavItem[] = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Users', icon: <People />, path: '/users', roles: ['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'] },
        { text: 'Clients', icon: <Business />, path: '/clients', roles: ['SUPER_ADMIN', 'PROJECT_MANAGER'] },
        { text: 'Projects', icon: <FolderOpen />, path: '/projects', roles: ['SUPER_ADMIN', 'PROJECT_MANAGER'] },
        { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
        { text: 'Time Logs', icon: <AccessTime />, path: '/timelogs' },
    ];

    const timesheetChildren: NavItem[] = [
        { text: 'My Timesheets', icon: <EventNote fontSize="small" />, path: '/timesheets' },
        {
            text: 'L1 Approval', icon: <HowToVote fontSize="small" />, path: '/timesheets/l1-approval',
            roles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
        },
        {
            text: 'L2 Approval', icon: <AccountBalance fontSize="small" />, path: '/timesheets/l2-approval',
            roles: ['SUPER_ADMIN', 'FINANCE_ADMIN'],
        },
    ];

    const bottomNavItems: NavItem[] = [
        { text: 'Sprint Board', icon: <Timeline />, path: '/sprints' },
        { text: 'Reports', icon: <BarChart />, path: '/reports', roles: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER'] },
    ];

    const pageTitles: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/users': 'User Management',
        '/clients': 'Client Management',
        '/projects': 'Projects',
        '/tasks': 'Tasks',
        '/timelogs': 'Time Tracking',
        '/timesheets': 'My Timesheets',
        '/timesheets/l1-approval': 'L1 Approval',
        '/timesheets/l2-approval': 'L2 Approval',
        '/sprints': 'Sprint Board',
        '/reports': 'Reports',
        '/profile': 'My Profile',
    };

    // Dynamic title for task detail pages
    const pageTitle = pathname.startsWith('/tasks/') && pathname !== '/tasks'
        ? 'Task Detail'
        : (pageTitles[pathname] || 'Dashboard');

    const NavRow = ({ item }: { item: NavItem }) => {
        if (!isAllowed(item.roles)) return null;
        return (
            <ListItem disablePadding>
                <ListItemButton
                    selected={pathname === item.path}
                    onClick={() => item.path && router.push(item.path)}
                    sx={{
                        pl: 2,
                        '&.Mui-selected': {
                            background: 'linear-gradient(90deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                            borderRight: '3px solid #667eea',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: pathname === item.path ? '#667eea' : 'inherit', minWidth: 38 }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
            </ListItem>
        );
    };

    const drawer = (
        <Box>
            <Toolbar sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                <Typography variant="h6" noWrap fontWeight="bold">PM System</Typography>
            </Toolbar>
            <Divider />
            <List dense>
                {topNavItems.map(item => <NavRow key={item.text} item={item} />)}

                {/* Timesheets collapsible section */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => setTimesheetOpen(o => !o)}
                        sx={{ '&.Mui-selected': { borderRight: '3px solid #667eea' } }}
                        selected={pathname.startsWith('/timesheets')}
                    >
                        <ListItemIcon sx={{ color: pathname.startsWith('/timesheets') ? '#667eea' : 'inherit', minWidth: 38 }}>
                            <EventNote />
                        </ListItemIcon>
                        <ListItemText primary="Timesheets" primaryTypographyProps={{ variant: 'body2' }} />
                        {timesheetOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={timesheetOpen} timeout="auto" unmountOnExit>
                    <List dense disablePadding>
                        {timesheetChildren.filter(c => isAllowed(c.roles)).map(item => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={pathname === item.path}
                                    onClick={() => item.path && router.push(item.path)}
                                    sx={{
                                        pl: 4,
                                        '&.Mui-selected': {
                                            background: 'rgba(102,126,234,0.08)',
                                            borderRight: '3px solid #667eea',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: pathname === item.path ? '#667eea' : 'inherit', minWidth: 32 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} primaryTypographyProps={{ variant: 'body2' }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                <Divider sx={{ my: 0.5 }} />
                {bottomNavItems.map(item => <NavRow key={item.text} item={item} />)}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    background: 'white',
                    color: 'text.primary',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        {pageTitle}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Notification Bell */}
                        <NotificationBell />

                        {isMounted && (
                            <>
                                <Box sx={{ textAlign: 'right', mr: 0.5 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {user?.firstName} {user?.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'lowercase' }}>
                                        {user?.role?.replace(/_/g, ' ')}
                                    </Typography>
                                </Box>
                                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#667eea' }}>
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </Avatar>
                                </IconButton>
                            </>
                        )}
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                        <MenuItem onClick={() => { setAnchorEl(null); router.push('/profile'); }}>
                            <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                            My Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8, minHeight: '100vh', background: '#f5f5f5' }}
            >
                {children}
            </Box>
        </Box>
    );
}
