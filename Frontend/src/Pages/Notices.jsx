import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlusCircle, FaRegCalendarAlt, FaBullhorn, FaPaperPlane, FaSpinner, FaEye, FaListAlt } from 'react-icons/fa'; 
import '../CSS/notice.css'; 

const Notices = () => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "", 
        eventDate: "",
        issueDate: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const noticeTypes = [
        { label: "Select Notice Type", value: "" },
        { label: "Important / Urgent Alert", value: "Important" },
        { label: "General Announcement", value: "General Announcement" },
        { label: "New Event / Program", value: "New Event" },
        { label: "Circular / Information", value: "Information" },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); 
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (
            !formData.title ||
            !formData.content ||
            !formData.type || 
            !formData.eventDate ||
            !formData.issueDate
        ) {
            setError("All fields including 'Notice Type' are required!");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:7000/addnotice", 
                formData, 
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                setSuccess("Notice successfully published!");
                setFormData({
                    title: "",
                    content: "",
                    type: "", 
                    eventDate: "",
                    issueDate: "",
                });
                
                setTimeout(() => {
                    navigate("/ViewNotices");
                }, 3000);
            }
        } catch (err) {
            console.error("Notice API Error:", err);
            setError("Failed to register the notice. Server error or network issue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-notice-page">
            <div className="form-card-container">
                
                <div className="form-header">
                    <FaPlusCircle className="header-icon" />
                    <h2>Publish New Notice</h2>
                </div>

                {loading && <p className="status-message loading-state"><FaSpinner className="spinner" /> Publishing...</p>}
                {error && <p className="status-message error-state">{error}</p>}
                {success && <p className="status-message success-state">{success}</p>}

                <form onSubmit={handleSubmit} className="notice-form">
                    
                    <div className="form-field-group">
                        <label htmlFor="type"><FaListAlt /> Notice Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className={!formData.type ? 'placeholder-selected' : ''} 
                        >
                            {noticeTypes.map((option) => (
                                <option 
                                    key={option.value} 
                                    value={option.value}
                                    disabled={!option.value} 
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field-group">
                        <label htmlFor="title"><FaBullhorn /> Notice Title</label>
                        <input
                            type="text"
                            id="title"
                            placeholder="e.g., Annual Sports Day Announcement"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field-group">
                        <label htmlFor="content">Content / Detailed Message</label>
                        <textarea
                            id="content"
                            placeholder="Write the detailed content of the notice here..."
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="6"
                            required
                        />
                    </div>
                    
                    <div className="date-field-row">
                        <div className="form-field-group date-field">
                            <label htmlFor="eventDate"><FaRegCalendarAlt /> Event/Last Date</label>
                            <input
                                type="date"
                                id="eventDate"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-field-group date-field">
                            <label htmlFor="issueDate"><FaRegCalendarAlt /> Publication Date</label>
                            <input
                                type="date"
                                id="issueDate"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        <FaPaperPlane /> {loading ? 'Submitting...' : 'Publish Notice'}
                    </button>
                </form>

                <div className="view-notices-link">
                    <p>
                        Want to review published notices?
                        <Link to="/ViewNotices" className="view-link">
                            <FaEye /> View All Notices
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Notices;