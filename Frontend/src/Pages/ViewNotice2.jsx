import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaClock, FaCalendarAlt, FaBullhorn, FaCircle, FaExclamationCircle, FaSpinner, FaTimesCircle, FaTrashAlt } from 'react-icons/fa'; 

import '../CSS/nooticeui.css'; 

const ViewNoticess = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getNoticeMetadata = (type) => {
        switch (type) {
            case 'Important':
                return { icon: <FaBullhorn />, color: '#D32F2F', label: 'URGENT' }; 
            case 'New Event':
                return { icon: <FaCalendarAlt />, color: '#388E3C', label: 'EVENT' }; 
            case 'Urgent Alert':
                return { icon: <FaExclamationCircle />, color: '#FBC02D', label: 'ALERT' }; 
            case 'General Announcement':
                return { icon: <FaBell />, color: '#1976D2', label: 'INFO' }; 
            case 'Information':
                return { icon: <FaCircle />, color: '#757575', label: 'GENERAL' }; 
            default:
                return { icon: <FaBell />, color: '#757575', label: 'NOTICE' };
        }
    };

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:7000/viewnotice");
            const noticesWithTypes = response.data.notices.map(notice => {
                const noticeType = notice.type || ['Important', 'New Event', 'General Announcement', 'Urgent Alert', 'Information'][Math.floor(Math.random() * 5)];
                
                const issueDate = new Date(notice.issueDate);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const isNew = issueDate > sevenDaysAgo;
                
                return {
                    ...notice,
                    type: noticeType, 
                    isNew: isNew, 
                };
            });
            noticesWithTypes.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

            setNotices(noticesWithTypes); 
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch notices. Please check server connection.");
            setLoading(false);
        }
    };
    
    const deleteNotice = async (noticeId) => {
        if (window.confirm("Are you sure you want to delete this notice permanently?")) {
            try {
                await axios.delete(`http://localhost:7000/deletenotice/${noticeId}`);
                
                setNotices(prevNotices => prevNotices.filter(notice => notice._id !== noticeId));
                
                alert(`Notice deleted successfully!`);
            } catch (err) {
                alert("Failed to delete the notice. Server error or insufficient permissions.");
            }
        }
    };
    
    useEffect(() => {
        fetchNotices();
    }, []);
    
    if (loading) {
        return (
            <div className="notice-page-container">
                <div className="status-message loading-state"><FaSpinner className="spinner" /> Loading official announcements...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notice-page-container">
                <div className="status-message error-state"><FaTimesCircle /> {error}</div>
            </div>
        );
    }

    return (
        <div className="notice-page-container">
            <div className="notifications-header">
                <FaBell className="header-icon" />
                <h1>ADMIN NOTICES & ANNOUNCEMENTS</h1>
            </div>

            {notices.length === 0 ? (
                <div className="status-message no-data-state">
                    <p>No new notices available.</p>
                </div>
            ) : (
                <div className="notice-feed-list">
                    {notices.map((notice) => {
                        const { icon, color, label } = getNoticeMetadata(notice.type);
                        const eventDate = new Date(notice.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                        const issueDate = new Date(notice.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                        const issueTime = new Date(notice.issueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div className="notice-card" key={notice._id}>
                                
                                <div className="notice-icon-box" style={{ borderColor: color }}>
                                    <span className="notice-icon-circle" style={{ backgroundColor: color }}>
                                        {icon}
                                    </span>
                                </div>
                                
                                <div className="notice-content-area">
                                    <div className="notice-header-bar">
                                        
                                        <div className="tag-group">
                                            <span className="notice-label-tag" style={{ backgroundColor: color }}>
                                                {label}
                                            </span>
                                            {notice.isNew && <span className="new-tag">NEW</span>}
                                        </div>
                                        <span className="notice-timestamp">
                                            <FaClock /> Published: {issueDate} at {issueTime}
                                        </span>
                                    </div>

                                    <h3 className="notice-title">{notice.title}</h3>
                                    <p className="notice-description">{notice.content}</p>
                                    
                                    <div className="notice-footer-meta">
                                        <div className="meta-info">
                                            <FaCalendarAlt /> Event/Last Date: <b>{eventDate}</b>
                                        </div>
                                        
                                        <button 
                                            className="delete-button" 
                                            onClick={() => deleteNotice(notice._id)}
                                            title="Delete Notice Permanently"
                                        >
                                            <FaTrashAlt /> Delete
                                        </button>

                                    </div>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewNoticess;