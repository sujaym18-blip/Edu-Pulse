import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { 
    FaListAlt, FaUserGraduate, FaEnvelope, FaFilePdf, FaEdit, 
    FaSpinner, FaTimesCircle, FaLink, FaCalendarAlt, FaIdBadge, FaHourglassHalf,
    FaSearch, FaTimes
} from 'react-icons/fa';
import '../CSS/viewsubmissionss.css';
const FILE_BASE_URL = 'http://localhost:7000/uploads/'; 

const ViewSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const fetchSubmissions = useCallback(async () => {
        const token = cookie.get('emstoken');
        if (!token) {
            setError("You need to be logged in as staff. Redirecting...");
            setTimeout(() => navigate('/StaffLogin'), 2000);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:7000/viewsubmission', {
                withCredentials: true,
            });

            const sortedSubmissions = (response.data.submission || []).sort((a, b) =>
                (a.studentName || '').localeCompare(b.studentName || '', undefined, { sensitivity: 'base', numeric: true })
            );
            setSubmissions(sortedSubmissions);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError('Failed to fetch submissions. Please check the server connection or API endpoint.');
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleAddRemarkClick = (submissionId) => {
        navigate(`/AssFeed/${submissionId}`);
    };

    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    const filteredSubmissions = submissions.filter((submission) =>
        (submission.studentName || '').toLocaleLowerCase().includes(normalizedSearch)
    );

    if (error) {
        return (
            <div className="submissions-container error-state">
                <FaTimesCircle className="status-icon" />
                <p>{error}</p>
                <button className="error-button" onClick={() => navigate('/')}>Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="submissions-container">
            <h1 className="page-title"><FaListAlt /> All Submitted Assignments ({filteredSubmissions.length})</h1>
            
            <div className="submission-search">
                <FaSearch aria-hidden="true" />
                <input
                    type="search"
                    aria-label="Search students by name"
                    placeholder="Search students by name..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm && (
                    <button
                        type="button"
                        className="clear-search-button"
                        aria-label="Clear student search"
                        onClick={() => setSearchTerm('')}
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
            <p className="submission-results-count" aria-live="polite">
                {loading
                    ? 'Loading submissions...'
                    : `Showing ${filteredSubmissions.length} of ${submissions.length} submissions, sorted by student name (A–Z)`}
            </p>

            {loading ? (
                <div className="loading-state">
                    <FaSpinner className="status-icon spinner" />
                    <p>Loading submitted assignments...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="no-data-state">
                    <FaHourglassHalf className="status-icon" />
                    <p>No assignment submissions found yet for your assigned list.</p>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="no-data-state">
                    <FaSearch className="status-icon" />
                    <p>No students match “{searchTerm}”. Try another name or clear the search.</p>
                </div>
            ) : (
                <div className="submission-list">
                    {filteredSubmissions.map((submission) => {
                        const fullPdfUrl = submission.submissionFile 
                                         ? `${FILE_BASE_URL}${submission.submissionFile}` 
                                         : null;

                        return (
                            <div key={submission._id} className="submission-row-card">
                                <div className="card-primary-details">
                                    <h3 className="student-name-header">
                                        <FaUserGraduate /> {submission.studentName || 'Unknown Student'}
                                    </h3>
                                    <p className="student-id-highlight">
                                        <FaIdBadge /> Student ID: <strong>{submission.studentId || 'N/A'}</strong>
                                    </p>
                                    <p className="submission-date-info">
                                        <FaCalendarAlt /> Submitted On: <span>{formatDate(submission.submissionDate)}</span>
                                    </p>
                                </div>
                                
                                <div className="card-secondary-details">
                                    <p className="assignment-id-info">
                                        Assignment ID: {submission.assignId || 'N/A'}
                                    </p>
                                    <p className="email-info">
                                        <FaEnvelope /> {submission.studentEmail || 'N/A'}
                                    </p>
                                    <p className="record-id-info">
                                        Record ID: {submission._id}
                                    </p>
                                </div>

                                <div className="card-actions">
                                    {fullPdfUrl ? (
                                        <a href={fullPdfUrl} target="_blank" rel="noopener noreferrer" className="action-button view-pdf-button">
                                            <FaLink /> View File
                                        </a>
                                    ) : (
                                        <span className="file-missing-tag">
                                            <FaTimesCircle /> File Missing
                                        </span>
                                    )}
                                    
                                    <button onClick={() => handleAddRemarkClick(submission._id)} className="action-button remark-button">
                                        <FaEdit /> Grade & Feedback
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewSubmissions;