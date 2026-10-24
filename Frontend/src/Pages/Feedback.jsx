import React, { useState, useMemo } from 'react';
import axios from 'axios';
import '../CSS/FeedbackForm.css'; 

const Feedback = () => {
    const [rating, setRating] = useState(7);
    const [comment, setComment] = useState('');
    const [category, setCategory] = useState('');
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const currentRatingText = useMemo(() => {
        if (rating <= 3) return 'Needs Serious Improvement 😔';
        if (rating <= 6) return 'Average/Neutral 🤔';
        if (rating <= 8) return 'Good Experience 👍';
        return 'Excellent! Highly Satisfied! 🎉';
    }, [rating]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!category || !comment) {
            setError('Please select a Category and provide a Detailed Comment.');
            return;
        }

        if (comment.length < 10) {
            setError('Please provide a detailed comment of at least 10 characters.');
            return;
        }

        const feedbackData = {
            rating: parseInt(rating),
            comment,
            category,
        };

        try {
            const response = await axios.post('http://localhost:7000/addfeedback', feedbackData, {
                withCredentials: true,
            });

            if (response.data.success) {
                setSuccessMessage('Thank you for your valuable feedback! Your input has been successfully recorded.');
              
                setRating(7);
                setComment('');    
                setCategory(''); 
            } else {
                setError(response.data.message || 'Submission failed. Please try again.');
            }
        } catch (err) {
            console.error("Feedback submission error:", err);
            setError(err.response?.data?.msg || 'There was a critical error submitting your feedback. Please try again later.');
        }
    };

    return (
        <div className="feedback-page-container">
            <div className="feedback-card">
                <header className="feedback-header">
                    <h1 className="header-title">Share Your Experience ✍️</h1>
                  
                </header>
                
                {(error || successMessage) && (
                    <div className={`message-box ${error ? 'error' : 'success'}`}>
                        {error || successMessage}
                    </div>
                )}

                <form className="feedback-form" onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="category"><i className="fas fa-tags"></i> Select Department/Area *</label>
                        <select 
                            id="category"
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="" disabled> Select the relevant department or area </option>
                            <option value="Computer Science">Computer Science Engineering (CSE)</option>
                            <option value="Electronics">Electronics & Communication Engineering (ECE)</option>
                            <option value="Mechanical">Mechanical Engineering (ME)</option>
                            <option value="Civil">Civil Engineering (CE)</option>
                            <option value="Electrical">Electrical Engineering (EE)</option>
                            <option value="Applied Science">Applied Science & Humanities</option>
                            <option value="Administration">Administration & Registrar's Office</option>
                            <option value="Library">Library Services</option>
                            <option value="Hostel">Hostel & Mess Services</option>
                            <option value="Facilities">Campus Maintenance & Facilities</option>
                            <option value="General Suggestion">General Suggestion/Other</option>
                        </select>
                    </div>

                    <div className="form-group rating-group">
                        <label className="rating-label"><i className="fas fa-star"></i> Overall Satisfaction Rating</label>
                        <div className="rating-control">
                            <div className="rating-range-container">
                                <span className="rating-min">1 (Poor)</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="rating-slider"
                                />
                                <span className="rating-max">10 (Excellent)</span>
                            </div>
                            <div className="rating-display">
                                <span className="rating-value">{rating} / 10</span>
                                <span className="rating-text">{currentRatingText}</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="comment"><i className="fas fa-comment-dots"></i> Detailed Comment *</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Please elaborate on your experience, noting specific areas for praise or improvement"
                            required
                            rows="5"
                        />
                         <small className="hint-text">Be specific to help us take appropriate action.</small>
                    </div>

                    <button type="submit" className="submit-btn">
                        <i className="fas fa-paper-plane"></i> Submit Feedback
                    </button>
                    
                    <small className="footer-note">Fields marked with * are required.</small>
                </form>
            </div>
        </div>
    );
};

export default Feedback;