import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaBus, FaGasPump, FaWrench, FaRoute, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../CSS/transportconditions.css'; 

const BusConditionUpdate = () => {
    const [busNo, setBusNo] = useState('');
    const [size, setSize] = useState('');
    const [fuelCapacity, setFuelCapacity] = useState('');
    const [currentFuel, setCurrentFuel] = useState('');
    const [routeNo, setRoute] = useState('');
    const [busType, setBusType] = useState('');
    const [mileage, setMileage] = useState('');
    const [lastRefuelDate, setLastRefuelDate] = useState('');
    const [lastMaintenanceDate, setLastMaintenanceDate] = useState('');
    const [status, setStatus] = useState('active'); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const token = Cookies.get('emtoken'); 

    useEffect(() => {
        if (!token) {
            setError('You are not authenticated. Please log in.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError('You are not authenticated. Please log in.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post(
                'http://localhost:7000/conditionupdate',
                {
                    busNo,
                    size,
                    fuelCapacity: Number(fuelCapacity), 
                    currentFuel: Number(currentFuel),
                    routeNo,
                    busType,
                    mileage: Number(mileage),
                    lastRefuelDate,
                    lastMaintenanceDate,
                    status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );
            setLoading(false);
            setSuccessMessage('Transport condition updated successfully!');
            setBusNo('');
            setSize('');
            setFuelCapacity('');
            setCurrentFuel('');
            setRoute('');
            setBusType('');
            setMileage('');
            setLastRefuelDate('');
            setLastMaintenanceDate('');
            setStatus('active'); 
        } catch (err) {
            setLoading(false);
            const errMsg = err.response?.data?.message || 'Error updating transport condition. Please try again.';
            setError(errMsg);
        }
    };

    return (
        <div className="bus-update-container">
            <div className="form-card">
                <h1 className="page-title"><FaBus className="title-icon" /> Update Transport Condition</h1>

                {error && <div className="message error-message"><FaExclamationCircle /> {error}</div>}
                {successMessage && <div className="message success-message"><FaCheckCircle /> {successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    
                    <div className="form-section-header">Basic Information</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Bus Number</label>
                            <input
                                type="text"
                                value={busNo}
                                onChange={(e) => setBusNo(e.target.value)}
                                placeholder="E.g., HR01-AB-1234"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Route No. (<FaRoute/>)</label>
                            <input
                                type="text"
                                value={routeNo}
                                onChange={(e) => setRoute(e.target.value)}
                                placeholder="E.g., R005"
                                required
                            />
                        </div>
                        
                        <div className="input-group">
                            <label>Size</label>
                            <input
                                type="text"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="E.g., 52 Seater"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Bus Type</label>
                            <input
                                type="text"
                                value={busType}
                                onChange={(e) => setBusType(e.target.value)}
                                placeholder="E.g., AC, Non-AC"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-section-header">Fuel & Performance (<FaGasPump/>)</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Fuel Capacity (Liters)</label>
                            <input
                                type="number"
                                value={fuelCapacity}
                                onChange={(e) => setFuelCapacity(e.target.value)}
                                min="0"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Current Fuel (Liters)</label>
                            <input
                                type="number"
                                value={currentFuel}
                                onChange={(e) => setCurrentFuel(e.target.value)}
                                min="0"
                                required
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Mileage (Km)</label>
                            <input
                                type="number"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section-header">Maintenance & Status (<FaWrench/>)</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Last Refuel Date (<FaCalendarAlt/>)</label>
                            <input
                                type="date"
                                value={lastRefuelDate}
                                onChange={(e) => setLastRefuelDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]} 
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Last Maint. Date (<FaCalendarAlt/>)</label>
                            <input
                                type="date"
                                value={lastMaintenanceDate}
                                onChange={(e) => setLastMaintenanceDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]} 
                                required
                            />
                        </div>

                        <div className="input-group status-group">
                            <label>Bus Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                <option value="active">Active</option>
                                <option value="under maintenance">Under Maintenance</option>
                                <option value="off-duty">Off-duty</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Bus Condition'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BusConditionUpdate;