import React, { useState } from "react";
import axios from "axios";
import { FaUpload, FaCalendarAlt, FaFileAlt, FaTags, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

import '../CSS/assignmentpage.css'; 

const Assignment = () => {
    const [assignment, setAssignment] = useState({
        Id: "",
        Title: "",
        IssueDate: "",
        SubmissionDate: "",
        Description: "",
    });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAssignment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        if (!file) {
            setMessage("Please upload the assignment file.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("Id", assignment.Id);
        formData.append("Title", assignment.Title);
        formData.append("IssueDate", assignment.IssueDate);
        formData.append("SubmissionDate", assignment.SubmissionDate);
        formData.append("Description", assignment.Description);
        formData.append("Assignment", file); 

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        };

        try {
            const response = await axios.post(
                "http://localhost:7000/create", 
                formData,
                config 
            );

            setAssignment({
                Id: "",
                Title: "",
                IssueDate: "",
                SubmissionDate: "",
                Description: "",
            });
            setFile(null); 
            
            setMessage(response.data.msg);
        } catch (error) {
            const errorMsg = error.response?.data?.msg || error.message;
            setMessage("Error creating assignment: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assignment-page-wrapper">
            <header className="page-header-section">
                <h1 className="page-title"><FaFileAlt /> Register New Assignment</h1>
                <p className="subtitle">Staff members can use this form to create and publish new assignments.</p>
            </header>

            <form className="assignment-form" onSubmit={handleSubmit}>
                
        
                <div className="form-group-row">
                    <div className="form-field">
                        <label htmlFor="Id"><FaTags /> Assignment ID (Unique)</label>
                        <input
                            type="text"
                            id="Id"
                            name="Id"
                            value={assignment.Id}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="Title"><FaFileAlt /> Assignment Title</label>
                        <input
                            type="text"
                            id="Title"
                            name="Title"
                            value={assignment.Title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

              
                <div className="form-group-row">
                    <div className="form-field">
                        <label htmlFor="IssueDate"><FaCalendarAlt /> Issue Date</label>
                        <input
                            type="date"
                            id="IssueDate"
                            name="IssueDate"
                            value={assignment.IssueDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="SubmissionDate"><FaClock /> Final Submission Date</label>
                        <input
                            type="date"
                            id="SubmissionDate"
                            name="SubmissionDate"
                            value={assignment.SubmissionDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-field full-width">
                    <label htmlFor="Description"><FaFileAlt /> Detailed Description</label>
                    <textarea
                        id="Description"
                        name="Description"
                        rows="4"
                        value={assignment.Description}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-field full-width file-upload-area">
                    <label htmlFor="assignment-file"><FaUpload /> Upload Assignment Document (PDF)</label>
                    <input 
                        key={file ? 'file-selected' : 'file-cleared'} 
                        type="file" 
                        id="assignment-file" 
                        onChange={handleFileChange} 
                        accept="application/pdf" 
                        required 
                    />
                    {file && <p className="uploaded-file-name">Selected: <strong>{file.name}</strong></p>}
                </div>
                
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? (
                        <>Registering...</>
                    ) : (
                        <>Register Assignment</>
                    )}
                </button>
            </form>

            {message && (
                <div className={`message-box ${message.includes("Error") ? 'error' : 'success'}`}>
                    {message.includes("Error") ? <FaExclamationCircle /> : <FaCheckCircle />}
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
};

export default Assignment;