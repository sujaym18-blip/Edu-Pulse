import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar,
    Typography, Button, ListItemIcon, Collapse, Divider, Paper, Grid,
    Tooltip, IconButton, CircularProgress, useMediaQuery
} from '@mui/material';
import {
    AccessTime, People, School, RateReview, BusAlert, Business, AttachMoney,
    NotificationsOutlined, LocalLibrary, ExpandLess, ExpandMore, Hotel, Logout,
    AccountCircle, Dashboard as DashboardIcon, MenuBook, BedroomChild, Menu as MenuIcon
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip,
    Legend, ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

const drawerWidth = 260;
const primaryColor = '#815f9b';
const sidebarBg = '#ffffff';
const contentBg = '#f2f2f8';
const purpleHover = '#e0e0f0';
const darkPurple = '#594473';

const API_BASE_URL = 'http://localhost:7000'; 

const GradientMetricCard = ({ title, value, icon, color1, color2, onClick, isLoading }) => (
    <Paper
        component="button"
        type="button"
        onClick={onClick}
        aria-label={`Open ${title}`}
        elevation={8}
        sx={{
            background: `linear-gradient(to right, ${color1}, ${color2})`,
            p: 3,
            borderRadius: '12px',
            color: '#ffffff',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            border: 0,
            textAlign: 'left',
            font: 'inherit',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: 12 },
            '&:focus-visible': { outline: '3px solid #1b2559', outlineOffset: 2 },
        }}
    >
        {React.cloneElement(icon, { sx: {
            position: 'absolute', top: 20, right: 20, fontSize: 60, opacity: 0.3, color: '#fff'
        } })}

        <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1, zIndex: 10 }}>
            {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, zIndex: 10 }}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : value === null ? '—' : value.toLocaleString()}
            {title.includes("Sales") && (
                <Typography component="span" variant="h3" sx={{ fontWeight: 800 }}>
                    <AttachMoney sx={{ fontSize: '1.8rem', verticalAlign: 'top', ml: 0.5 }} />
                </Typography>
            )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, zIndex: 10 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, mr: 1 }}>
                View details
            </Typography>
        </Box>
    </Paper>
);

const VisitSalesChart = ({ chartTitle, data, isLoading, error, year }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: { usePointStyle: true, boxWidth: 8, padding: 20, color: darkPurple }
            },
            title: { display: false },
            chartTooltip: { mode: 'index', intersect: false },
        },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { drawBorder: false, color: '#e5e5e5' } },
            x: { grid: { display: false } },
        },
    };

    return (
        <Paper elevation={8} sx={{ p: 3, borderRadius: '12px', height: '100%', bgcolor: '#ffffff' }}>
            <Typography variant="h6" sx={{ color: darkPurple, fontWeight: 600, mb: 3 }}>
                {chartTitle}{year ? ` (${year})` : ''}
            </Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
                    <CircularProgress sx={{ color: primaryColor }} />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : data.datasets.every(dataset => dataset.data.every(value => value === null)) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
                    <Typography color="text.secondary">No attendance records are available for this year.</Typography>
                </Box>
            ) : (
                <Box sx={{ height: '350px' }}>
                    <Bar data={data} options={options} />
                </Box>
            )}
        </Paper>
    );
};

const TrafficSourcesChart = ({ chartTitle, data, isLoading, error }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 12,
                    font: { size: 11 },
                    color: darkPurple,
                    generateLabels: (chart) => {
                        const labels = chart.data.labels;
                        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentages = chart.data.datasets[0].data.map(val => Math.round(val / (total || 1) * 100));
                        const colors = chart.data.datasets[0].backgroundColor;

                        return labels.map((label, i) => ({
                            text: `${label} (${percentages[i]}%)`,
                            fillStyle: colors[i],
                            hidden: false,
                            index: i
                        }));
                    }
                }
            },
            title: { display: false },
            chartTooltip: { enabled: true },
        },
    };

    return (
        <Paper elevation={8} sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px', height: '100%', minHeight: 440, bgcolor: '#ffffff' }}>
            <Typography variant="h6" sx={{ color: darkPurple, fontWeight: 600, mb: 3 }}>
                {chartTitle}
            </Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
                    <CircularProgress sx={{ color: primaryColor }} /> 
                    <Typography variant="body2" sx={{ ml: 2, color: darkPurple }}>Loading feedback data...</Typography>
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : data.datasets[0].data.every(count => count === 0) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
                    <Typography color="text.secondary">No feedback ratings have been submitted yet.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '350px', mx: 'auto' }}>
                    <Doughnut data={data} options={options} />
                </Box>
            )}
        </Paper>
    );
};

