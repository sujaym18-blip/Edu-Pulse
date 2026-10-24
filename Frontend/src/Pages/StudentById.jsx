import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FaUserGraduate, 
    FaEnvelope, 
    FaMapMarkerAlt, 
    FaPhone, 
    FaCalendarAlt, 
    FaMoneyBillWave, 
    FaChevronLeft,
    FaSpinner, 
    FaExclamationTriangle,
    FaIdCard 
} from 'react-icons/fa';
import '../CSS/profilestudent.css'; 

const BASE_URL = 'http://localhost:7000'; 

const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
        return 'N/A';
    }
};

const ProfileStudent = ({ staffView = false }) => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStudentData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const endpoint = staffView ? 'staff/viewbyidstudent' : 'viewbyidstudent';
            const response = await axios.get(`${BASE_URL}/${endpoint}/${id}`, {
                withCredentials: true,
            });
            setStudent(response.data.student);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err.response ? err.response.data : err.message);
            setError("Failed to fetch student profile: " + (err.response?.data?.msg || err.message));
            setLoading(false);
        }
    }, [id, staffView]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    if (loading) {
        return (
            <div className="profile-container profile-state loading-state">
                <FaSpinner className="spinner-icon" />
                <p>Loading Student Profile...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="profile-container profile-state error-state">
                <FaExclamationTriangle />
                <p>{error || "Student data not found."}</p>
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaChevronLeft /> Go Back
                </button>
            </div>
        );
    }
    
    return (
        <div className="profile-container">
            <div className="profile-card">
                
                <header className="profile-card__header">
                    <button className="back-button" onClick={() => navigate(-1)} title="Go Back">
                        <FaChevronLeft /> Back to List
                    </button>
                    <h1 className="profile-title">
                        <FaUserGraduate className="title-icon" /> {student.name || 'Student'} Profile
                    </h1>
                    {!staffView && (
                        <button 
                            className="edit-button" 
                            onClick={() => navigate(`/UpdateStudent/${student._id}`)}
                            title="Edit Student"
                        >
                            Edit Profile
                        </button>
                    )}
                </header>
                
                <div className="profile-content-grid">
                    
                    <div className="detail-group detail-group--name">
                        <FaUserGraduate className="detail-icon" />
                        <div className="detail-text">
                            <label>Full Name</label>
                            <h2 className="profile-main-data">{student.name || 'N/A'}</h2>
                        </div>
                    </div>

                    <div className="detail-group detail-group--id">
                        <FaIdCard className="detail-icon" />
                        <div className="detail-text">
                            <label>Student ID</label>
                            <p className="profile-main-data">{student.id || student._id || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="detail-group">
                        <FaEnvelope className="detail-icon" />
                        <div className="detail-text">
                            <label>Email Address</label>
                            <p>{student.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="detail-group">
                        <FaPhone className="detail-icon" />
                        <div className="detail-text">
                            <label>Contact Number</label>
                            <p>{student.contact || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="detail-group detail-group--full-row">
                        <FaMapMarkerAlt className="detail-icon" />
                        <div className="detail-text">
                            <label>Full Address</label>
                            <p>{student.address && student.city ? `${student.address}, ${student.city}` : student.address || student.city || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="detail-group">
                        <FaCalendarAlt className="detail-icon" />
                        <div className="detail-text">
                            <label>Date of Birth</label>
                            <p>{formatDisplayDate(student.dob)}</p>
                        </div>
                    </div>

                    <div className="detail-group">
                        <FaMoneyBillWave className="detail-icon" />
                        <div className="detail-text">
                            <label>Total Fee</label>
                            <p>₹ {student.totalfee?.toLocaleString('en-IN') || '0'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileStudent;