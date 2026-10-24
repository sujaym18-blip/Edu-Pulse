import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Alert, Box, Button, CircularProgress, CssBaseline, InputAdornment, Paper,
    TextField, Typography
} from '@mui/material';
import { Lock, School } from '@mui/icons-material';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const validRole = role === 'admin' || role === 'staff' || role === 'student';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage(null);
        if (password.length < 8) {
            setMessage({ severity: 'error', text: 'Use at least 8 characters for your new password.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ severity: 'error', text: 'The passwords do not match.' });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:7000/${role}/reset-password`, { token, password });
            setMessage({ severity: 'success', text: response.data.msg });
        } catch (error) {
            setMessage({
                severity: 'error',
                text: error.response?.data?.msg || 'Unable to reset your password. Request a new reset link and try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 4,
            background: 'linear-gradient(135deg, #e9f2ff 0%, #f6f8fc 55%, #e7f4ff 100%)',
        }}>
            <CssBaseline />
            <Paper elevation={0} sx={{
                width: '100%',
                maxWidth: 480,
                p: { xs: 3, sm: 5 },
                borderRadius: '24px',
                boxShadow: '0 28px 80px rgba(24, 54, 92, 0.18)',
            }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <School sx={{ color: '#007bff', fontSize: 42, mb: 1 }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1e2a38' }}>
                        Choose a new password
                    </Typography>
                    <Typography sx={{ mt: 1, color: '#687789' }}>
                        Your password must be at least 8 characters.
                    </Typography>
                </Box>

                {!validRole || !token ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        This reset link is incomplete or invalid. Request a new one from your login page.
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <TextField
                                label="New password"
                                type="password"
                                required
                                fullWidth
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <TextField
                                label="Confirm new password"
                                type="password"
                                required
                                fullWidth
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                autoComplete="new-password"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || message?.severity === 'success'}
                            sx={{ mt: 3, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Save new password'}
                        </Button>
                    </Box>
                )}

                {message?.severity === 'success' ? (
                    <Button fullWidth sx={{ mt: 2, textTransform: 'none' }} onClick={() => navigate(role === 'admin' ? '/AdminLogin' : role === 'staff' ? '/StaffLogin' : '/StudentLogin')}>
                        Return to sign in
                    </Button>
                ) : (
                    <Typography sx={{ mt: 2, textAlign: 'center' }}>
                        <RouterLink to={role === 'admin' ? '/AdminLogin' : role === 'staff' ? '/StaffLogin' : '/StudentLogin'}>Back to sign in</RouterLink>
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ResetPassword;
