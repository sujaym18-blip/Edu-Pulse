import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaGraduationCap, FaSpinner, FaTimesCircle, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import '../CSS/quizui.css'; 

const QuizDetails = () => {
    const { title } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState({});
    const [token, setToken] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const Token = Cookies.get('token');
        if (Token) {
            setToken(Token);
        } else {
            setError('Authentication token missing. Please log in.');
        }
    }, []);

    useEffect(() => {
        const fetchQuizDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:7000/viewAssessment/${encodeURIComponent(title)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                setQuiz(response.data.quiz);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.msg || 'Error fetching quiz details. Check if the quiz exists or is accessible.');
                setLoading(false);
            }
        };

        if (token) {
            fetchQuizDetails();
        }
    }, [title, token]);

    const handleAnswerChange = (questionId, selectedOptionKey) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: selectedOptionKey, 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError('Please log in to submit your answers.');
            return;
        }

        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            setError('Quiz data is invalid or empty.');
            return;
        }

        const requiredQuestions = quiz.questions.length;
        const answeredQuestions = Object.keys(answers).length;
        
        if (answeredQuestions < requiredQuestions) {
            if (!window.confirm(`You have only answered ${answeredQuestions} out of ${requiredQuestions} questions. Do you want to submit anyway?`)) {
                return;
            }
        }

        const submissionData = {
            quizTitle: quiz.title,
            answers,  
        };

        try {
            const response = await axios.post('http://localhost:7000/AssessmentSubmission', submissionData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            alert(response.data.msg);
            setIsSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error submitting quiz. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="quiz-page-container">
                <div className="status-message loading-state"><FaSpinner className="spinner" /> Loading quiz details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-page-container">
                <div className="status-message error-state"><FaTimesCircle /> {error}</div>
            </div>
        );
    }

    if (!quiz || !quiz.questions) {
        return (
            <div className="quiz-page-container">
                <div className="status-message no-data-state"><FaTimesCircle /> Quiz not found or data is missing.</div>
            </div>
        );
    }
    
    if (isSubmitted) {
        return (
            <div className="quiz-page-container">
                <div className="submission-success">
                    <FaCheckCircle className="success-icon" />
                    <h2>Submission Successful!</h2>
                    <p>Your answers for **{quiz.title}** have been recorded. You can now view your result.</p>
                    <button 
                        className="btn-go-to-result"
                        onClick={() => navigate(`/Viewresult/${encodeURIComponent(quiz.title)}`)}
                    >
                       View Your Result
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="quiz-page-container">
            <div className="quiz-header-card">
                <FaGraduationCap className="header-icon" />
                <h2>{quiz.title}</h2>
                <p className="quiz-subtitle">Please answer all questions and submit the form once completed.</p>
                <div className="separator"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="quiz-form">
                {quiz.questions.map((question, index) => (
                    <div key={question.questionId} className="question-card">
                        <p className="question-text">
                            <strong>{index + 1}.</strong> {question.questionText}
                        </p>
                        
                        <div className="options-list">
                            {Object.keys(question.options).map(optionKey => {
                                return (
                                    <label key={optionKey} className="option-label">
                                        <input
                                            type="radio"
                                            name={`question-${question.questionId}`}
                                            checked={answers[question.questionId] === optionKey}
                                            onChange={() => handleAnswerChange(question.questionId, optionKey)} 
                                            required
                                        />
                                        <span className="option-key">{optionKey}.</span>
                                        <span className="option-value">{question.options[optionKey]}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
                
                <div className="submit-area">
                    <button type="submit" className="submit-button">
                        <FaPaperPlane /> Submit Assessment
                    </button>
                    <p className="footer-note">*All answers will be recorded upon submission.</p>
                </div>
            </form>
        </div>
    );
};

export default QuizDetails;