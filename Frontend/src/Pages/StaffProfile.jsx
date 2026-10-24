import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    FaUserCircle, FaEnvelope, FaPhone, FaBuilding, 
    FaIdCard, FaMapMarkerAlt, FaCity, FaCamera, FaTimes
} from 'react-icons/fa';
import '../CSS/staffprofile.css'

const StaffProfile = () => {
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");

    useEffect(() => {
        if (!selectedImage) {
            setPreviewUrl("");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(selectedImage);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    const fetchStaffProfile = async () => {
        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:7000/staffprofile`, {
                withCredentials: true, 	
            });
            
            const profileData = response.data.profile;
            setStaff(profileData); 
            setError("");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to fetch staff profile. Please log in again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffProfile(); 
    }, []);

    const handleImageSelection = (event) => {
        const image = event.target.files?.[0];
        event.target.value = "";
        setUploadError("");
        setUploadSuccess("");
        if (!image) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(image.type)) {
            setUploadError("Choose a JPG, PNG, or WEBP image.");
            return;
        }
        if (image.size > 5 * 1024 * 1024) {
            setUploadError("Profile image must be 5 MB or smaller.");
            return;
        }
        setSelectedImage(image);
    };

    const handleImageUpload = async (event) => {
        event.preventDefault();
        if (!selectedImage) return;

        const formData = new FormData();
        formData.append("image", selectedImage);
        setUploading(true);
        setUploadError("");
        setUploadSuccess("");
        try {
            const response = await axios.put("http://localhost:7000/staffprofile/image", formData, {
                withCredentials: true,
            });
            setStaff(response.data.profile);
            setSelectedImage(null);
            setUploadSuccess(response.data.msg || "Profile photo updated successfully.");
        } catch (uploadRequestError) {
            const status = uploadRequestError.response?.status;
            const serverMessage = uploadRequestError.response?.data?.msg
                || uploadRequestError.response?.data?.message;
            setUploadError(
                status === 404
                    ? "The profile photo upload endpoint is not available. Restart the backend server, then try again."
                    : serverMessage || uploadRequestError.message || "Unable to upload profile photo. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    if (error) return <div className="profile-container"><div className="simple-card profile-error">{error}</div></div>; 
    
    if (loading) {
        return (
            <div className="profile-container">
                <div className="simple-card profile-loading">
                    <div className="spinner"></div>
                    <p>Loading Staff Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {staff ? (
                <div className="simple-card">
                    
                    <div className="simple-header">
                        {staff.image ? (
                            <img 
                                src={previewUrl || `http://localhost:7000/images/${staff.image}`} 
                                alt={staff.name} 
                                className="staff-photo"
                            />
                        ) : (
                            previewUrl
                                ? <img src={previewUrl} alt="Selected profile preview" className="staff-photo" />
                                : <FaUserCircle className="staff-photo-placeholder" />
                        )}
                        <h2 className="profile-name">{staff.name}</h2>
                        <form className="profile-photo-form" onSubmit={handleImageUpload}>
                            <label className="profile-photo-select" htmlFor="staff-profile-image">
                                <FaCamera />
                                {selectedImage ? "Choose a different photo" : "Choose profile photo"}
                            </label>
                            <input
                                id="staff-profile-image"
                                className="profile-photo-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageSelection}
                            />
                            {selectedImage && (
                                <div className="profile-photo-actions">
                                    <button type="submit" className="profile-photo-save" disabled={uploading}>
                                        {uploading ? "Uploading..." : "Save photo"}
                                    </button>
                                    <button
                                        type="button"
                                        className="profile-photo-cancel"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setUploadError("");
                                        }}
                                        disabled={uploading}
                                        aria-label="Cancel selected profile photo"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                            <p className="profile-photo-hint">JPG, PNG, or WEBP. Maximum size: 5 MB.</p>
                            {uploadError && <p className="profile-photo-message profile-photo-error" role="alert">{uploadError}</p>}
                            {uploadSuccess && <p className="profile-photo-message profile-photo-success" role="status">{uploadSuccess}</p>}
                        </form>
                    </div>

                    <div className="simple-details">
            
                        <div className="detail-row">
                            <FaIdCard className="detail-icon" />
                            <strong>Staff ID:</strong> <span>{staff.id}</span>
                        </div>
                       
                        <div className="detail-row">
                            <FaBuilding className="detail-icon" />
                            <strong>Department:</strong> <span>{staff.department}</span>
                        </div>
                        <hr/>
                    
                        <div className="detail-row">
                            <FaPhone className="detail-icon" />
                            <strong>Contact:</strong> <span>{staff.contact}</span>
                        </div>
                    
                        <div className="detail-row">
                            <FaEnvelope className="detail-icon" />
                            <strong>Email:</strong> <span className="link-style">{staff.email}</span>
                        </div>
                        <hr/>
                     
                        <div className="detail-row full-address">
                            <FaMapMarkerAlt className="detail-icon" />
                            <strong>Address:</strong> <span>{staff.address}</span>
                        </div>
                      
                        <div className="detail-row">
                            <FaCity className="detail-icon" />
                            <strong>City:</strong> <span>{staff.city}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="simple-card profile-not-found">No Staff Found</div>
            )}
        </div>
    );
};

export default StaffProfile;