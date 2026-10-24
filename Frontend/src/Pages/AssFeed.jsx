import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FaGraduationCap, FaClipboardCheck, FaUserGraduate, FaEnvelope, 
    FaBook, FaBullhorn, FaCheckCircle, FaTimesCircle, FaChevronLeft, 
    FaSortNumericUpAlt
} from 'react-icons/fa';
import '../CSS/assignmentfeedbacks.css';

const AssignmentFeedback = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [submissionDetails, setSubmissionDetails] = useState(null); 
    const [initialFetchAttempted, setInitialFetchAttempted] = useState(false); 

    const isStaffLoggedIn = true;
    const isLoadingAuth = false;

    const fetchSubmissionDetails = async () => {
        setError('');
        try {
            const response = await axios.get(
                `http://localhost:7000/findSubmissionById/${submissionId}`,
                { withCredentials: true }
            );

            setSubmissionDetails(response.data.submission);

            if (response.data.submission.marks) {
                setMarks(response.data.submission.marks);
            }
            if (response.data.submission.feedback) {
                setFeedback(response.data.submission.feedback);
            }
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/staff/login');
                return;
            }
            setError('Failed to fetch submission details. Check ID and server connection.');
        } finally {
            setInitialFetchAttempted(true);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (
            !marks ||
            !feedback ||
            isNaN(marks) ||
            parseFloat(marks) < 0 ||
            !submissionDetails
        ) {
            setError('Please ensure marks are valid, feedback is entered, and details are loaded.');
            return;
        }

        const feedbackData = {
            submissionId: submissionId,
            stuId: submissionDetails.studentId,
            stuName: submissionDetails.studentName,
            stuEmail: submissionDetails.studentEmail,
            assignId: submissionDetails.assignId,
            marks: parseFloat(marks),
            feedback: feedback,
        };

        try {
            const response = await axios.post(
                'http://localhost:7000/assfeedback',
                feedbackData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setSuccessMessage('Feedback submitted successfully!');
            } else {
                setError(response.data.message || 'Submission failed on server.');
            }
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Session expired or unauthorized. Redirecting to login...');
                setTimeout(() => navigate('/staff/login'), 1500);
                return;
            }
            setError('Error submitting feedback. Server or network issue.');
        }
    };

    useEffect(() => {
        if (isLoadingAuth) return;

        if (!isStaffLoggedIn) {
            navigate('/staff/login');
            return;
        }

        fetchSubmissionDetails();
    }, [submissionId, navigate, isStaffLoggedIn, isLoadingAuth]);

    if (isLoadingAuth || (!initialFetchAttempted && isStaffLoggedIn)) {
        return (
            <div className="feedback-wrapper minimal-initial-state">
                <p>Checking Authorization and Loading Submission Data...</p>
            </div>
        );
    }

    if (!submissionDetails) {
        return (
            <div className="feedback-wrapper error-state">
                <FaTimesCircle className="status-icon" />
                <p>{error || 'Could not retrieve submission details.'}</p>
                <button
                    className="back-button primary-button"
                    onClick={() => navigate('/ViewSubmission')}
                >
                    <FaChevronLeft /> Back to Submissions List
                </button>
            </div>
        );
    }

    return (
        <div className="feedback-wrapper">
            <div className="feedback-header">
                <button
                    className="back-button"
                    onClick={() => navigate('/ViewSubmission')}
                >
                    <FaChevronLeft /> Back to Submissions
                </button>
                <h1 className="page-title">
                    <FaGraduationCap /> Grade Assignment Submission
                </h1>
            </div>

            <div className="details-card submission-info-card">
                <h2 className="card-heading">
                    <FaUserGraduate /> Student Information
                </h2>
                <div className="detail-grid">
                    <p className="detail-item">
                        <strong>
                            <FaUserGraduate /> Student Name:
                        </strong>{' '}
                        {submissionDetails.studentName || 'N/A'}
                    </p>
                    <p className="detail-item highlight">
                        <strong>
                            <FaClipboardCheck /> Student ID:
                        </strong>{' '}
                        <span>{submissionDetails.studentId || 'N/A'}</span>
                    </p>
                    <p className="detail-item">
                        <strong>
                            <FaEnvelope /> Email:
                        </strong>{' '}
                        {submissionDetails.studentEmail || 'N/A'}
                    </p>
                    <p className="detail-item">
                        <strong>
                            <FaBook /> Assignment ID:
                        </strong>{' '}
                        {submissionDetails.assignId || 'N/A'}
                    </p>
                </div>
            </div>

            <div className="grading-form-section">
                <h2 className="card-heading">
                    <FaBullhorn /> Marks and Feedback
                </h2>

                {error && (
                    <div className="message-box error-message">
                        <FaTimesCircle /> {error}
                    </div>
                )}

                {successMessage && (
                    <div className="message-box success-message">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmitFeedback} className="feedback-form">
                    <div className="form-group marks-group">
                        <label htmlFor="marks">
                            <FaSortNumericUpAlt /> Marks Awarded:
                        </label>
                        <input
                            id="marks"
                            type="number"
                            value={marks}
                            onChange={(e) => setMarks(e.target.value)}
                            placeholder="Enter marks"
                            min="0"
                            step="0.1"
                            required
                        />
                    </div>

                    <div className="form-group full-width feedback-group">
                        <label htmlFor="feedback">Detailed Feedback:</label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide constructive comments on strengths and weaknesses."
                            rows="8"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button primary-button">
                        <FaCheckCircle /> Submit and Notify Student
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssignmentFeedback;
