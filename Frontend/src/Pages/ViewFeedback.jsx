import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    FaSpinner, 
    FaExclamationCircle, 
    FaQuoteLeft, 
    FaStar, 
    FaCalendarAlt,
    FaCommentDots,
    FaTag, 
    FaClock
} from 'react-icons/fa';
import '../CSS/viewfeedback.css';
const formatDate = (dateString) => {
    if (!dateString) return 'Date N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
        return 'Date Error';
    }
};

const ViewFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axios.get('http://localhost:7000/viewfeedback');
                setFeedbacks(response.data.feedback || []);
                setLoading(false);
            } catch {
                setError('Could not connect to the server or fetch feedbacks.');
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);
    if (loading) return (
        <div className="view-feedback-wrapper loading-state">
            <FaSpinner className="spinner-icon" />
            <p>Loading Feedback Data...</p>
        </div>
    );

    if (error) return (
        <div className="view-feedback-wrapper error-state">
            <FaExclamationCircle className="error-icon" />
            <p>{error}</p>
        </div>
    );

    if (feedbacks.length === 0) return (
        <div className="view-feedback-wrapper no-data-state">
            <p>No individual feedback records found to display.</p>
        </div>
    );


    return (
        <div className="view-feedback-wrapper">
            <header className="feedback-header-section">
                <h1 className="page-title">📝 Feedback Submissions</h1>
                <p className="subtitle">Reviewing {feedbacks.length} individual entries.</p>
            </header>
            
            <h2 className="section-title"><FaCommentDots /> All Submissions</h2>
            
            <div className="feedback-list-container">
                {feedbacks.map((feedback, index) => (
                    <div 
                        key={index} 
                        className={`feedback-item ${feedback.rating >= 8 ? 'high' : feedback.rating >= 5 ? 'mid' : 'low'}`}
                    >
                        <div className="item-metadata">
                            <span className="item-category">
                                <FaTag /> {feedback.category || 'General'}
                            </span>
                            <div className="item-rating">
                                <FaStar />
                                <strong>{feedback.rating || 'N/A'}</strong> / 10
                            </div>
                        </div>
                        <div className="item-comment-body">
                            <p className="comment-text-snippet">
                                <FaQuoteLeft className="quote-icon-small" />
                                {feedback.comment || 'No comment provided.'}
                            </p>
                        </div>
                        <div className="item-footer">
                            <span className="anonymous-label">
                                {feedback.submitterName
                                    ? `${feedback.submitterName}${feedback.submitterRole ? ` · ${feedback.submitterRole}` : ''}`
                                    : 'Anonymous submission (legacy record)'}
                            </span>
                            <div className="date-tag">
                                <FaClock /> <span>{formatDate(feedback.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewFeedback;