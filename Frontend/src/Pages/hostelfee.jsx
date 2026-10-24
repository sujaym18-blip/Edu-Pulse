import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
    FaBed, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaSpinner, 
    FaHome, FaUserGraduate, FaKey, FaVenusMars, FaCreditCard, FaTimesCircle, FaPlusSquare,
    FaReceipt 
} from 'react-icons/fa';

import '../CSS/hostelfee.css';

const BASE_URL = 'http://localhost:7000';
const STUDENT_DETAILS_URL = `${BASE_URL}/viewstudenthostel`;
const VIEW_FEES_URL = `${BASE_URL}/viewfees`; 
const MAKE_PAYMENT_URL = `${BASE_URL}/feespayment`; 

const StudentFeePortal = () => {
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatusMessage, setPaymentStatusMessage] = useState(null); 
    const [isPaid, setIsPaid] = useState(false);
    const [totalCharge, setTotalCharge] = useState(0);
    const [token, setToken] = useState('');

    useEffect(() => {
        const fetchToken = Cookies.get('token');
        if (fetchToken) {
            setToken(fetchToken);
            fetchInitialData(fetchToken);
        } else {
            setPaymentStatusMessage({ msg: 'Login required. Token not found.', type: 'error' });
            setLoading(false);
        }
    }, []);

    const fetchInitialData = async (token) => {
        setLoading(true);
        setPaymentStatusMessage(null);
        let feeIsPaid = false;

        try {
            const detailsRes = await axios.get(STUDENT_DETAILS_URL, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            const details = detailsRes.data.student;

            if (!details) {
                setPaymentStatusMessage({ msg: 'Hostel registration not found.', type: 'error' });
                setLoading(false);
                return;
            }
            
            setStudentDetails(details);
            const charge = parseFloat(details.totalCharge || 0);
            setTotalCharge(charge);

            try {
                const feeRes = await axios.get(VIEW_FEES_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                
                if (feeRes.data && feeRes.data.feeDetails) {
                    const status = feeRes.data.feeDetails.paymentStatus;
                    feeIsPaid = status && status.toLowerCase() === 'paid';
                }
                
            } catch (feeErr) {
                feeIsPaid = false;
            }
            
            setIsPaid(feeIsPaid);
            if (feeIsPaid) {
                 setPaymentStatusMessage({ msg: 'Hostel Fee already paid. Thank you.', type: 'success' });
            } 
            
        } catch (err) {
            setPaymentStatusMessage({ msg: 'Error loading details.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (isPaid || totalCharge <= 0 || isProcessing) return;

        setIsProcessing(true);
        setPaymentStatusMessage({ msg: 'Processing payment...', type: 'info' });

        const payload = {
            paymentStatus: 'paid', 
            amountPaid: totalCharge,
        };

        try {
            const res = await axios.post(MAKE_PAYMENT_URL, payload, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            if (res.data.success) {
                setPaymentStatusMessage({ msg: 'Payment Successful!', type: 'success' });
                setIsPaid(true);
            } else {
                setPaymentStatusMessage({ msg: 'Payment failed.', type: 'error' });
            }
        } catch (err) {
            setPaymentStatusMessage({ msg: 'Transaction failed. Check connection.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStatusBox = () => {
        if (!paymentStatusMessage) return null;
        const { msg, type } = paymentStatusMessage;

        let icon;
        if (type === 'success') icon = <FaCheckCircle />;
        else if (type === 'error') icon = <FaExclamationCircle />;
        else if (type === 'info') icon = <FaSpinner className="spin" />;
        else icon = <FaInfoCircle />;

        return (
            <div className={`status-message-hostel ${type}`}>
                <span className="icon">{icon}</span>
                <p>{msg}</p>
            </div>
        );
    };

    const renderAmenitiesList = () => {
        const amenitiesList = [
            { key: 'ac', name: 'A/C' }, { key: 'cooler', name: 'Cooler' }, 
            { key: 'fan', name: 'Fan' }, { key: 'personalKitchen', name: 'Kitchen' }, 
            { key: 'attachedBathroom', name: 'Attached Bath' }, { key: 'balcony', name: 'Balcony' }, 
            { key: 'laundry', name: 'Laundry' }, { key: 'wifi', name: 'Wi-Fi' }, 
            { key: 'gym', name: 'Gym Access' }
        ];

        const selectedAmenities = amenitiesList.filter(amenity => studentDetails[amenity.key]);

        if (selectedAmenities.length === 0) {
            return <p className="no-amenities">No special amenities selected.</p>;
        }

        return (
            <div className="amenities-grid">
                {selectedAmenities.map((amenity) => (
                    <span key={amenity.key} className="amenity-tag">
                        {amenity.name}
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="hostel-portal-container state-message loading-state">
                <FaSpinner className="spin state-icon" />
                <p>Loading details...</p>
            </div>
        );
    }
    
    if (!studentDetails) {
        return (
            <div className="hostel-portal-container state-message error-state">
                <FaExclamationCircle className="state-icon" />
                <p>No hostel registration found.</p>
            </div>
        );
    }

    const roomTypeName = studentDetails?.roomType 
        ? studentDetails.roomType.charAt(0).toUpperCase() + studentDetails.roomType.slice(1) 
        : 'N/A';

    return (
        <div className="hostel-portal-container">
            <header className="hostel-portal-header">
                <FaHome className="header-icon" /> 
                <h1>Hostel Fee Payment Portal</h1>
                <p>Accommodation details for <b>{studentDetails.Name }</b></p>
            </header>

            <div className="details-card-wrapper">
                <div className="info-card student-details-card">
                    <div className="card-header-hostel">
                        <FaBed className="card-icon" /> <h2>Room & Amenities</h2>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label"><FaUserGraduate /> Student ID:</span> 
                        <strong className="detail-value">{studentDetails.studentid}</strong>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label"><FaKey /> Room Type:</span> 
                        <strong className="detail-value room-type-value">{roomTypeName}</strong>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label"><FaKey /> Room No:</span> 
                        <strong className="detail-value room-no-value">{studentDetails.roomNo || 'Pending'}</strong>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label"><FaVenusMars /> Gender:</span> 
                        <strong className="detail-value">{studentDetails.gender || 'N/A'}</strong>
                    </div>
                    
                    <h3 className="amenities-heading"><FaPlusSquare /> Selected Amenities</h3>
                    {renderAmenitiesList()}
                </div>

                <div className="info-card fee-payment-card">
                    <div className="card-header-hostel">
                        <FaMoneyBillWave className="card-icon" /> <h2>Hostel Fee Status</h2>
                    </div>
                    
                    <div className="fee-total-display">
                        <span className="label">Total Annual Charge</span>
                        <span className="amount-value">₹ {totalCharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>

                    <div className={`fee-status-bar ${isPaid ? 'paid-status' : 'pending-status'}`}>
                        <span className="status-icon">{isPaid ? <FaCheckCircle /> : <FaTimesCircle />}</span>
                        <span className="status-label">{isPaid ? 'PAYMENT CONFIRMED' : 'PAYMENT DUE'}</span>
                    </div>

                    {renderStatusBox()}
                    
                    <button
                        onClick={handlePayment}
                        disabled={isPaid || totalCharge <= 0 || isProcessing} 
                        className={`pay-button-integrated ${isPaid ? 'pay-button-disabled' : ''}`}
                    >
                        {isProcessing ? (
                            <>
                                <FaSpinner className="spin" /> Processing...
                            </>
                        ) : isPaid ? (
                            <a href={`/receipt/${studentDetails.studentid}`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                <FaReceipt /> Fee Paid - Download Receipt
                            </a>
                        ) : (
                            <>
                                <FaCreditCard /> Pay Now: ₹ {totalCharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </>
                        )}
                    </button>
                    <p className={`payment-note ${isPaid ? 'success-note' : 'info-note'}`}>
                        {isPaid ? "Your record is fully paid. Thank you." : "Click Pay Now to finalize your hostel fee."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentFeePortal;