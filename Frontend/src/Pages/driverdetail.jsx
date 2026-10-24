import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
    FaBus, 
    FaUserPlus, 
    FaRoute, 
    FaIdCard, 
    FaPhone, 
    FaEnvelope, 
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaPlayCircle,
    FaSpinner,
    FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import '../CSS/driver.css'; 

const BASE_URL = 'http://localhost:7000';

const DriverDetailsForm = () => {
    const [formData, setFormData] = useState({
        route: '',  
        name: '',
        licenseNumber: '',
        phoneNumber: '',
        email: '',
        dateOfBirth: '',
        address: '',
        employmentStartDate: ''
    });
    
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const token = Cookies.get('emtoken');

    useEffect(() => {
        const fetchRoutes = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/conditionview`);
                const availableRoutes = response.data.data.map(condition => condition.routeNo);
                setRoutes(availableRoutes);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching routes:', err);
                setError('Error fetching available routes.');
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError('You must be logged in to add a driver.');
            return;
        }

        setSubmitLoading(true);
        setError('');
        setSuccessMessage('');

        const driverData = {
            Route: formData.route,
            name: formData.name,
            licenseNumber: formData.licenseNumber,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            employmentStartDate: formData.employmentStartDate,
        };

        try {
            const response = await axios.post(`${BASE_URL}/driverdetails`, driverData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            setSuccessMessage(response.data.msg || 'Driver added successfully!');

            setFormData({
                route: '',
                name: '',
                licenseNumber: '',
                phoneNumber: '',
                email: '',
                dateOfBirth: '',
                address: '',
                employmentStartDate: ''
            });
        } catch (error) {
            setError(error.response ? error.response.data.msg : 'Error adding driver. Please check server connection.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="driver-form__container">
            <div className="driver-form__card">
                
                <h1 className="form__title">
                    <FaUserPlus className="title__icon" /> Add New Driver Details
                </h1>

                {loading ? (
                    <div className="loading-state">
                        <FaSpinner className="spinner-icon" />
                        <p>Fetching routes...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="driver-form">
                        
                        <div className="form-group">
                            <label htmlFor="route">Route Assignment</label>
                            <div className="input-with-icon">
                                <FaRoute className="input-icon" />
                                <select
                                    name="route"
                                    id="route"
                                    className="form-input form-select"
                                    value={formData.route}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select a Route (e.g., R-05)</option>
                                    {routes.length > 0 ? (
                                        routes.map((route, index) => (
                                            <option key={index} value={route}>
                                                {route}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No routes found</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-with-icon">
                                <FaUserPlus className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="form-input"
                                    placeholder="Driver's Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="licenseNumber">License Number</label>
                            <div className="input-with-icon">
                                <FaIdCard className="input-icon" />
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    id="licenseNumber"
                                    className="form-input"
                                    placeholder="e.g., DL1234567890"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <div className="input-with-icon">
                                <FaPhone className="input-icon" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    id="phoneNumber"
                                    className="form-input"
                                    placeholder="e.g., 9876543210"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-with-icon">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="example@domain.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <div className="input-with-icon">
                                <FaCalendarAlt className="input-icon" />
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    id="dateOfBirth"
                                    className="form-input"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="employmentStartDate">Employment Start Date</label>
                            <div className="input-with-icon">
                                <FaPlayCircle className="input-icon" />
                                <input
                                    type="date"
                                    name="employmentStartDate"
                                    id="employmentStartDate"
                                    className="form-input"
                                    value={formData.employmentStartDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group form-group--full">
                            <label htmlFor="address">Residential Address</label>
                            <div className="input-with-icon">
                                <FaMapMarkerAlt className="input-icon" style={{alignSelf: 'flex-start', paddingTop: '10px'}} />
                                <textarea
                                    name="address"
                                    id="address"
                                    className="form-input form-textarea"
                                    placeholder="Enter full residential address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="message__bar message__bar--error form-group--full">
                                <FaExclamationTriangle /> {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="message__bar message__bar--success form-group--full">
                                <FaCheckCircle /> {successMessage}
                            </div>
                        )}

                        <div className="form-action form-group--full">
                            <button type="submit" className="form-button__submit" disabled={submitLoading || loading}>
                                {submitLoading ? (
                                    <>
                                        <FaSpinner className="spinner-icon" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaBus /> Add Driver
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DriverDetailsForm;