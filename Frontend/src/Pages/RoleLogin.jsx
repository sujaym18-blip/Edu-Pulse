import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cookie from 'js-cookie';
import {
    Alert, Box, Button, CircularProgress, CssBaseline, Dialog, DialogActions,
    DialogContent, DialogTitle, IconButton, InputAdornment, Link, Paper, TextField, Typography
} from '@mui/material';
import {
    AdminPanelSettings, ArrowBack, ArrowForward, Email, Lock, People, School,
    Visibility, VisibilityOff
} from '@mui/icons-material';
import campusImage from '../assets/pic9.jpeg';

const primaryColor = '#1e2a38';
const secondaryColor = '#007bff';

const roleSettings = {
    admin: {
        title: 'Admin Portal',
        eyebrow: 'ADMINISTRATOR ACCESS',
        description: 'Manage your institution and keep every part of campus running smoothly.',
        loginEndpoint: '/adminlogin',
        cookieName: 'emtoken',
        dashboardPath: '/Dashboard',
        icon: AdminPanelSettings,
        registrationText: 'Create an admin account',
    },
    staff: {
        title: 'Staff & Faculty Portal',
        eyebrow: 'STAFF & FACULTY',
        description: 'Manage classes, support students, and stay on top of academic operations.',
        loginEndpoint: '/stafflogin',
        cookieName: 'emstoken',
        dashboardPath: '/StaffDashboard',
        icon: People,
        registrationText: 'Create a staff account',
    },
};

const RoleLogin = ({ role }) => {
    const settings = roleSettings[role];
    const RoleIcon = settings.icon;
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
        setError('');
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `http://localhost:7000${settings.loginEndpoint}`,
                formData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200 && response.data.token) {
                cookie.set(settings.cookieName, response.data.token, { expires: 1 });
                navigate(settings.dashboardPath);
            } else {
                setError(response.data.msg || response.data.message || 'Invalid login credentials.');
            }
        } catch (loginError) {
            console.error(`${role} login error:`, loginError.response?.data || loginError.message);
            setError(loginError.response?.data?.msg || loginError.response?.data?.message || 'Login failed. Please check your network or credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        setResetLoading(true);
        setResetMessage(null);

        try {
            const response = await axios.post(
                `http://localhost:7000/${role}/forgot-password`,
                { email: resetEmail },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setResetMessage({ severity: 'success', text: response.data.msg });
        } catch (resetError) {
            setResetMessage({
                severity: 'error',
                text: resetError.response?.data?.msg || 'Unable to request a password reset. Please try again later.',
            });
        } finally {
            setResetLoading(false);
        }
    };

    const openForgotPassword = () => {
        setResetEmail(formData.email);
        setResetMessage(null);
        setForgotOpen(true);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e9f2ff 0%, #f6f8fc 55%, #e7f4ff 100%)',
            px: { xs: 2, sm: 3 },
            py: { xs: 3, sm: 5 },
        }}>
            <CssBaseline />
            <Paper elevation={0} sx={{
                width: '100%',
                maxWidth: 1080,
                minHeight: { xs: 'auto', md: 640 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '0.9fr 1fr' },
                borderRadius: { xs: '20px', md: '28px' },
                overflow: 'hidden',
                backgroundColor: '#fff',
                boxShadow: '0 28px 80px rgba(24, 54, 92, 0.18)',
            }}>
                <Box sx={{
                    position: 'relative',
                    minHeight: { xs: 220, md: '100%' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 3, sm: 5, md: 6 },
                    color: '#fff',
                    backgroundImage: `linear-gradient(145deg, rgba(8, 30, 58, 0.88), rgba(0, 103, 190, 0.68)), url(${campusImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <School />
                        <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>EduPulse</Typography>
                    </Box>
                    <Box sx={{ mt: { xs: 4, md: 0 }, maxWidth: 390 }}>
                        <Typography variant="overline" sx={{ color: '#b9ddff', fontWeight: 700, letterSpacing: 2 }}>
                            YOUR CAMPUS, CONNECTED
                        </Typography>
                        <Typography variant="h3" component="h2" sx={{
                            mt: 1,
                            fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.7rem' },
                            lineHeight: 1.15,
                            fontWeight: 800,
                        }}>
                            Learn, grow, and stay connected.
                        </Typography>
                        <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                            {settings.description}
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, color: 'rgba(255,255,255,0.7)' }}>
                        A simpler way to stay connected to your education.
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: { xs: 3, sm: 5, md: 7 },
                }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="overline" sx={{ color: secondaryColor, fontWeight: 800, letterSpacing: 1.5 }}>
                            {settings.eyebrow}
                        </Typography>
                        <Typography variant="h4" component="h1" sx={{ mt: 0.5, fontWeight: 800, color: primaryColor, letterSpacing: '-0.5px' }}>
                            Welcome back
                        </Typography>
                        <Typography sx={{ mt: 1, color: '#687789' }}>
                            Sign in with your registered email address.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

                    <form onSubmit={handleLogin}>
                        <Box sx={{ display: 'grid', gap: 2.5 }}>
                            <TextField
                                label="Email address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                required
                                autoComplete="username"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8292a5' }} /></InputAdornment>,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fbfcfe' } }}
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                fullWidth
                                required
                                autoComplete="current-password"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#8292a5' }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword((visible) => !visible)} edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fbfcfe' } }}
                            />
                        </Box>

                        <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                            <Link component="button" type="button" onClick={openForgotPassword} underline="none" sx={{ color: secondaryColor, fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            endIcon={!loading && <ArrowForward />}
                            sx={{
                                mt: 2.5,
                                py: 1.6,
                                background: `linear-gradient(100deg, ${secondaryColor}, #0057c2)`,
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: '12px',
                                textTransform: 'none',
                                boxShadow: '0 10px 22px rgba(0, 104, 214, 0.22)',
                                '&:hover': { background: 'linear-gradient(100deg, #0068d7, #004ba8)' },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : `Sign in to ${role === 'admin' ? 'admin' : 'staff'} dashboard`}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3.5, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            New to EduPulse?{' '}
                            <Link
                                component="button"
                                type="button"
                                onClick={() => navigate(`/Register?role=${role}`)}
                                sx={{ color: secondaryColor, fontWeight: 700, cursor: 'pointer' }}
                            >
                                {settings.registrationText}
                            </Link>
                        </Typography>
                        <Button onClick={() => navigate('/AllLogin')} startIcon={<ArrowBack />} variant="text" sx={{ mt: 1.5, color: '#718096', textTransform: 'none', fontWeight: 600 }}>
                            Back to portal selection
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Dialog open={forgotOpen} onClose={() => !resetLoading && setForgotOpen(false)} fullWidth maxWidth="xs">
                <Box component="form" onSubmit={handleForgotPassword}>
                    <DialogTitle sx={{ fontWeight: 800, color: primaryColor }}>Reset your password</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter your registered email. If it matches an account, we’ll send a secure reset link that expires in one hour.
                        </Typography>
                        {resetMessage && <Alert severity={resetMessage.severity} sx={{ mb: 2 }}>{resetMessage.text}</Alert>}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Email address"
                            type="email"
                            fullWidth
                            required
                            value={resetEmail}
                            onChange={(event) => {
                                setResetEmail(event.target.value);
                                setResetMessage(null);
                            }}
                            autoComplete="email"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setForgotOpen(false)} disabled={resetLoading}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={resetLoading}>
                            {resetLoading ? <CircularProgress size={22} color="inherit" /> : 'Send reset link'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
};

export default RoleLogin;
