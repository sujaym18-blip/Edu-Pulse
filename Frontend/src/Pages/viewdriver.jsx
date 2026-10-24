import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserShield, FaRoute, FaBus, FaIdCard, FaPhone, FaEnvelope, FaBirthdayCake, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../CSS/viewdrivers.css';

const ViewDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDrivers = async () => {
        try {
            const response = await axios.get('http://localhost:7000/viewdrivers');
            setDrivers(response.data.driver);
            setLoading(false); 
        } catch (err) {
            console.error("Error fetching drivers:", err);
            setError('Error fetching drivers. Please check server connection.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []); 

    const renderStatusBadge = (status) => {
        const lowerStatus = status ? status.toLowerCase() : 'inactive';
        let icon;
        let className;

        if (lowerStatus.includes('active')) {
            icon = <FaCheckCircle />;
            className = 'status-active';
        } else {
            icon = <FaTimesCircle />;
            className = 'status-inactive';
        }

        return <span className={`status-badge ${className}`}>{icon} {status}</span>;
    };

    if (loading) {
        return (
            <div className="drivers-container">
                <div className="state-message loading-state"><FaSpinner className="spinner" /> Loading drivers list...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="drivers-container">
                <div className="state-message error-state"><FaExclamationTriangle /> {error}</div>
            </div>
        );
    }

    return (
        <div className="drivers-container">
            <h1 className="page-title"><FaUserShield className="title-icon" /> Employee Driver Records</h1>

            {drivers.length === 0 ? (
                <div className="state-message no-data">
                    <p>No drivers found in the database.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="drivers-table">
                        <thead>
                            <tr>
                                <th><FaIdCard /> ID / Name</th>
                                <th><FaRoute /> Route / Bus No.</th>
                                <th><FaIdCard /> License No.</th>
                                <th><FaPhone /> Contact / Email</th>
                                <th><FaBirthdayCake /> DOB / Start Date</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver) => (
                                <tr key={driver.driverId} className="driver-row">
                                    <td data-label="ID / Name">
                                        <div className="driver-name">{driver.name}</div>
                                        <div className="driver-id">ID: {driver.driverId}</div>
                                    </td>
                                    
                                    <td data-label="Route / Bus No.">
                                        <div className="route-info">Route: {driver.Route || 'N/A'}</div>
                                        <div className="bus-info">Bus: {driver.BusNo || 'N/A'}</div>
                                    </td>
                                    
                                    <td data-label="License Number" className="license-cell">
                                        {driver.licenseNumber}
                                    </td>
                                    
                                    <td data-label="Contact / Email" className="contact-cell">
                                        <div className="phone-number">{driver.phoneNumber}</div>
                                        <div className="email-address">{driver.email}</div>
                                    </td>
                                    
                                    <td data-label="DOB / Start Date" className="date-cell">
                                        <div className="dob-date">DOB: {new Date(driver.dateOfBirth).toLocaleDateString()}</div> 
                                        <div className="start-date">Start: {new Date(driver.employmentStartDate).toLocaleDateString()}</div>
                                    </td>
                                    
                                    <td data-label="Status" className="status-cell">
                                        {renderStatusBadge(driver.status)}
                                    </td>
                                    
                                    <td data-label="Last Updated" className="date-cell">
                                        {new Date(driver.lastUpdated).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewDrivers;