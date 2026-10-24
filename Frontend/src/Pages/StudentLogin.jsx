import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cookie from 'js-cookie';
import { 
    Box, Typography, TextField, Button, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Alert, Paper, IconButton, InputAdornment, CssBaseline, Link
} from '@mui/material';
import { 
    School, Email, Lock, Visibility, VisibilityOff, ArrowForward, ArrowBack
} from '@mui/icons-material';
import campusImage from '../assets/pic9.jpeg';

const primaryColor = '#1e2a38';
const secondaryColor = '#007bff';

const Stulogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            return 'Please fill in both Email and Password.';
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            return 'Please enter a valid email address.';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'http://localhost:7000/admissionlogin',
                formData,
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            const token = response.data.token;

            if (response.status === 200 && response.data.success === true && token) {
                cookie.set('token', token, { expires: 1 });
                navigate('/StudentDashboard'); 
            } else {
                setError(response.data.message || 'Invalid login credentials. Please check your Student ID/Email and Password.');
            }
        } catch (err) {
            console.error('Login Error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Login failed! Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        setResetLoading(true);
        setResetMessage(null);

        try {
            const response = await axios.post(
                'http://localhost:7000/student/forgot-password',
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
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 1080,
                    minHeight: { xs: 'auto', md: 640 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '0.9fr 1fr' },
                    borderRadius: { xs: '20px', md: '28px' },
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    boxShadow: '0 28px 80px rgba(24, 54, 92, 0.18)',
                }}
            >
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 800, letterSpacing: 0.3 }}>
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
                            Learn, grow, and stay on track.
                        </Typography>
                        <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                            Sign in to view your classes, assignments, results, and campus updates.
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
                            STUDENT PORTAL
                        </Typography>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{ mt: 0.5, fontWeight: 800, color: primaryColor, letterSpacing: '-0.5px' }}
                        >
                            Welcome back
                        </Typography>
                        <Typography sx={{ mt: 1, color: '#687789' }}>
                            Sign in with your registered student email.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
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
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: '#8292a5' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fbfcfe' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: secondaryColor,
                                        borderWidth: '2px',
                                    },
                                }}
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
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: '#8292a5' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#fbfcfe' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: secondaryColor,
                                        borderWidth: '2px',
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                            <Link
                                component="button"
                                type="button"
                                onClick={openForgotPassword}
                                underline="none"
                                sx={{ color: secondaryColor, fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                            >
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
                                mt: 3.5,
                                py: 1.6,
                                background: `linear-gradient(100deg, ${secondaryColor}, #0057c2)`,
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: '12px',
                                textTransform: 'none',
                                boxShadow: '0 10px 22px rgba(0, 104, 214, 0.22)',
                                '&:hover': {
                                    background: 'linear-gradient(100deg, #0068d7, #004ba8)',
                                    boxShadow: '0 12px 26px rgba(0, 104, 214, 0.3)',
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign in to your dashboard'
                            )}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3.5, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            New to EduPulse?{' '}
                            <Link
                                onClick={() => navigate('/Register?role=student')}
                                sx={{ color: secondaryColor, fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Create a student account
                            </Link>
                        </Typography>
                        <Button
                            onClick={() => navigate('/AllLogin')}
                            startIcon={<ArrowBack />}
                            variant="text"
                            sx={{ mt: 1.5, color: '#718096', textTransform: 'none', fontWeight: 600 }}
                        >
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

export default Stulogin;
