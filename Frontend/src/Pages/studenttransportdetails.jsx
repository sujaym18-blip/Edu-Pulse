import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
    Box, Typography, Container, TextField, Button, 
    FormControl, InputLabel, Select, MenuItem, Grid, 
    CircularProgress, Alert, Paper 
} from '@mui/material';
import { DirectionsBus, AccessTime, Save, LocationOn, Person } from '@mui/icons-material';

const primaryColor = '#1e2a38';
const secondaryColor = '#007bff';
const pageBg = '#ffffff';
const cardShadow = '0 6px 18px rgba(0, 0, 0, 0.1)';

const TransportRegister = () => {
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    route: '',            
    stop: '',             
    arrivalTime: '',
    departureTime: '',
  });
  const [routes, setRoutes] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [error, setError] = useState('');
  const [loadingRoutes, setLoadingRoutes] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [submissionMessage, setSubmissionMessage] = useState(null);

  useEffect(() => {
    const Token = Cookies.get('token');
    if (Token) setToken(Token);
  }, []);

  useEffect(() => {
    setLoadingRoutes(true);
    axios
      .get('http://localhost:7000/viewroutes')
      .then((res) => {
        setRoutes(res.data.routes || []);
        setLoadingRoutes(false); 
      })
      .catch(() => {
        setError('Failed to fetch routes');
        setLoadingRoutes(false); 
      });
  }, []);

  const handleRouteChange = (e) => {
    const routeId = e.target.value;
    const selectedRoute = routes.find((route) => route._id === routeId);
    setFormData({
      route: selectedRoute?.routeNumber || '',
      stop: '',
      arrivalTime: '',
      departureTime: '',
    });
    setFilteredStops(selectedRoute?.stops || []);
    setSubmissionMessage(null);
  };

  const handleStopChange = (e) => {
    const stopId = e.target.value;
    const selectedStop = filteredStops.find((stop) => stop._id === stopId);
    setFormData({
      ...formData,
      stop: selectedStop?.stopName || '',
      arrivalTime: selectedStop?.arrivalTime || '',
      departureTime: selectedStop?.departureTime || '',
    });
    setSubmissionMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      await axios.post(
        'http://localhost:7000/studenttransportdetails',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setSubmissionMessage({ type: 'success', text: 'Transport details added successfully!' });
      setIsSubmitting(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Submission failed. Please try again.';
      setSubmissionMessage({ type: 'error', text: errorMessage });
      setIsSubmitting(false);
    }
  };

  const currentRoute = routes.find(r => r.routeNumber === formData.route);
  const currentStop = filteredStops.find(s => s.stopName === formData.stop);

  return (
    <Box sx={{ backgroundColor: pageBg, minHeight: '100vh', py: 6 }}>
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={10} 
          sx={{ 
            borderRadius: '16px', 
            p: { xs: 3, md: 5 }, 
            boxShadow: cardShadow, 
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <DirectionsBus 
              sx={{ fontSize: 50, color: secondaryColor, mb: 1 }} 
            />
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ fontWeight: 700, color: primaryColor }}
            >
              Transport Enrollment
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Select your preferred route and stop details.
            </Typography>
          </Box>

          {loadingRoutes && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} sx={{ color: secondaryColor }} />
              <Typography sx={{ ml: 1, color: primaryColor }}>Fetching transport routes...</Typography>
            </Box>
          )}
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {submissionMessage && (
            <Alert 
              severity={submissionMessage.type} 
              sx={{ mb: 2 }}
            >
              {submissionMessage.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required disabled={loadingRoutes}>
                  <InputLabel id="route-select-label">🚌 Select Route</InputLabel>
                  <Select
                    labelId="route-select-label"
                    value={currentRoute?._id || ''} 
                    label="🚌 Select Route"
                    onChange={handleRouteChange}
                    sx={{ 
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: secondaryColor, borderWidth: '2px' },
                    }}
                  >
                    <MenuItem value="">
                      <em>--- Choose Route ---</em>
                    </MenuItem>
                    {routes.map((route) => (
                      <MenuItem key={route._id} value={route._id}>
                        Route: {route.routeNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  disabled={!formData.route || filteredStops.length === 0}
                >
                  <InputLabel id="stop-select-label">📍 Select Stop</InputLabel>
                  <Select
                    labelId="stop-select-label"
                    value={currentStop?._id || ''}
                    label="📍 Select Stop"
                    onChange={handleStopChange}
                    sx={{ 
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: secondaryColor, borderWidth: '2px' },
                    }}
                  >
                    <MenuItem value="">
                      <em>--- Choose Stop ---</em>
                    </MenuItem>
                    {filteredStops.map((stop) => (
                      <MenuItem key={stop._id} value={stop._id}>
                        {stop.stopName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Arrival Time"
                  value={formData.arrivalTime || 'N/A'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <AccessTime sx={{ color: primaryColor, mr: 1 }} />,
                  }}
                  variant="outlined"
                  disabled={!formData.arrivalTime}
                  sx={{ backgroundColor: '#f9f9f9' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Departure Time"
                  value={formData.departureTime || 'N/A'}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <AccessTime sx={{ color: primaryColor, mr: 1 }} />,
                  }}
                  variant="outlined"
                  disabled={!formData.departureTime}
                  sx={{ backgroundColor: '#f9f9f9' }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!formData.route || !formData.stop || isSubmitting}
              sx={{
                mt: 4,
                backgroundColor: secondaryColor,
                '&:hover': { backgroundColor: '#0056b3', transform: 'translateY(-1px)' },
                py: 1.5,
                fontWeight: 700,
                transition: '0.3s',
                boxShadow: '0 4px 10px rgba(0, 123, 255, 0.4)',
              }}
            >
              {isSubmitting ? (
                <CircularProgress color="inherit" size={24} />
              ) : (
                <>
                  <Save sx={{ mr: 1 }} />
                  Finalize Transport Registration
                </>
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TransportRegister;
