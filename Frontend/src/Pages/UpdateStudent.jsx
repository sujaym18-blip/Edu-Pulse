import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserEdit, FaSave, FaChevronLeft, FaSpinner } from 'react-icons/fa';
import '../CSS/updatestudent.css'; 

const BASE_URL = 'http://localhost:7000'; 

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const UpdateStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState({
        name: "",
        email: "",
        address: "",
        contact: "",
        city: "",
        image: "", 
        dob: "",
        totalfee: 0, 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const fetchStudentData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${BASE_URL}/viewbyidstudent/${id}`); 
            const studentData = response.data.student;
            
            setStudent({
                name: studentData.name || "",
                email: studentData.email || "",
                address: studentData.address || "",
                contact: studentData.contact || "",
                city: studentData.city || "",
                image: studentData.image || "", 
                dob: formatDate(studentData.dob),
            });
            
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err.response ? err.response.data : err.message);
            setError("Failed to fetch student data: " + (err.response?.data?.msg || err.message));
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image" && files.length > 0) {
            setStudent((prev) => ({ ...prev, image: files[0] }));
        } else if (name !== "image") {
            setStudent((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage({ type: 'loading', text: 'Saving changes...' });
        setError("");
        
        try {
            const formDataToSend = new FormData();
            
            for (let key in student) {
                if (key === 'image' && student[key] instanceof File) {
                    formDataToSend.append(key, student[key]);
                } 
                else if (key !== 'image' || (typeof student[key] === 'string' && student[key] !== '')) {
                    formDataToSend.append(key, student[key]);
                }
            }
            
            const response = await axios.put(
                `${BASE_URL}/updatestudent/${id}`, 
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            
            if (response.status === 200) {
                setSubmitMessage({ type: 'success', text: 'Student updated successfully!' });
                setTimeout(() => {
                    navigate("/ViewStudent");
                }, 1500);
            }
        } catch (err) {
            console.error("Update Error:", err);
            const errorText = err.response?.data?.msg || 'Failed to update student record.';
            setSubmitMessage({ type: 'error', text: errorText });
        }
    };

    const profileImageUrl = student.image && typeof student.image === 'string' 
        ? `${BASE_URL}/${student.image}` 
        : 'https://via.placeholder.com/100?text=No+Image';


    return (
        <div className="update-page__container">
            <div className="update-card__wrap">
                <header className="update-card__header">
                    <h1 className="update-card__title">
                        <FaUserEdit className="title__icon" />
                        Update Student Information 
                    </h1>
                    <button
                        className="header__back-button"
                        onClick={() => navigate(-1)}
                        title="Go Back"
                    >
                        <FaChevronLeft /> Back
                    </button>
                </header>

                {(loading || error || submitMessage.text) && (
                    <div className={`message__bar message__bar--${error ? 'error' : submitMessage.type}`}>
                        {loading ? (
                            <span><FaSpinner spin /> Fetching data...</span>
                        ) : error ? (
                            error
                        ) : (
                            submitMessage.text
                        )}
                    </div>
                )}

                {!loading && !error && (
                    <form onSubmit={handleSubmit} className="update-form">
                        
                        <div className="form-section form-section--personal">
                            <h3>Personal Details</h3>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" name="name" value={student.name} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" value={student.email} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact</label>
                                <input type="number" name="contact" value={student.contact} onChange={handleInputChange} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" name="dob" value={student.dob} onChange={handleInputChange} className="form-input" />
                            </div>
                        </div>

                        <div className="form-section form-section--address">
                            <h3>Location</h3>
                            <div className="form-group form-group--full">
                                <label className="form-label">Address</label>
                                <input type="text" name="address" value={student.address} onChange={handleInputChange} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" name="city" value={student.city} onChange={handleInputChange} className="form-input" />
                            </div>

                        </div>

                        <div className="form-section form-section--image">
                            <h3>Image Upload</h3>
                            <div className="form-group form-group--full">
                                <label className="form-label">Upload New Image (Optional)</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="form-input form-input--file"
                                />
                            </div>
                        </div>
                        
                        <div className="form-action">
                            <button type="submit" className="form-button__submit" disabled={submitMessage.type === 'loading'}>
                                <FaSave /> 
                                {submitMessage.type === 'loading' ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdateStudent;