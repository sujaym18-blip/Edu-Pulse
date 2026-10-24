import React, { useState, useEffect } from "react";
import axios from "axios";
import cookie from 'js-cookie'; 
import { FaUserCircle, FaIdCard, FaEnvelope, FaPhoneAlt, FaMapMarkedAlt, FaCity, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import '../CSS/studentprofile.css'; 

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStudentProfile = async () => {
        setLoading(true);
        const token = cookie.get('token'); 
        
        if (!token) {
            setError("Authentication Required: Please log in to view your profile.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:7000/admstudentprofile`, {
                withCredentials: true,
            });
            
            setStudent(response.data.student); 
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError("Failed to fetch student profile. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentProfile();
    }, []);
    if (loading) {
        return (
            <div className="profile-container-two">
                <div className="status-message loading-state"><FaSpinner className="spinner" /> Loading profile data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container-two">
                <div className="status-message error-state"><FaExclamationCircle /> {error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container-two">
            {student ? (
                <div className="simple-card-two">
                    
                    <div className="simple-header-two">
                        <FaUserCircle className="profile-photo-placeholder" /> 
                        <h2 className="profile-name-two">{student.name || "N/A"}</h2>
                        <p className="profile-role">Student</p>
                    </div>

                    <div className="simple-details-two">
                        
                        <h3 className="details-heading">Personal Information</h3>
                        
                        <div className="detail-row-two">
                            <FaIdCard className="detail-icon-two" />
                            <strong>Student ID:</strong> <span>{student.id || "N/A"}</span>
                        </div>
                        
                        <div className="detail-row-two">
                            <FaEnvelope className="detail-icon-two" />
                            <strong>Email:</strong> <span className="link-style">{student.email || "N/A"}</span>
                        </div>

                        <div className="detail-row-two">
                            <FaPhoneAlt className="detail-icon-two" />
                            <strong>Contact:</strong> <span>{student.contact || "N/A"}</span>
                        </div>
                        
                        <hr className="detail-separator"/>

                        <h3 className="details-heading">Address Details</h3>

                        <div className="detail-row-two">
                            <FaCity className="detail-icon-two" />
                            <strong>City:</strong> <span>{student.city || "N/A"}</span>
                        </div>

                        <div className="detail-row-two full-address-two">
                            <FaMapMarkedAlt className="detail-icon-two" />
                            <strong>Address:</strong> <span>{student.address || "N/A"}</span>
                        </div>
                        
                    </div>
                </div>
            ) : (
                <div className="simple-card-two profile-not-found-two">No Student Profile Found</div>
            )}
        </div>
    );
};

export default StudentProfile;