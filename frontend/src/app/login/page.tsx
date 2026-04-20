'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Paper,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(login(formData)).unwrap();
            router.push('/dashboard');
        } catch (err) {
            // Error handled by Redux
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            PM System
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Project Management & Time Tracking
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            sx={{ mb: 3 }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                },
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Test Users:
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            admin@pm-system.com / Admin@123456
                        </Typography>
                        <Typography variant="caption" display="block">
                            pm@pm-system.com / PM@123456
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
