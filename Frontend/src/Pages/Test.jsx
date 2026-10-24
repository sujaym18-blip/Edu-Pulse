import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../CSS/Test.css';
const createInitialQuestions = (count) => {
    if (count <= 0) return [];
    return Array.from({ length: count }, () => ({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
    }));
};

const Test = () => {
    const [quizTitle, setQuizTitle] = useState('New ERP Assessment');
    const [questionCount, setQuestionCount] = useState(3); 
    const [questions, setQuestions] = useState(createInitialQuestions(3));
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [messageType, setMessageType] = useState(''); 

    useEffect(() => {
        const newQuestions = createInitialQuestions(questionCount);
        setQuestions(prevQuestions => {
            const preservedQuestions = prevQuestions.slice(0, questionCount);
            return [
                ...preservedQuestions,
                ...newQuestions.slice(preservedQuestions.length)
            ];
        });
    }, [questionCount]);


    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, optionIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[optionIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, option) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswer = option;
        setQuestions(newQuestions);
    };

    const handleQuestionCountChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 1 && value <= 50) { 
            setQuestionCount(value);
        } else if (e.target.value === '') {
            setQuestionCount(0);
        }
    };

    const validateQuiz = () => {
        if (!quizTitle.trim()) {
            setMessage('Quiz title is required.');
            setMessageType('error');
            return false;
        }
        if (questions.length === 0) {
            setMessage('Please enter a valid number of questions.');
            setMessageType('error');
            return false;
        }

        for (const [index, question] of questions.entries()) {
            if (!question.text.trim()) {
                setMessage(`Question ${index + 1}: Question text is missing.`);
                setMessageType('error');
                return false;
            }
            if (question.options.some(option => !option.trim())) {
                setMessage(`Question ${index + 1}: All four options must be filled.`);
                setMessageType('error');
                return false;
            }
            if (!question.correctAnswer) {
                setMessage(`Question ${index + 1}: Correct answer must be selected.`);
                setMessageType('error');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateQuiz()) return;

        setIsSaving(true);
        setMessage('');

        const quizData = {
            title: quizTitle,
            questions: questions.slice(0, questionCount).map(q => ({
                ...q,
                options: q.options.filter(opt => opt.trim() !== '') 
            }))
        };

        try {
            const response = await axios.post('http://localhost:7000/addquestion', quizData);
            setMessage('Quiz successfully saved!');
            setMessageType('success');
            setQuestions(createInitialQuestions(questionCount));
            setQuizTitle('New ERP Assessment');
        } catch (error) {
            setMessage(`Error saving quiz: ${error.message || 'Server error'}`);
            setMessageType('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="quiz-page-container">
            <div className="quiz-form-wrapper">
                <h1 className="form-title">
                    <FaPlus /> Create New Assessment
                </h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group-top">
                        <div className="input-field title-field">
                            <label htmlFor="quizTitle">Assessment Title</label>
                            <input
                                id="quizTitle"
                                type="text"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                placeholder="e.g., New ERP Assessment"
                                required
                            />
                        </div>
                        <div className="input-field count-field">
                            <label htmlFor="questionCount">Number of Questions (1-50)</label>
                            <input
                                id="questionCount"
                                type="number"
                                value={questionCount}
                                onChange={handleQuestionCountChange}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                    </div>
                    
                    {questions.slice(0, questionCount).map((q, index) => (
                        <div key={index} className="question-card">
                            <h3 className="question-header">Question {index + 1}</h3>
                            
                            <div className="input-field">
                                <label>Question Text</label>
                                <textarea
                                    rows="2"
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                    placeholder="Enter the complete question text..."
                                    required
                                ></textarea>
                            </div>

                            <div className="options-grid">
                                {['A', 'B', 'C', 'D'].map((option, i) => (
                                    <div key={i} className="input-field option-input">
                                        <label>{`Option ${option}`}</label>
                                        <input
                                            type="text"
                                            value={q.options[i]}
                                            onChange={(e) => handleOptionChange(index, i, e.target.value)}
                                            placeholder={`Option ${option} text`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="input-field correct-answer-select">
                                <label>Select Correct Answer</label>
                                <select
                                    value={q.correctAnswer}
                                    onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Choose the correct option (A, B, C, or D)</option>
                                    {['A', 'B', 'C', 'D'].map((option) => (
                                        <option key={option} value={option}>Option {option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    {message && (
                        <p className={`message-box ${messageType}`}>
                            {messageType === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />} {message}
                        </p>
                    )}
                    
                    <button type="submit" disabled={isSaving || questionCount === 0} className="submit-button">
                        <FaSave /> {isSaving ? 'Saving Assessment...' : 'Save Quiz'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Test;