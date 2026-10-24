import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Button, CssBaseline, Grid, Card, CardContent, 
    CardMedia, Paper 
} from '@mui/material';
import { School, AccountCircle, People, AdminPanelSettings, PersonAdd } from '@mui/icons-material';

import studentImage from '../assets/student.webp';
import teacherImage from '../assets/teacher.png';
import adminImage from '../assets/admin.png';
import backgroundImage from '../assets/pic9.jpeg';

const primaryColor = '#1e2a38';
const secondaryColor = '#007bff';
const lightBg = '#f4f6f9';

const AllLogin = () => {
    const navigate = useNavigate();

    const handleLogin = (userType) => {
        switch (userType) {
            case 'Admin':
                navigate('/AdminLogin');
                break;
            case 'Staff':
                navigate('/StaffLogin');
                break;
            case 'Student':
                navigate('/StudentLogin');
                break;
            default:
                break;
        }
    };

    const loginOptions = [
        { 
            type: 'Admin', 
            image: adminImage, 
            label: 'Admin', 
            icon: <AdminPanelSettings sx={{ fontSize: 40, color: '#dc3545' }} />,
            description: 'Manage the system and institutional data.',
            path: '/AdminLogin'
        },
        { 
            type: 'Staff', 
            image: teacherImage, 
            label: 'Staff / Teacher', 
            icon: <People sx={{ fontSize: 40, color: '#ffc107' }} />,
            description: 'Handle attendance, assignments, and reporting.',
            path: '/StaffLogin'
        },
        { 
            type: 'Student', 
            image: studentImage, 
            label: 'Student', 
            icon: <AccountCircle sx={{ fontSize: 40, color: secondaryColor }} />,
            description: 'Access academic records, fees, and communication.',
            path: '/StudentLogin'
        },
    ];

    const LoginCard = ({ type, icon, label, description, path }) => (
        <Card
            onClick={() => handleLogin(type)}
            elevation={6}
            sx={{
                borderRadius: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 2,
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                    borderBottom: `5px solid ${secondaryColor}`,
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>{icon}</Box>
                <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ fontWeight: 700, color: primaryColor, mb: 1 }}
                >
                    {label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
            <Button 
                variant="contained" 
                sx={{ 
                    mt: 2, 
                    backgroundColor: primaryColor, 
                    '&:hover': { backgroundColor: secondaryColor } 
                }}
            >
                Proceed to Login
            </Button>
        </Card>
    );

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                backgroundColor: lightBg,
                backgroundImage: `url(${backgroundImage})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 3 
            }}
        >
            <CssBaseline />
            
            <Paper 
                elevation={10} 
                sx={{ 
                    p: { xs: 3, md: 6 }, 
                    borderRadius: '20px', 
                    maxWidth: 1100, 
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <School sx={{ fontSize: 60, color: secondaryColor, mb: 1 }} />
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ fontWeight: 800, color: primaryColor, mb: 1 }}
                    >
                        Welcome to ERP Login Portal
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Please select your role to continue.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {loginOptions.map((option) => (
                        <Grid item xs={12} sm={6} md={4} key={option.type}>
                            <LoginCard {...option} />
                        </Grid>
                    ))}
                </Grid>

                <Box 
                    sx={{ 
                        mt: 5, 
                        p: { xs: 2.5, sm: 3 }, 
                        borderRadius: '16px', 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: primaryColor, fontSize: '1.05rem' }}>
                            Don't have an account yet?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Register now as a Student, Staff Member, or Administrator.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/Register')}
                        startIcon={<PersonAdd />}
                        sx={{ 
                            backgroundColor: secondaryColor,
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                            '&:hover': { backgroundColor: '#0056b3' }
                        }}
                    >
                        Create Account / Register
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AllLogin;
