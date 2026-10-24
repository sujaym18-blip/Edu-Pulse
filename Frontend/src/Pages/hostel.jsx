import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../CSS/hostel.css'
const ROOM_PRICES = {
    single: 60000,
    double: 40000,
};

const AMENITY_PRICES = {
    ac: 5000,
    cooler: 1500,
    personalKitchen: 8000,
    attachedBathroom: 4000,
    balcony: 2000,
    wifi: 1000,
    laundry: 3000,
    gym: 2000,
    fan: 0,
};

const HostelRegistrationForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        bloodGroup: '',
        allergies: '',
        emergencyContact: '',
        gender: 'male',
        roomType: '',
        ac: false,
        cooler: false,
        fan: true,
        personalKitchen: false,
        attachedBathroom: false,
        balcony: false,
        wifi: false,
        laundry: false,
        gym: false,
        totalCharge: 0,
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const tokenFromCookie = Cookies.get('token');
        if (tokenFromCookie) setToken(tokenFromCookie);
        else setStatus({ type: 'error', message: 'You are not logged in!' });
    }, []);

    const handleDetailChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setStatus(null);
    };

    const handleRoomSelect = (type) => {
        setFormData((prev) => ({
            ...prev,
            roomType: type,
            ac: false,
            cooler: false,
            personalKitchen: false,
            attachedBathroom: false,
            balcony: false,
            wifi: false,
            laundry: false,
            gym: false,
            fan: true,
        }));
    };

    useEffect(() => {
        let charge = ROOM_PRICES[formData.roomType] || 0;
        Object.keys(AMENITY_PRICES).forEach((key) => {
            if (formData[key]) charge += AMENITY_PRICES[key];
        });
        setFormData((prev) => ({ ...prev, totalCharge: charge }));
    }, [formData.roomType, formData.ac, formData.cooler, formData.fan, formData.personalKitchen, formData.attachedBathroom, formData.balcony, formData.wifi, formData.laundry, formData.gym]);

    const nextStep = () => {
        if (step === 1) {
            if (!formData.bloodGroup || !formData.emergencyContact || !formData.gender) {
                setStatus({ type: 'error', message: 'Please fill all required personal details.' });
                return;
            }
        }
        if (step === 2) {
             if (!formData.roomType) {
                setStatus({ type: 'error', message: 'Please select a room type.' });
                return;
            }
        }
        setStep((prev) => (prev < 4 ? prev + 1 : prev));
        setStatus(null);
    };
    
    const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

    const handleSubmit = async () => {
        if (!token) {
            setStatus({ type: 'error', message: 'Authentication token is missing!' });
            return;
        }

        setLoading(true);

        const finalData = {
            bloodGroup: formData.bloodGroup,
            allergies: formData.allergies,
            emergencyContact: formData.emergencyContact,
            gender: formData.gender,
            roomType: formData.roomType,
            ac: formData.ac,
            cooler: formData.cooler,
            fan: formData.fan,
            personalKitchen: formData.personalKitchen,
            attachedBathroom: formData.attachedBathroom,
            balcony: formData.balcony,
            wifi: formData.wifi,
            laundry: formData.laundry,
            gym: formData.gym,
            totalCharge: formData.totalCharge,
        };

        try {
            const response = await axios.post(
                'http://localhost:7000/studentregister',
                finalData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 201) {
                setStatus({ type: 'success', message: 'Registration successful! Proceed to payment.' });
            } else {
                setStatus({ type: 'success', message: 'Registration failed' });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Server error during registration';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Personal Details";
            case 2: return "Select Room Type";
            case 3: return "Select Amenities";
            case 4: return "Review & Submit";
            default: return "Hostel Registration";
        }
    };

    return (
        <div className="hostel-container">
            <div>
                <h1 >Hostel Registration</h1>
                <p>Step {step} of 4</p>

                {status && <div className={`status-message ${status.type}`}>{status.message}</div>}

                {step === 1 && (
                    <div>
                        <h3>Step 1: Personal Details</h3>
                        <input type="text" name="bloodGroup" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleDetailChange} />
                        <input type="text" name="allergies" placeholder="Allergies (Optional)" value={formData.allergies} onChange={handleDetailChange} />
                        <input type="tel" name="emergencyContact" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={handleDetailChange} />
                        <select name="gender" value={formData.gender} onChange={handleDetailChange}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <div style={{textAlign: 'right'}}>
                            <button onClick={nextStep}>Next</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3>Step 2: Select Room Type</h3>
                        <div className="room-selection-grid">
                            <div onClick={() => handleRoomSelect('single')} data-selected={formData.roomType === 'single'}>
                                <h4>Single Room</h4>
                                <p>Fee: ₹{ROOM_PRICES.single.toLocaleString()}</p>
                            </div>
                            <div onClick={() => handleRoomSelect('double')} data-selected={formData.roomType === 'double'}>
                                <h4>Double Room</h4>
                                <p>Fee: ₹{ROOM_PRICES.double.toLocaleString()}</p>
                            </div>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <button onClick={prevStep}>Back</button>
                            <button onClick={nextStep} disabled={!formData.roomType}>Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h3>Step 3: Select Amenities</h3>
                        <div className="amenity-list">
                            {Object.keys(AMENITY_PRICES).map((key) => (
                                <div key={key}>
                                    <input type="checkbox" id={key} name={key} checked={formData[key]} onChange={handleDetailChange} disabled={key === 'fan'} />
                                    <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} (+₹{AMENITY_PRICES[key].toLocaleString()})</label>
                                </div>
                            ))}
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <button onClick={prevStep}>Back</button>
                            <button onClick={nextStep}>Next</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <h3>Step 4: Review & Submit</h3>
                        <div className="review-details">
                            <p>Gender: <span>{formData.gender}</span></p>
                            <p>Room Type: <span>{formData.roomType.charAt(0).toUpperCase() + formData.roomType.slice(1)}</span></p>
                            <p>Amenities: <span>
                                {Object.keys(AMENITY_PRICES).filter(key => formData[key]).map(key => 
                                    key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
                                ).join(', ') || 'Standard Fan Only'}
                            </span></p>
                            <div className="charge-display">
                                Total Charge: ₹{formData.totalCharge.toLocaleString()}
                            </div>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <button onClick={prevStep}>Back</button>
                            <button onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Registration'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostelRegistrationForm;