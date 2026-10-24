import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../CSS/FeePayment.css'; 

const FeePayment = () => {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(''); 
    const [remainingFee, setRemainingFee] = useState(0);
    const [selectedQuarter, setSelectedQuarter] = useState(null);

    const fetchStudentInfo = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setPaymentStatus({ message: 'Login required. Please refresh the page.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:7000/studentprofile2', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            const studentData = response.data.student || response.data;
            if (!studentData) {
                setPaymentStatus({ message: 'Student data not found.', type: 'error' });
                return;
            }

            const paidFees = (
                (studentData.quarter1?.status === 'Paid' ? parseFloat(studentData.quarter1.fees || 0) : 0) +
                (studentData.quarter2?.status === 'Paid' ? parseFloat(studentData.quarter2.fees || 0) : 0) +
                (studentData.quarter3?.status === 'Paid' ? parseFloat(studentData.quarter3.fees || 0) : 0) +
                (studentData.quarter4?.status === 'Paid' ? parseFloat(studentData.quarter4.fees || 0) : 0)
            );

            const totalFee = parseFloat(studentData.totalFee || 0);
            const remaining = totalFee - paidFees;

            setStudentInfo({
                name: studentData.studentName,
                totalFee,
                quarters: studentData,
            });

            setRemainingFee(remaining);
        } catch (error) {
            setPaymentStatus({ message: 'Error loading details. Check server connection.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchStudentInfo();
    }, []);

    const handleQuarterSelect = (quarter) => {
        setSelectedQuarter(prev => (prev === quarter ? null : quarter));
        setPaymentStatus('');
    };

    const handlePayment = async () => {
        if (!selectedQuarter) {
            setPaymentStatus({ message: 'Please select a quarter to proceed.', type: 'warning' });
            return;
        }

        setPaymentStatus(`Processing payment for ${selectedQuarter.toUpperCase()}...`);

        const token = Cookies.get('token');
        try {
            const response = await axios.post("http://localhost:7000/payfees", { quarter: selectedQuarter }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            if (response.status === 200) {
                setPaymentStatus({ message: `${selectedQuarter.toUpperCase()} payment successful!`, type: 'success' });
                setSelectedQuarter(null);
                await fetchStudentInfo();
            } else {
                setPaymentStatus({ message: `Payment failed: ${response.data.message || 'Unknown error.'}`, type: 'error' });
            }
        } catch (error) {
            setPaymentStatus({ message: 'Error during payment. Please check your network.', type: 'error' });
        }
    };

    const getStatusClass = () => {
        if (typeof paymentStatus === 'string' && paymentStatus.startsWith('Processing')) return 'info';
        if (paymentStatus && paymentStatus.type) return paymentStatus.type;
        return 'info';
    };

    const renderStatusBox = () => {
        if (!paymentStatus) return null;
        const message = typeof paymentStatus === 'string' ? paymentStatus : paymentStatus.message;
        return <p className={`status-message-box ${getStatusClass()}`}>{message}</p>;
    };
    
    if (loading) return (
        <div className="fee-payment-container">
            <p className="status-message-box info">Loading student financial details...</p>
        </div>
    );
    if (!studentInfo) return (
        <div className="fee-payment-container">
             {renderStatusBox()}
        </div>
    );

    const { totalFee, quarters } = studentInfo;
    const quarterFee = totalFee / 4;

    return (
        <div className="fee-payment-container">
            <h1>Fee Payment Portal</h1>
            <h2>Welcome, {studentInfo.name}</h2>

            <div className="fee-summary-wrapper">
                <p>Total Annual Fee: <strong>₹{totalFee.toFixed(2)}</strong></p>
                <p>Remaining Fee Due: <strong>₹{remainingFee.toFixed(2)}</strong></p>
            </div>

            <div className="quarter-selection-container">
                {['quarter1', 'quarter2', 'quarter3', 'quarter4'].map((quarter) => {
                    const isPaid = quarters[quarter]?.status === 'Paid';
                    const isSelected = selectedQuarter === quarter;
                    const quarterDisplay = quarter.charAt(0).toUpperCase() + quarter.slice(1);
                    
                    return (
                        <button
                            key={quarter}
                            onClick={() => handleQuarterSelect(quarter)}
                            disabled={isPaid}
                            className={`${isPaid ? 'paid' : ''} ${isSelected && !isPaid ? 'selected' : ''}`}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{quarterDisplay}</span>
                            <strong>
                                {isPaid ? 'Paid' : `₹${quarterFee.toFixed(2)}`}
                            </strong>
                        </button>
                    );
                })}
            </div>

            {renderStatusBox()}

            <button 
                onClick={handlePayment} 
                disabled={!selectedQuarter || remainingFee <= 0 || (typeof paymentStatus === 'string' && paymentStatus.startsWith('Processing'))}
                className="payment-button"
            >
                {selectedQuarter ? `Proceed to Pay ₹${quarterFee.toFixed(2)}` : 'Select a Quarter to Pay'}
            </button>
        </div>
    );
};

export default FeePayment;