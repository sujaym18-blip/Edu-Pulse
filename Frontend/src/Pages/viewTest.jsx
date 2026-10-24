import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaBookOpen, FaClipboardList, FaSpinner, FaTimesCircle, FaChevronRight, FaCalendarAlt, FaStar, FaChartBar } from 'react-icons/fa';
import '../CSS/viewtest.css'; 

const ViewTest = () => {
    const [quizTitles, setQuizTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getQuizMetadata = (title, index) => {
        const colors = ['#007BFF', '#28A745', '#FFC107', '#DC3545', '#6C757D'];
        const iconChoices = [<FaBookOpen />, <FaCalendarAlt />, <FaStar />, <FaClipboardList />];
        
        const color = colors[index % colors.length];
        const icon = iconChoices[index % iconChoices.length];
        return { color, icon };
    };

    const fetchQuizTitles = async () => {
        const token = Cookies.get('token');
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:7000/viewTitle', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            setQuizTitles(response.data.titles || []);
            setLoading(false);
        } catch (err) {
            setError('Error fetching available test titles. Please check your network.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizTitles();
    }, []);

    const handleQuizClick = (title) => {
        navigate(`/view-test/${encodeURIComponent(title)}`);
    };

    const handleResultClick = (title) => {
        navigate(`/Viewresult/${encodeURIComponent(title)}`);
    };

    const renderStatus = (icon, message, className) => (
        <div className="quiz-feed-container">
            <div className={`status-message ${className}`}>
                {icon}
                <p>{message}</p>
            </div>
        </div>
    );

    if (loading) {
        return renderStatus(<FaSpinner className="spinner" />, "Loading available tests...", "loading-state");
    }

    if (error) {
        return renderStatus(<FaTimesCircle />, error, "error-state");
    }

    return (
        <div className="quiz-feed-container">
            <div className="feed-header">
                <FaClipboardList className="header-icon" />
                <h1>Available Quizzes/Tests</h1>
            </div>
            
            <div className="quiz-feed-list">
                {quizTitles.length === 0 ? (
                    renderStatus(<FaStar />, "No quizzes have been created yet.", "no-data-state")
                ) : (
                    quizTitles.map((title, index) => {
                        const { color, icon } = getQuizMetadata(title, index);

                        return (
                            <div 
                                key={index} 
                                className="quiz-feed-item"
                            >
                                <div className="feed-icon-container" style={{ color: color }}>
                                    {icon}
                                </div>
                                
                                <div className="feed-content-area">
                                    <h3 className="feed-title" style={{ color: color }}>
                                        Test Available: {title}
                                    </h3>
                                    <p className="feed-description">
                                        Attempt the quiz or review your previous scores.
                                    </p>
                                </div>
                                
                                <div className="feed-actions-area">
                                    <button 
                                        className="action-button start-button" 
                                        onClick={(e) => { e.stopPropagation(); handleQuizClick(title); }}
                                    >
                                        Start <FaChevronRight />
                                    </button>
                                    <button 
                                        className="action-button result-button" 
                                        onClick={(e) => { e.stopPropagation(); handleResultClick(title); }}
                                    >
                                        <FaChartBar /> View Result
                                    </button>
                                </div>
                                
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ViewTest;