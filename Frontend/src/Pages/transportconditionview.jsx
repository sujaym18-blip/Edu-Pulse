import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBus, FaTable, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaWrench, FaBan, FaGasPump } from 'react-icons/fa';
import '../CSS/busconditionview.css'; 

const BusConditionView = () => {
    const [busConditions, setBusConditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBusConditions = async () => {
            try {
                const response = await axios.get('http://localhost:7000/conditionview');
                setBusConditions(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bus conditions:', err);
                setError('Error fetching bus conditions. Please try again.');
                setLoading(false);
            }
        };

        fetchBusConditions();
    }, []);

    const renderStatusBadge = (status) => {
        let icon;
        let className;
        const lowerStatus = status.toLowerCase();

        if (lowerStatus.includes('active')) {
            icon = <FaCheckCircle />;
            className = 'status-active';
        } else if (lowerStatus.includes('maintenance')) {
            icon = <FaWrench />;
            className = 'status-maintenance';
        } else {
            icon = <FaBan />;
            className = 'status-off-duty';
        }

        return <span className={`status-badge ${className}`}>{icon} {status}</span>;
    };

    if (loading) {
        return (
            <div className="view-container">
                <div className="loading-state"><FaSpinner className="spinner" /> Loading bus conditions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-container">
                <div className="error-state"><FaExclamationTriangle /> {error}</div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <h1 className="page-title"><FaBus className="title-icon" /> Bus Condition Details Overview</h1>

            {busConditions.length === 0 ? (
                <div className="no-data-message">
                    <p>No bus conditions available in the database.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="condition-table">
                        <thead>
                            <tr>
                                <th><FaBus /> Bus No. / Route</th>
                                <th>Size / Type</th>
                                <th><FaGasPump /> Fuel Status</th>
                                <th>Mileage (Km)</th>
                                <th><FaWrench /> Last Maint.</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {busConditions.map((condition) => (
                                <tr key={condition._id} className="data-row">
                                    <td data-label="Bus / Route" className="bus-route-cell">
                                        <div className="bus-number">{condition.busNo}</div>
                                        <div className="route-number">Route: {condition.routeNo}</div>
                                    </td>
                                    
                                    <td data-label="Size / Type">
                                        <div className="bus-size">{condition.size}</div>
                                        <div className="bus-type">({condition.busType})</div>
                                    </td>
                                    
                                    <td data-label="Fuel Status" className="fuel-cell">
                                        <div className="fuel-capacity">Capacity: {condition.fuelCapacity} L</div>
                                        <div className="current-fuel">Current: <span className="fuel-level">{condition.currentFuel} L</span></div>
                                        <div className="refuel-date">Last Refuel: {new Date(condition.lastRefuelDate).toLocaleDateString()}</div>
                                    </td>
                                    
                                    <td data-label="Mileage">{condition.mileage}</td>
                                    
                                    <td data-label="Last Maintenance">
                                        {new Date(condition.lastMaintenanceDate).toLocaleDateString()}
                                    </td>
                                    
                                    <td data-label="Status" className="status-cell">
                                        {renderStatusBadge(condition.status)}
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

export default BusConditionView;