import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEnvelope, faPhone, faMapMarkerAlt, faBuilding, faEdit, faChevronLeft, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import '../CSS/ViewStaffProfile.css'; 

const BASE_URL = 'http://localhost:7000';

const ViewStaffProfile = () => {
    const { staffId } = useParams();
    const navigate = useNavigate();

    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [departmentName, setDepartmentName] = useState("N/A"); 

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const staffResponse = await axios.get(`${BASE_URL}/viewbyidstaff/${staffId}`);
            const staffData = staffResponse.data.staff; 
            setStaff(staffData);

            if (staffData.department) {
                const deptResponse = await axios.get(`${BASE_URL}/viewdepartment`);
                const deptList = deptResponse.data.dept || [];
                const department = deptList.find(d => d.departId === staffData.department);
                setDepartmentName(department ? department.departName : "Unknown Department");
            } else {
                setDepartmentName("No Department Assigned");
            }
            
            setLoading(false);
        } catch (err) {
            setError("Staff profile fetch failed. Check ID or server connection.");
            setLoading(false);
        }
    }, [staffId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    if (loading) {
        return (
            <div className="profile-page-container">
                <div className="loading-state">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    <p>Staff profile load ho raha hai...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page-container">
                <div className="error-state">
                    <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!staff) {
        return <div className="profile-page-container">Staff profile not found.</div>;
    }

    return (
        <div className="profile-page-container">
            <div className="profile-card-wrap">
                <header className="profile-header">
                    <h1 className="profile-title">
                        <FontAwesomeIcon icon={faUserCircle} className="title-icon" />
                        Staff Profile: {staff.name}
                    </h1>
                    <div className="profile-actions">
                        <button
                            className="profile-button-edit"
                            onClick={() => navigate(`/UpdateStaff/${staffId}`)}
                        >
                            <FontAwesomeIcon icon={faEdit} /> Edit Profile
                        </button>
                        <button
                            className="profile-button-back"
                            onClick={() => navigate(-1)}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} /> Back
                        </button>
                    </div>
                </header>

                <div className="profile-content-grid">
                    
                    <div className="profile-image-section profile-basic-info">
                        <FontAwesomeIcon icon={faUserCircle} size="5x" style={{color: '#007bff', marginBottom: '15px'}} />
                        <h2 className="staff-name-display">{staff.name}</h2>
                        <p className="staff-department-display"><FontAwesomeIcon icon={faBuilding} /> {departmentName}</p>
                    </div>

                    <div className="profile-details-section">
                        <h3>Contact & Location Details</h3>
                        
                        <div className="detail-item">
                            <span className="detail-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{staff.email}</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-icon"><FontAwesomeIcon icon={faPhone} /></span>
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{staff.contact || 'N/A'}</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{staff.address || 'N/A'}, {staff.city || 'N/A'}</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-icon"><FontAwesomeIcon icon={faBuilding} /></span>
                            <span className="detail-label">Department ID:</span>
                            <span className="detail-value">{staff.department}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStaffProfile;