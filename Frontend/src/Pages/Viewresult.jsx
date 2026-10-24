import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaTrophy, FaChartLine, FaSpinner, FaTimesCircle, FaCheckCircle, FaStar, FaQuestionCircle } from 'react-icons/fa'; 
import '../CSS/viewresult.css'; 

const ViewResult = () => {
    const { title } = useParams(); 
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResult = async () => {
            const token = Cookies.get('token');
            setLoading(true);

            try {
                const response = await axios.get(`http://localhost:7000/ViewResult/${encodeURIComponent(title)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,  
                    },
                    withCredentials: true, 
                });

                if (response.data.success && response.data.result) {
                    setResult(response.data.result);
                    setError('');
                } else {
                    setError('No result found for this quiz.');
                }
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.msg || 'Error fetching result. You may not have completed this test.');
                setLoading(false);
            }
        };

        fetchResult();
    }, [title]); 

    const renderStatus = (icon, message, className) => (
        <div className="result-container">
            <div className={`status-message ${className}`}>
                {icon}
                <p>{message}</p>
            </div>
        </div>
    );

    if (loading) {
        return renderStatus(<FaSpinner className="spinner" />, "Loading your quiz results...", "loading-state"); 
    }

    if (error) {
        return renderStatus(<FaTimesCircle />, error, "error-state"); 
    }
    
    if (!result || !result.totalQuestions) {
        return renderStatus(<FaStar />, `No result data available for: ${title}`, "no-data-state");
    }

    const scorePercentage = ((result.score / result.totalQuestions) * 100).toFixed(1);
    const scoreStatus = result.score / result.totalQuestions >= 0.6 ? 'Great Job!' : 'Review Needed';
    const scoreCardClass = result.score / result.totalQuestions >= 0.6 ? 'score-summary-pass' : 'score-summary-fail';

    return (
        <div className="result-page-container">
            <div className="result-header">
                <FaChartLine className="header-icon" />
                <h1>Quiz Results: {title}</h1>
            </div>

            <div className={`score-summary ${scoreCardClass}`}>
                <div className="trophy-icon"><FaTrophy /></div>
                <div className="score-details">
                    <p className="summary-title">{scoreStatus}</p>
                    <p className="main-score">{result.score} / {result.totalQuestions}</p>
                    <p className="percentage-score">{scorePercentage}% Correct</p>
                </div>
            </div>

            <div className="details-section-header">
                <FaQuestionCircle /> Detailed Breakdown
            </div>

            <div className="question-details-list">
                {result.details && result.details.length > 0 ? (
                    result.details.map((detail, index) => {
                        const cardClass = detail.isCorrect ? 'correct-card' : 'incorrect-card';
                        const statusIcon = detail.isCorrect ? <FaCheckCircle /> : <FaTimesCircle />;
                        const statusText = detail.isCorrect ? 'Correct' : 'Incorrect';
                        const correctAnswer = detail.correctAnswer || 'N/A';
                        const studentAnswer = detail.studentAnswer || 'Not Answered';

                        return (
                            <div className="question-detail-card" key={index}>
                                <div className={`status-tag ${cardClass}`}>
                                    {statusIcon} {statusText}
                                </div>
                                <p className="question-text">
                                    <strong>Q {index + 1}: </strong>{detail.questionText}
                                </p>
                                <div className="answer-section">
                                    <p className="correct-answer">
                                        <strong>Correct Answer: </strong>
                                        <span>{correctAnswer}</span>
                                    </p>
                                    <p className="student-answer">
                                        <strong>Your Answer: </strong>
                                        <span className={detail.isCorrect ? 'is-correct' : 'is-incorrect'}>
                                            {studentAnswer}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="status-message no-detail-state">
                        <p>Detailed question breakdown is not available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewResult;