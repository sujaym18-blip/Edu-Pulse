import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar,
    Typography, IconButton, CssBaseline, Button, Collapse,
    ListItemIcon, Divider, Paper, Grid, Card, CardContent,
    CircularProgress, Alert, Chip, Badge, useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon, School, Assignment, NotificationsOutlined,
    ExpandLess, ExpandMore, AccountCircle, Home, Grading,
    CalendarToday, EmojiObjects,
    Campaign as NoticeIcon, FiberManualRecord, DirectionsBus,
    Payment, Hotel, LocalLibrary, RateReview
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format } from 'date-fns';

const drawerWidth = 300;
const primaryColor = '#1e2a38';
const lightBg = '#f4f6f9';
const secondaryColor = '#00bcd4';

const METRIC_COLORS = {
    weeklySales: { icon: EmojiObjects, color: '#4c8bf5', bgColor: 'rgba(76, 139, 245, 0.1)' },
    newUsers: { icon: School, color: '#3ecf8e', bgColor: 'rgba(62, 207, 142, 0.1)' },
    itemOrders: { icon: Grading, color: '#f5b849', bgColor: 'rgba(245, 184, 73, 0.1)' },
    bugReports: { icon: NotificationsOutlined, color: '#f54c7d', bgColor: 'rgba(245, 76, 125, 0.1)' },
};

const MetricCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card
        elevation={0}
        sx={{
            borderRadius: '12px',
            minHeight: 150,
            backgroundColor: bgColor,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-3px)' }
        }}
    >
        <CardContent>
            <Box sx={{ color: color, mb: 1.5, fontSize: 32 }}>
                {React.createElement(Icon, { fontSize: 'inherit' })}
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: color }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: color, opacity: 0.8, mt: 1 }}>
                {title}
            </Typography>
        </CardContent>
    </Card>
);

const ModernCalendarWidget = () => {
    const [value, setValue] = useState(new Date());

    return (
        <Paper elevation={3} sx={{ borderRadius: '16px', p: 1.5, height: 400 }}>
            <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 600, px: 1, pt: 1, mb: 1 }}>
                Academic Calendar
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                    sx={{
                        width: '100%',
                        '& .MuiPickersCalendarHeader-root': { mb: 0.5, px: 2 },
                        '& .MuiDayCalendar-weekContainer': { px: 1 },
                        '& .MuiDayCalendar-weekDayLabel': { color: secondaryColor, fontWeight: 600 },
                        '& .MuiPickersDay-root': {
                            '&.Mui-selected': { backgroundColor: secondaryColor, color: 'white' },
                            '&:hover': { backgroundColor: '#e0f7fa' }
                        }
                    }}
                />
            </LocalizationProvider>
        </Paper>
    );
};

const CurrentStatusWidget = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = format(currentTime, 'EEEE, MMM do');
    const formattedYear = format(currentTime, 'yyyy');

    return (
        <Paper
            elevation={3}
            sx={{
                borderRadius: '16px',
                p: 3,
                height: 400,
                backgroundColor: secondaryColor,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: `linear-gradient(135deg, ${secondaryColor} 0%, #00838f 100%)`
            }}
        >
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Current Status
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                    {formattedYear}
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: 2 }}>
                    {format(currentTime, 'hh:mm')}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    {format(currentTime, 'ss a')} IST
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formattedDate}
                </Typography>
            </Box>
        </Paper>
    );
};


