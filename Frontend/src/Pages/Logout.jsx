import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cookie from 'js-cookie';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            // Detect which role is logged in based on which cookie exists
            const adminToken = cookie.get('emtoken');
            const staffToken = cookie.get('emstoken');
            const studentToken = cookie.get('token');

            try {
                if (adminToken) {
                    await axios.get('http://localhost:7000/adminlogout', { withCredentials: true });
                } else if (staffToken) {
                    await axios.get('http://localhost:7000/stafflogout', { withCredentials: true });
                } else if (studentToken) {
                    await axios.get('http://localhost:7000/studentlogout', { withCredentials: true });
                }
            } catch (err) {
                // Even if the API call fails, proceed with clearing cookies client-side
                console.error('Logout API error:', err.message);
            }

            // Always clear all cookies client-side regardless of API response
            cookie.remove('emtoken');
            cookie.remove('emstoken');
            cookie.remove('token');

            // Redirect to the login selector page
            navigate('/AllLogin');
        };

        performLogout();
    }, [navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
            }}
        >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
                Logging out...
            </Typography>
        </Box>
    );
};

export default Logout;
