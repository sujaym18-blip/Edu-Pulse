import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaRoute, FaBusAlt, FaClock, FaMapMarkerAlt, FaPhone, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../CSS/studenttransportdetails.css'; 

const StudentTransportDetails = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStudentDetails = async () => {
        try {
            const response = await axios.get('http://localhost:7000/viewallstudenttransport'); 
            
            setStudents(response.data.stu); 
            setLoading(false);
        } catch (err) {
            console.error("Error fetching student transport data:", err);
            setError('Failed to fetch student transport details. Check server connection.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentDetails();
    }, []);

    if (loading) {
        return (
            <div className="transport-users-container">
                <div className="state-message loading-state"><FaSpinner className="spinner" /> Loading student transport data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="transport-users-container">
                <div className="state-message error-state"><FaExclamationTriangle /> {error}</div>
            </div>
        );
    }

    return (
        <div className="transport-users-container">
            <h1 className="page-title"><FaBusAlt className="title-icon" /> Student Transport Details</h1>

            {students.length === 0 ? (
                <div className="state-message no-data">
                    <p>No students registered for transport service yet.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="transport-details-table">
                        <thead>
                            <tr>
                                <th><FaUserGraduate /> Student Details</th>
                                <th><FaRoute /> Route & Stop</th>
                                <th><FaClock /> Timings (Arr/Dep)</th>
                                <th><FaPhone /> Contact Info</th>
                                <th><FaMapMarkerAlt /> Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.studentId} className="student-row">
                                    <td data-label="Student Details">
                                        <div className="student-name">{student.studentName}</div>
                                        <div className="student-id">ID: {student.studentId}</div>
                                    </td>
                                    <td data-label="Route & Stop">
                                        <div className="route-name">Route: **{student.Route}**</div>
                                        <div className="stop-name">Stop: {student.Stop}</div>
                                    </td>
                                    
                                    <td data-label="Timings (Arr/Dep)">
                                        <div className="timing arrival">Arrival: {student.arrivalTime}</div>
                                        <div className="timing departure">Departure: {student.departureTime}</div>
                                    </td>
                                    
                                    <td data-label="Contact Info" className="contact-cell">
                                        {student.contactNumber}
                                    </td>
                                    <td data-label="Address" className="address-cell">
                                        {student.address}
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

export default StudentTransportDetails;