const NoticeWidget = ({ notices, loading, error }) => {
    return (
        <Paper elevation={1} sx={{ borderRadius: '12px', p: 3, minHeight: 300 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NoticeIcon sx={{ color: METRIC_COLORS.bugReports.color, mr: 1, fontSize: 32 }} />
                <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 600 }}>
                    Latest Student Notices
                </Typography>
                <Badge badgeContent={notices.length} color="error" sx={{ ml: 2 }} />
            </Box>
            <Divider sx={{ mb: 2 }}/>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}> <CircularProgress /> </Box>
            )}
            {error && <Alert severity="error">Notice data is unavailable.</Alert>}
            {!loading && !error && (
                <List dense>
                    {notices.length > 0 ? (
                        notices.map((notice) => (
                            <ListItem
                                key={notice._id}
                                secondaryAction={
                                    <Chip
                                        label={notice.type || "Notice"}
                                        size="small"
                                        color={notice.type === 'Urgent' ? 'error' : notice.type === 'Event' ? 'warning' : 'info'}
                                    />
                                }
                                sx={{ borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}
                            >
                                <ListItemIcon>
                                    <FiberManualRecord sx={{ fontSize: 10, color: notice.type === 'Urgent' ? METRIC_COLORS.bugReports.color : METRIC_COLORS.newUsers.color }}/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={notice.title}
                                    secondary={`Date: ${notice.issueDate ? format(new Date(notice.issueDate), 'MMM d, yyyy') : 'Not specified'}${notice.content ? ` — ${notice.content}` : ''}`}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>No new notices found.</Alert>
                    )}
                </List>
            )}
        </Paper>
    );
};


const StudentDashboard = () => {
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState(false);
    const isMobile = useMediaQuery('(max-width:899px)');
    const [dashboard, setDashboard] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState('');

    const [openAcademics, setOpenAcademics] = useState(false);
    const [openTransport, setOpenTransport] = useState(false);
    const [openLibrary, setOpenLibrary] = useState(false);
    const [openHostel, setOpenHostel] = useState(false);

    const navigateTo = (route) => { navigate(route); };
    const toggleDrawer = () => setOpenDrawer(!openDrawer);
    const toggleAcademics = () => setOpenAcademics(!openAcademics);
    const toggleTransport = () => setOpenTransport(!openTransport);
    const toggleLibrary = () => setOpenLibrary(!openLibrary);
    const toggleHostel = () => setOpenHostel(!openHostel);
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await axios.get('http://localhost:7000/student/dashboard', {
                    withCredentials: true,
                });
                setDashboard(response.data.dashboard);
            } catch (error) {
                setDashboardError(error.response?.data?.msg || 'Unable to load dashboard data.');
            } finally {
                setDashboardLoading(false);
            }
        };

        loadDashboard();
    }, []);

    useEffect(() => {
        const scriptId = 'noupe-embed-script';
        const scriptUrl = 'https://www.noupe.com/embed/019b3ce8eb9373fbbd8c28bfada2fa47808e.js';

        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);

            return () => {
                const existingScript = document.getElementById(scriptId);
                if (existingScript) {
                    document.body.removeChild(existingScript);
                }
            };
        }
    }, []); 

    const menuItems = [
        { text: "Dashboard", icon: <Home />, path: '/StudentDashboard', alwaysOpen: true },
        { text: "Student Profile", icon: <AccountCircle />, path: '/StudentProfile' },
        { text: "View Notices", path: '/ViewNotices', icon: <NotificationsOutlined /> },

        {
            text: "Academics",
            icon: <Assignment />,
            onClick: toggleAcademics,
            open: openAcademics,
            subItems: [
                { text: "View Tests", path: '/viewTest' },
                { text: "View Report Card", path: '/reportcard' },
                { text: "View Assignments", path: '/ViewAssignment' },
                { text: "Assign Feedback", path: '/ViewAssFeed' },
            ]
        },

        {
            text: "Transport",
            icon: <DirectionsBus />,
            onClick: toggleTransport,
            open: openTransport,
            subItems: [
                { text: "Add Transport Details", path: '/studenttransportdetails' },
                { text: "Student Transport Details", path: '/StudentTransportAllDetails'},
                { text: "Live Tracking", path: '/liveTracker' }
            ]
        },
        { text: "Fee Payment", icon: <Payment />, path: '/payfee' },

        {
            text: "Hostel Registration",
            icon: <Hotel />,
            onClick: toggleHostel,
            open: openHostel,
            subItems:[
                {text:"Add Hostel Details", path:'/hostelregistration'},
                {text:"Hostel Fees Payment",path:'/hostelfees'},
            ]
        },

        {
            text: "Library",
            icon: <LocalLibrary />,
            onClick: toggleLibrary,
            open: openLibrary,
            subItems:[
                {text:"View Books", path:'/ViewBook'},
                {text:"Issued Books",path:'/issued'},
            ]
        },
        { text: "Feedback", path: '/Feedback', icon: <RateReview /> },
    ];


    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <CssBaseline />

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'white',
                    color: primaryColor,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    borderBottom: '1px solid #e0e0e0',
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    ml: { xs: 0, md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={toggleDrawer}
                        sx={{ mr: 2, display: { xs: 'inline-flex', md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        Student Dashboard
                    </Typography>

                    <AccountCircle sx={{ color: primaryColor, mr: 1 }} />
                    <Button color="inherit" onClick={() => navigateTo('/logout')}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? openDrawer : true}
                onClose={() => setOpenDrawer(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: { xs: 'min(300px, 85vw)', md: drawerWidth },
                        boxSizing: "border-box",
                        backgroundColor: 'white',
                        color: primaryColor,
                        borderRight: '1px solid #e0e0e0',
                    },
                }}
            >
                <Toolbar sx={{ backgroundColor: 'white', borderBottom: '1px solid #eee', justifyContent: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: primaryColor }}>
                        <span style={{ color: secondaryColor }}>Edu</span>Pulse
                    </Typography>
                </Toolbar>
                <List onClick={() => { if (isMobile) setOpenDrawer(false); }}>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                button
                                onClick={item.path ? () => navigateTo(item.path) : item.onClick}
                                sx={{
                                    py: 1.5,
                                    transition: 'background-color 0.2s',
                                    '&:hover': { backgroundColor: lightBg },
                                    ...(item.path === '/' && { backgroundColor: lightBg, color: primaryColor, fontWeight: 700 })
                                }}
                            >
                                <ListItemIcon sx={{ color: item.path === '/' ? primaryColor : '#888' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontWeight: item.path === '/' ? 700 : 500, fontSize: '0.95rem' } }} />
                                {item.subItems && (item.open ? <ExpandLess sx={{ color: primaryColor }}/> : <ExpandMore sx={{ color: '#888' }}/>)}
                            </ListItem>
                            {item.subItems && (
                                <Collapse in={item.open} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.subItems.map((subItem, subIndex) => (
                                            <ListItem key={subIndex} button sx={{ pl: 4, py: 1, '&:hover': { backgroundColor: '#f0f0f0' } }} onClick={() => navigateTo(subItem.path)}>
                                                <ListItemText primary={subItem.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem', color: '#666' } }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    mt: 8,
                    backgroundColor: lightBg,
                    overflowY: 'auto',
                    minWidth: 0,
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                {dashboardError && <Alert severity="error" sx={{ mb: 2 }}>{dashboardError}</Alert>}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard title="Attendance this week" value={dashboardLoading ? '...' : dashboardError || dashboard?.attendanceRate == null ? '—' : `${dashboard.attendanceRate}%`} icon={METRIC_COLORS.weeklySales.icon} color={METRIC_COLORS.weeklySales.color} bgColor={METRIC_COLORS.weeklySales.bgColor} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard title="Assessments with scores" value={dashboardLoading ? '...' : dashboardError ? '—' : dashboard?.assessmentsWithScores ?? 0} icon={METRIC_COLORS.newUsers.icon} color={METRIC_COLORS.newUsers.color} bgColor={METRIC_COLORS.newUsers.bgColor} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard title="Assignments due this week" value={dashboardLoading ? '...' : dashboardError ? '—' : dashboard?.dueThisWeek ?? 0} icon={METRIC_COLORS.itemOrders.icon} color={METRIC_COLORS.itemOrders.color} bgColor={METRIC_COLORS.itemOrders.bgColor} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricCard title="Assignments submitted" value={dashboardLoading ? '...' : dashboardError ? '—' : dashboard?.submittedAssignments ?? 0} icon={METRIC_COLORS.bugReports.icon} color={METRIC_COLORS.bugReports.color} bgColor={METRIC_COLORS.bugReports.bgColor} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Paper elevation={1} sx={{ borderRadius: '12px', p: 3, height: 400 }}>
                                    <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 600, mb: 1 }}>
                                    My Weekly Attendance
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        {!dashboardLoading && !dashboardError && !dashboard?.weeklyActivity?.some((item) => item.attendance !== null) ? (
                                            <Alert severity="info">No attendance has been recorded for the last seven days.</Alert>
                                        ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dashboard?.weeklyActivity || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                                <XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} stroke="#888" />
                                                <YAxis stroke="#888" domain={[0, 1]} ticks={[0, 0.5, 1]} tickFormatter={(value) => `${value * 100}%`} label={{ value: 'Attendance', angle: -90, position: 'insideLeft', fill: primaryColor }}/>
                                                <RechartsTooltip formatter={(value) => [`${Math.round(value * 100)}%`, 'Attendance']} />
                                                <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                                                <Line type="monotone" dataKey="attendance" name="Attendance (Full=100%, Half=50%, Leave=0%)" stroke="#4c8bf5" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Paper elevation={1} sx={{ borderRadius: '12px', p: 3, height: 400 }}>
                                    <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 600, mb: 3 }}>
                                        Current Assignments Status
                                    </Typography>
                                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                {(dashboard?.assignmentStatus || []).some((item) => item.value > 0) ? <Pie
                                                        data={dashboard.assignmentStatus}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={130}
                                                    fill="#8884d8"
                                                    labelLine={true}
                                                    label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {dashboard.assignmentStatus.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie> : null}
                                                <RechartsTooltip formatter={(value, name, props) => [value, props.payload.name]} />
                                                <Legend align="center" verticalAlign="bottom" layout="horizontal" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {!dashboardLoading && !(dashboard?.assignmentStatus || []).some((item) => item.value > 0) && <Alert severity="info">No assignment records are available yet.</Alert>}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <ModernCalendarWidget />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <CurrentStatusWidget />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <NoticeWidget notices={dashboard?.notices || []} loading={dashboardLoading} error={Boolean(dashboardError)} />
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
};

export default StudentDashboard;