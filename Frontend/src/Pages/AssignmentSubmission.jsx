import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import cookie from 'js-cookie'; 
import { FaPaperPlane, FaFilePdf, FaIdCard, FaUser, FaEnvelope, FaExclamationCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import '../CSS/assignmentSubmission.css'; 
const AssignmentSubmission = () => {
    const { assignmentId } = useParams(); 

    const [studentProfile, setStudentProfile] = useState(null);
    const [stuName, setStuName] = useState('');
    const [stuEmail, setStuEmail] = useState('');
    const [stuId, setStuId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [authLoading, setAuthLoading] = useState(true);
    const fetchUserDetails = async () => {
        setAuthLoading(true);
        setError('');
        const token = cookie.get('token'); 

        if (!token) {
            setError("Authentication Error: You need to be logged in (Student) to submit assignments.");
            setAuthLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:7000/admstudentprofile`, 
                {
                    withCredentials: true, 
                }
            );

            const profile = response.data.student;
            setStuEmail(profile.email);
            setStuId(profile.id); 
            setStuName(profile.name); 
            setStudentProfile(profile);
            
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            setError("Failed to fetch student profile. Please log in again.");
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
        setError(''); 
        setSuccessMessage(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (authLoading || !stuId) {
            setError("Student data is still loading or could not be fetched. Please wait.");
            return;
        }

        if (!pdfFile || pdfFile.type !== 'application/pdf') {
            setError('Please select a valid PDF file for submission.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('stuId', stuId); 
        formData.append('stuName', stuName);
        formData.append('stuEmail', stuEmail);
        formData.append('assignId', assignmentId); 
        formData.append('submissionFile', pdfFile);

        try {
            const response = await axios.post('http://localhost:7000/submission', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true, 
            });

            if (response.data.success) {
                setSuccessMessage(response.data.msg);
                setPdfFile(null); 
            } else {
                 setError(response.data.msg || 'Submission failed without a specific error message.');
            }
        } catch (err) {
            console.error("Submission Error:", err.response || err);
            const serverError = err.response?.data?.msg || 'Error submitting assignment. Check file size/format.';
            setError(serverError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submission-page-wrapper">
            <header className="submission-header">
                <h1 className="submission-title"><FaPaperPlane /> Assignment Submission</h1>
                <p className="submission-subtitle">Assignment ID: <strong>{assignmentId}</strong></p>
            </header>
            {authLoading && (
                <div className="status-message loading-box">
                    <FaSpinner className="icon spinner" />
                    <p>Fetching student credentials...</p>
                </div>
            )}
            {error && (
                <div className="status-message error-box">
                    <FaExclamationCircle className="icon" />
                    <p>{error}</p>
                </div>
            )}
            {successMessage && (
                <div className="status-message success-box">
                    <FaCheckCircle className="icon" />
                    <p>{successMessage}</p>
                </div>
            )}
            {!authLoading && stuId && (
                <div className="student-info-card">
                    <h3>Your Credentials (Auto-filled)</h3>
                    <p><FaIdCard /> Student ID: <span>{stuId}</span></p>
                    <p><FaUser /> Name: <span>{stuName}</span></p>
                    <p><FaEnvelope /> Email: <span>{stuEmail}</span></p>
                </div>
            )}

            {!authLoading && stuId && (
                <form className="submission-form" onSubmit={handleSubmit}>
                    <div className="file-upload-field">
                        <label htmlFor="submissionFile"><FaFilePdf /> Upload Assignment (PDF only):</label>
                        <input
                            key={pdfFile ? 'file-selected' : 'file-cleared'} 
                            id="submissionFile"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />
                         {pdfFile && <p className="uploaded-file-name">Selected File: <strong>{pdfFile.name}</strong></p>}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading || !stuId}>
                        {loading ? (
                            <> <FaSpinner className="icon spinner" /> Submitting...</>
                        ) : (
                            <> <FaPaperPlane /> Final Submit</>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default AssignmentSubmission;