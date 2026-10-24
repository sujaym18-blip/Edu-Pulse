import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaUserCircle, FaBusAlt, FaRoute, FaMapMarkerAlt, 
    FaPhone, FaEnvelope, FaGasPump, FaWrench, FaClock,
    FaSpinner, FaTimesCircle
} from 'react-icons/fa';
import '../CSS/StudentTransportView.css'

const StudentTransportDashboard = () => {
    const [studentTransport, setStudentTransport] = useState(null);
    const [driverDetails, setDriverDetails] = useState(null);
    const [busCondition, setBusCondition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllTransportData = async () => {
            try {
                const studentRes = await axios.get('http://localhost:7000/studenttransportview', {
                    withCredentials: true,
                });
                const studentData = studentRes.data.studenttransport;
                setStudentTransport(studentData);

                if (!studentData || !studentData.Route) {
                    setError('Transport enrollment details are incomplete or not found.');
                    setLoading(false);
                    return;
                }

                const routeNo = studentData.Route;

                const [driversRes, conditionsRes] = await Promise.all([
                    axios.get('http://localhost:7000/viewdrivers'),
                    axios.get('http://localhost:7000/conditionview'),
                ]);
                const driver = driversRes.data.driver?.find(d => d.Route === routeNo);
                setDriverDetails(driver || null);

                const condition = conditionsRes.data.data?.find(c => c.routeNo === routeNo);
                setBusCondition(condition || null);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load transport data. Please verify your enrollment or check the server status.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllTransportData();
    }, []);

    const renderStatus = (icon, message, className) => (
        <div className="student-transport-dashboard">
            <div className={`status-message ${className}`}>
                <span className="status-icon" aria-hidden="true">{icon}</span>
                <p>{message}</p>
            </div>
        </div>
    );
    
    if (loading) {
        return renderStatus(<FaSpinner className="spinner" />, "Loading secure transport details...", "loading-state");
    }

    if (error) {
        return renderStatus(<FaTimesCircle />, error, "error-state");
    }
    
    if (!studentTransport) {
        return renderStatus(<FaTimesCircle />, "Transport enrollment not found for your account.", "no-data-state");
    }

    return (
        <main className="student-transport-dashboard">
            <header className="dashboard-header-v2">
                <span className="header-icon-wrap">
                    <FaBusAlt className="header-icon-v2" aria-hidden="true" />
                </span>
                <div className="header-copy">
                    <p className="header-eyebrow">STUDENT SERVICES</p>
                    <h1>My transport</h1>
                    <p className="header-description">Your route, pickup schedule, driver and vehicle details.</p>
                </div>
                <span className="header-route-pill">
                    <FaRoute aria-hidden="true" /> Route {studentTransport.Route || 'N/A'}
                </span>
            </header>
            
            <section className="main-route-card">
                <div className="route-summary-section">
                    <span className="route-icon-wrap">
                        <FaRoute className="route-icon-lg" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="route-number-display">ASSIGNED ROUTE</p>
                        <h2>{studentTransport.studentName}'s transport details</h2>
                    </div>
                </div>

                <div className="route-details-grid">
                    <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <p>Stop Name</p>
                        <strong>{studentTransport.Stop || 'N/A'}</strong>
                    </div>
                    <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <p>Morning Arrival</p>
                        <strong>{studentTransport.arrivalTime || 'N/A'}</strong>
                    </div>
                    <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <p>Evening Departure</p>
                        <strong>{studentTransport.departureTime || 'N/A'}</strong>
                    </div>
                </div>
            </section>

            <div className="auxiliary-details-grid">
                
                <div className="info-card-v2 driver-card-v2">
                    <div className="card-header-v2">
                        <FaUserCircle /> <h2>Assigned Driver</h2>
                    </div>
                    {driverDetails ? (
                        <div className="card-content-v2">
                            <p><strong>{driverDetails.name}</strong></p>
                            <div className="contact-info">
                                <p><FaPhone aria-hidden="true" /> {driverDetails.phoneNumber || 'Not provided'}</p>
                                <p><FaEnvelope aria-hidden="true" /> {driverDetails.email || 'Not provided'}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="missing-data-v2">Driver details not yet assigned.</p>
                    )}
                </div>

                <div className="info-card-v2 bus-card-v2">
                    <div className="card-header-v2">
                        <FaBusAlt /> <h2>Vehicle Status</h2>
                    </div>
                    {busCondition ? (
                        <div className="card-content-v2">
                            <p className="bus-no-label">Bus {busCondition.busNo || 'N/A'} <span>{busCondition.busType || 'Vehicle type not specified'}</span></p>
                            <div className="bus-status-metrics">
                                <div className="metric-item">
                                    <FaGasPump />
                                    <span><small>Fuel level</small>{busCondition.currentFuel ?? 'N/A'} / {busCondition.fuelCapacity ?? 'N/A'} L</span>
                                </div>
                                <div className="metric-item">
                                    <FaWrench />
                                    <span><small>Last service</small>{busCondition.lastMaintenanceDate || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="missing-data-v2">Bus condition details not yet updated.</p>
                    )}
                </div>
            </div>
            
        </main>
    );
};

export default StudentTransportDashboard;