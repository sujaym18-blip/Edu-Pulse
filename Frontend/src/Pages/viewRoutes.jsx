import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBus, FaClock, FaCalendarAlt, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaTimes, FaSearch, FaRoute } from 'react-icons/fa';
import '../CSS/viewroutes.css';

const ViewRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const toggleRow = (routeId) => {
        setExpandedRows(prev => ({
            ...prev,
            [routeId]: !prev[routeId]
        }));
    };

    const fetchRoutes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:7000/viewroutes');
            setRoutes(response.data.routes);
        } catch (err) {
            console.error('Error fetching routes:', err);
            setError('Failed to load routes. Please check the server connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const filteredRoutes = routes.filter(route => 
        route.routeNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="routes-loading-container">
            <div className="loader"></div>
            <p>Tracking routes...</p>
        </div>
    );

    if (error) return (
        <div className="routes-error-container">
            <div className="error-card">
                <FaTimes className="error-icon" />
                <h3>Connection Error</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchRoutes}>Try Again</button>
            </div>
        </div>
    );

    return (
        <div className="view-routes-page">
            <div className="routes-header">
                <div>
                    <h1><FaBus className="header-icon" /> Transport Routes</h1>
                    <p>Manage and view all active bus schedules</p>
                </div>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search Route #..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="routes-card">
                {filteredRoutes.length === 0 ? (
                    <div className="no-data-state">
                        <div className="icon-bg">
                            <FaCalendarAlt />
                        </div>
                        <h3>No Routes Found</h3>
                        <p>There are no active routes matching your criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Route No.</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Stops</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoutes.map((route, index) => {
                                    const routeId = route.routeNumber;
                                    const isExpanded = expandedRows[routeId];

                                    return (
                                        <React.Fragment key={index}>
                                            <tr className={`route-row ${isExpanded ? 'active-row' : ''}`} onClick={() => toggleRow(routeId)}>
                                                <td>
                                                    <span className="route-badge">
                                                        <FaRoute /> {route.routeNumber}
                                                    </span>
                                                </td>
                                                <td className="time-cell">
                                                    <FaClock /> {route.startTime}
                                                </td>
                                                <td className="time-cell">
                                                    <FaClock /> {route.endTime}
                                                </td>
                                                <td>
                                                    <span className="stop-count-pill">
                                                        {route.stops.length} Stops
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <button className={`expand-btn ${isExpanded ? 'open' : ''}`}>
                                                        <FaChevronDown />
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr className="detail-row">
                                                    <td colSpan="5">
                                                        <div className="timeline-container">
                                                            <h4>Route Timeline</h4>
                                                            <div className="timeline">
                                                                {route.stops.map((stop, idx) => (
                                                                    <div key={idx} className="timeline-item">
                                                                        <div className="timeline-marker"></div>
                                                                        <div className="timeline-content">
                                                                            <div className="stop-name">
                                                                                <FaMapMarkerAlt /> {stop.stopName}
                                                                            </div>
                                                                            <div className="stop-times">
                                                                                <span className="arr">Arr: {stop.arrivalTime}</span>
                                                                                <span className="sep">•</span>
                                                                                <span className="dep">Dep: {stop.departureTime}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewRoutes;