const RecentNoticesAlerts = ({ notices, error, onViewAll }) => (
    <Paper
        elevation={8}
        sx={{
            p: { xs: 2, md: 3 },
            borderRadius: '12px',
            height: '100%',
            minHeight: 440,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#ffffff',
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsOutlined sx={{ color: darkPurple, mr: 1, fontSize: { xs: 25, sm: 30 } }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: darkPurple }}>
                Recent Official Notices
            </Typography>
        </Box>
        <Divider sx={{ mb: 2, borderColor: '#eee' }} />
        <List disablePadding sx={{ flex: 1, minHeight: 0, maxHeight: 350, overflowY: 'auto' }}>
            {notices === null ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress size={30} sx={{ color: primaryColor }} /> 
                    <Typography variant="body2" sx={{ mt: 1, color: darkPurple }}>Loading notices...</Typography>
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : notices.length > 0 ? (
                notices.slice(0, 5).map((notice) => {
                    const noticeDate = notice.issueDate
                        ? new Date(notice.issueDate).toLocaleDateString()
                        : 'N/A';
                    return (
                    <ListItem
                        key={notice._id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '35px minmax(0, 1fr) auto',
                            alignItems: 'center',
                            gap: 1,
                            borderBottom: '1px solid #f2f2f8',
                            '&:last-child': { borderBottom: 'none' },
                            py: 1.5,
                            px: { xs: 0.5, sm: 1 },
                            '&:hover': { backgroundColor: '#f9f9f9' },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 35 }}><NotificationsOutlined sx={{ color: primaryColor }} /></ListItemIcon>
                        <ListItemText
                            primary={notice.title || 'No Title'}
                            secondary={notice.content || 'No description'}
                            primaryTypographyProps={{
                                fontWeight: 600,
                                color: darkPurple,
                                noWrap: true,
                            }}
                            secondaryTypographyProps={{
                                sx: {
                                    display: '-webkit-box',
                                    overflow: 'hidden',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    overflowWrap: 'anywhere',
                                },
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', pl: 0.5 }}>
                            {noticeDate}
                        </Typography>
                    </ListItem>
                    );
                })
            ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" sx={{ mt: 1, color: darkPurple }}>No recent notices found.</Typography>
                </Box>
            )}
        </List>
        <Button size="small" variant="contained" onClick={onViewAll} sx={{ alignSelf: 'flex-start', mt: 2, bgcolor: primaryColor, '&:hover': { bgcolor: darkPurple } }}>View All Notices</Button>
    </Paper>
);

const SimpleMetricCard = ({ title, value, icon, bgColor }) => (
    <Paper
        elevation={4}
        sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: bgColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
        }}
    >
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {value === null || value === "" ? <CircularProgress size={24} color="inherit" /> : `${value.toLocaleString()}%`}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', mt: 1 }}>
                {title}
            </Typography>
        </Box>
        {React.cloneElement(icon, { sx: { fontSize: 40, opacity: 0.8 } })}
    </Paper>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:899px)');
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // API data states
    const [metrics, setMetrics] = useState({
        booksIssued: null, 
        totalBooks: null,
        totalRooms: null,
        roomsOccupied: null, 
        totalStudents: null,
        totalStaff: null,
        hostelOccupancy: null, 
        transportOpted: 85,
        libraryMembership: 90,
    });
    const [notices, setNotices] = useState(null); 
    const [noticesError, setNoticesError] = useState('');
    const [feedbackData, setFeedbackData] = useState(null);
    const [feedbackError, setFeedbackError] = useState('');
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [loadingFeedback, setLoadingFeedback] = useState(true);
    const [metricsError, setMetricsError] = useState('');
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [attendanceStatsError, setAttendanceStatsError] = useState('');
    const [loadingAttendanceStats, setLoadingAttendanceStats] = useState(true);

    const fetchData = useCallback(async (url) => {
        try {
            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) {
                console.error(`Fetch failed with status: ${response.status} from ${url}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return null;
        }
    }, []);


    const handleFetchMetricsAndNotices = useCallback(async () => {
        setLoadingMetrics(true);
        const [metricsResponse, noticesResponse] = await Promise.all([
            fetchData(`${API_BASE_URL}/dashboard`),
            fetchData(`${API_BASE_URL}/viewnotice`),
        ]);

        if (metricsResponse?.success && metricsResponse.data) {
            const totalRooms = metricsResponse.data.total ?? 0;
            const roomsOccupied = metricsResponse.data.roomsOccupied ?? 0;
            const occupancy = totalRooms > 0 ? Math.round((roomsOccupied / totalRooms) * 100) : 0;

            setMetrics(prevMetrics => ({
                ...prevMetrics,
                booksIssued: metricsResponse.data.issued ?? 0,
                totalBooks: metricsResponse.data.totalStock ?? 0,
                totalRooms,
                totalStudents: metricsResponse.data.students ?? 0,
                totalStaff: metricsResponse.data.staff ?? 0,
                roomsOccupied,
                hostelOccupancy: occupancy,
            }));
            setMetricsError('');
        } else {
            setMetricsError('Unable to load dashboard totals. Please try again.');
        }

        if (noticesResponse?.success && Array.isArray(noticesResponse.notices)) {
            const sortedNotices = [...noticesResponse.notices].sort(
                (first, second) => new Date(second.issueDate || 0) - new Date(first.issueDate || 0)
            );
            setNotices(sortedNotices);
            setNoticesError('');
        } else {
            setNotices([]);
            setNoticesError('Unable to load official notices. Please try again.');
        }

        setLoadingMetrics(false);
    }, [fetchData]);

    useEffect(() => {
        const refreshDashboardData = () => {
            handleFetchMetricsAndNotices();
        };
        refreshDashboardData();
        window.addEventListener('focus', refreshDashboardData);
        const refreshInterval = window.setInterval(refreshDashboardData, 60_000);

        return () => {
            window.removeEventListener('focus', refreshDashboardData);
            window.clearInterval(refreshInterval);
        };
    }, [handleFetchMetricsAndNotices]);

    useEffect(() => {
        let active = true;
        const fetchAttendanceStats = async () => {
            setLoadingAttendanceStats(true);
            try {
                const response = await fetch(`${API_BASE_URL}/admin/dashboard/attendance`, {
                    credentials: 'include',
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.msg || 'Unable to load attendance statistics.');
                }
                if (active) {
                    setAttendanceStats(result.data);
                    setAttendanceStatsError('');
                }
            } catch (error) {
                console.error('Error fetching dashboard attendance statistics:', error);
                if (active) {
                    setAttendanceStatsError(error.message || 'Unable to load attendance statistics.');
                }
            } finally {
                if (active) setLoadingAttendanceStats(false);
            }
        };

        fetchAttendanceStats();
        window.addEventListener('focus', fetchAttendanceStats);
        const refreshInterval = window.setInterval(fetchAttendanceStats, 60_000);

        return () => {
            active = false;
            window.removeEventListener('focus', fetchAttendanceStats);
            window.clearInterval(refreshInterval);
        };
    }, []);

    const handleFetchFeedback = useCallback(async () => {
        setLoadingFeedback(true);
        try {
            const response = await fetch(`${API_BASE_URL}/feedback/ratings`, { credentials: 'include' });
            const result = await response.json();
            if (!response.ok || !result.success || !Array.isArray(result.data)) {
                throw new Error(result.msg || 'Unable to load feedback ratings.');
            }
            setFeedbackData(result.data);
            setFeedbackError('');
        } catch (error) {
            console.error('API Fetch Error (Feedback):', error);
            setFeedbackError(error.message || 'Unable to load feedback ratings.');
        } finally {
            setLoadingFeedback(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const refreshFeedback = async () => {
            if (active) await handleFetchFeedback();
        };
        refreshFeedback();
        window.addEventListener('focus', refreshFeedback);
        const refreshInterval = window.setInterval(refreshFeedback, 60_000);

        return () => {
            active = false;
            window.removeEventListener('focus', refreshFeedback);
            window.clearInterval(refreshInterval);
        };
    }, [handleFetchFeedback]);

    const [openStaff, setOpenStaff] = useState(false);
    const [openStudent, setOpenStudent] = useState(false);
    const [openDepartment, setOpenDepartment] = useState(false);
    const [openSalary, setOpenSalary] = useState(false);
    const [openLibrary, setOpenLibrary] = useState(false);
    const [openNotice, setOpenNotice] = useState(false);
    const [openHostel, setOpenHostel] = useState(false);
    const [openTransport, setOpenTransport] = useState(false);

    const coreMetricsConfig = [
        { title: "Books Issued", value: metrics.booksIssued, path: '/AdminIssuedBooks', color1: '#ff5e62', color2: '#ff9966', icon: <MenuBook /> },
        { title: "Total Books", value: metrics.totalBooks, path: '/ViewBook2', color1: '#4a92e8', color2: '#89b6f8', icon: <LocalLibrary /> },
        { title: "Total Rooms", value: metrics.totalRooms, path: '/Viewroom', color1: '#2af598', color2: '#009efd', icon: <BedroomChild /> },
        { title: "No. of Students", value: metrics.totalStudents, path: '/ViewStudent', color1: '#3ddcff', color2: '#6fe8e8', icon: <School /> },
        { title: "No. of Staff", value: metrics.totalStaff, path: '/ViewStaff', color1: '#ffa800', color2: '#ffcc66', icon: <People /> },
    ];
    const extraMetricsConfig = [
        { title: "Hostel Occupancy", value: metrics.hostelOccupancy, bgColor: primaryColor, icon: <Hotel /> },
        { title: "Transport Opted", value: metrics.transportOpted, bgColor: '#ff9966', icon: <BusAlert /> },
        { title: "Library Membership", value: metrics.libraryMembership, bgColor: '#4a92e8', icon: <LocalLibrary /> },
    ];

    const attendanceChartData = {
        labels: attendanceStats?.labels || [],
        datasets: [
            { label: 'Staff Attendance %', data: attendanceStats?.staff || [], backgroundColor: primaryColor, borderRadius: 4, barPercentage: 0.8 },
            { label: 'Student Attendance %', data: attendanceStats?.students || [], backgroundColor: '#ff9966', borderRadius: 4, barPercentage: 0.8 },
        ],
    };
    const dynamicFeedbackChartData = feedbackData ? {
        labels: feedbackData.map(item => item.rating), 
        datasets: [
            {
                data: feedbackData.map(item => item.count),
                backgroundColor: ['#ff5e62', '#4a92e8', '#2af598'], 
                hoverBackgroundColor: ['#e04a52', '#3a7ac8', '#1fc780'],
                borderWidth: 0,
            },
        ],
    } : { labels: [], datasets: [{ data: [] }] };

    const navigateTo = (route) => {
        navigate(route);
        if (isMobile) setMobileDrawerOpen(false);
    };
    const toggleNotice = () => setOpenNotice(!openNotice);
    const toggleLibrary = () => setOpenLibrary(!openLibrary);
    const toggleDepartment = () => setOpenDepartment(!openDepartment);
    const toggleSalary = () => setOpenSalary(!openSalary);
    const toggleStaff = () => setOpenStaff(!openStaff);
    const toggleStudent = () => setOpenStudent(!openStudent);
    const toggleHostel = () => setOpenHostel(!openHostel);
    const toggleTransport = () => setOpenTransport(!openTransport);


    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: '/Dashboard', alwaysOpen: true },
        { text: "Staff Attendance", icon: <AccessTime />, path: '/StaffAttendance' },
        {
            text: "Staff Details", icon: <People />, onClick: toggleStaff, open: openStaff,
            subItems: [
                { text: "Staff Registration", path: '/StaffRegistration' },
                { text: "View Staff", path: '/ViewStaff' }
            ]
        },
        {
            text: "Student Details", icon: <School />, onClick: toggleStudent, open: openStudent,
            subItems: [
                { text: "View Student", path: '/ViewStudent' },
                { text: "Student Registration", path: '/StudentRegistration' }
            ]
        },
        { text: "Feedback", icon: <RateReview />, path: '/ViewFeedback' }, 

        {
            text: "Department", icon: <Business />, onClick: toggleDepartment, open: openDepartment,
            subItems: [
                { text: "Department Register", path: '/DeptRegistration' },
                { text: "View Department", path: '/ViewDepartment' }
            ]
        },
        {
            text: "Salary", icon: <AttachMoney />, onClick: toggleSalary, open: openSalary,
            subItems: [
                { text: "Salary Register", path: '/SalaryRegistration' },
                { text: "View Salary", path: '/ViewSalary' }
            ]
        },
        {
            text: "Notice", icon: <NotificationsOutlined />, onClick: toggleNotice, open: openNotice,
            subItems: [
                { text: "Drop Notice", path: '/Notice' },
                { text: "View Notices", path: '/ViewNotice2' } 
            ]
        },
        {
            text: "Hostel", icon: <Hotel />, onClick: toggleHostel, open: openHostel,
            subItems: [
                { text: "Add Room", path: '/addroom' },
                { text: "View Room", path: '/Viewroom' }
            ]
        },
        {
            text: "Library", icon: <LocalLibrary />, onClick: toggleLibrary, open: openLibrary,
            subItems: [
                { text: "Add Book", path: '/AddBook' },
                { text: "View Book", path: '/ViewBook2' }
            ]
        },
        {
            text: "Transport", icon: <BusAlert />, onClick: toggleTransport, open: openTransport,
            subItems: [
                { text: "Update Bus Condition", path: '/busconditionupdate' },
                { text: "View Bus Condition", path: '/busconditionview' },
                { text: "Driver Details", path: '/driverdetail' },
                { text: "View Drivers", path: '/driverdetailview' },
                { text: "Add Routes", path: '/addroute' },
                { text: "View Routes", path: '/viewroutes'},
                { text: "View Student (Transport)", path: '/viewallstudenttransport'},
                { text: "Track Live Bus", path: '/liveTracker'}
            ]
        },
        { text: "Admin Profile", icon: <AccountCircle />, path: '/Adminprofile' },
    ];

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: contentBg }}>

            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={!isMobile || mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
                sx={{
                    width: isMobile ? 0 : drawerWidth, flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: { xs: 'min(260px, 85vw)', md: drawerWidth },
                        boxSizing: "border-box",
                        backgroundColor: sidebarBg,
                        color: darkPurple,
                        borderRight: '1px solid #e0e0e0',
                        overflowX: 'hidden',
                    },
                }}
            >
                <Toolbar sx={{ backgroundColor: sidebarBg, py: 2, justifyContent: 'center', borderBottom: '1px solid #eee' }}>
                    <Typography variant="h4" sx={{ color: primaryColor, fontWeight: 900, letterSpacing: 1 }}>
                        EduPulse
                    </Typography>
                </Toolbar>

                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <img
                        src="https://i.pravatar.cc/50?img=68"
                        alt="Profile"
                        style={{ borderRadius: '50%', width: 40, height: 40, marginRight: 10 }}
                    />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkPurple }}>
                            Admin User
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#aaa' }}>
                            ERP Manager
                        </Typography>
                    </Box>
                </Box>

                <List onClick={() => { if (isMobile) setMobileDrawerOpen(false); }} sx={{ pt: 0, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: primaryColor, borderRadius: '4px' } }}>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                button
                                onClick={item.path ? () => navigateTo(item.path) : item.onClick}
                                sx={{
                                    py: 1.2,
                                    px: 2,
                                    '&:hover': { backgroundColor: purpleHover },
                                    ...(item.path === '/' && { backgroundColor: purpleHover, borderLeft: `5px solid ${primaryColor}` })
                                }}
                            >
                                <ListItemIcon sx={{ color: primaryColor }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontWeight: 500, fontSize: '0.95rem' } }} />
                                {item.subItems && (item.open ? <ExpandLess sx={{ color: primaryColor }}/> : <ExpandMore sx={{ color: primaryColor }}/>)}
                            </ListItem>
                            {item.subItems && (
                                <Collapse in={item.open} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.subItems.map((subItem, subIndex) => (
                                            <ListItem key={subIndex} button onClick={() => navigateTo(subItem.path)} sx={{ pl: 6, py: 0.8, backgroundColor: '#f9f9f9', '&:hover': { backgroundColor: purpleHover } }}>
                                                <ListItemText primary={subItem.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    ))}
                </List>
                <ListItem button onClick={() => navigateTo('/logout')} sx={{ position: 'sticky', bottom: 0, mt: 'auto', borderTop: '1px solid #eee', bgcolor: sidebarBg, '&:hover': { backgroundColor: purpleHover } }}>
                    <ListItemIcon sx={{ color: primaryColor }}><Logout /></ListItemIcon>
                    <ListItemText primary="Logout" sx={{ '& .MuiListItemText-primary': { fontWeight: 500, fontSize: '0.95rem', color: primaryColor } }} />
                </ListItem>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    overflowY: 'auto',
                    pt: 3,
                }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isMobile && (
                                <IconButton
                                    aria-label="Open navigation menu"
                                    onClick={() => setMobileDrawerOpen(true)}
                                    sx={{ mr: 1, color: primaryColor }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}
                            <DashboardIcon sx={{ color: primaryColor, mr: 1.5, fontSize: 30 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: darkPurple }}>
                                Dashboard Overview
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {coreMetricsConfig.map((metric, index) => (
                            <Grid item xs={12} sm={6} lg={4} key={index}>
                                <GradientMetricCard
                                    title={metric.title}
                                    value={metric.value}
                                    icon={metric.icon}
                                    color1={metric.color1}
                                    color2={metric.color2}
                                    onClick={() => navigateTo(metric.path)}
                                    isLoading={loadingMetrics}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    {metricsError && <Alert severity="error" sx={{ mb: 3 }}>{metricsError}</Alert>}

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} lg={6}>
                            <VisitSalesChart
                                chartTitle="Staff and Student Attendance Statistics"
                                data={attendanceChartData}
                                isLoading={loadingAttendanceStats}
                                error={attendanceStatsError}
                                year={attendanceStats?.year}
                            />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <RecentNoticesAlerts
                                notices={notices}
                                error={noticesError}
                                onViewAll={() => navigateTo('/ViewNotice2')}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={6}>
                            <TrafficSourcesChart
                                chartTitle="Overall Feedback Distribution (1-10 Rating Scale)"
                                data={dynamicFeedbackChartData}
                                isLoading={loadingFeedback}
                                error={feedbackError}
                            />
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            <Paper elevation={8} sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px', height: '100%', bgcolor: '#ffffff' }}>
                                <Typography variant="h6" sx={{ color: darkPurple, fontWeight: 700, mb: 2 }}>
                                    Facility Metrics (%)
                                </Typography>
                                <Grid container spacing={2}>
                                    {extraMetricsConfig.map((metric, index) => (
                                        <Grid item xs={12} sm={4} key={index}>
                                            <SimpleMetricCard
                                                title={metric.title}
                                                value={metric.value}
                                                icon={metric.icon}
                                                bgColor={metric.bgColor}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>

                </Box>

                <Box
                    component="footer"
                    sx={{
                        width: '100%',
                        py: 1,
                        px: 3,
                        backgroundColor: '#ffffff',
                        color: darkPurple,
                        textAlign: 'center',
                        borderTop: '1px solid #ddd'
                    }}
                >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        &copy; {new Date().getFullYear()} EduPulse ERP Admin Panel. All rights reserved. | By Dolisha Gandhi.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;