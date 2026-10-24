import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
    FaFilePdf, 
    FaClock, 
    FaCalendarAlt, 
    FaPaperPlane, 
    FaSpinner,
    FaExclamationTriangle,
    FaClipboardList
} from 'react-icons/fa';
import '../CSS/ViewAssignment.css'; 

const ViewAssignment = () => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const fetchAssignments = async () => {
        try {
            setIsLoading(true);
            setError("");
            
            const response = await axios.get("http://localhost:7000/view", {
                withCredentials: true 
            });
            
            setAssignments(response.data.assignment);
        } catch (error) {
            console.error("Fetch Error:", error);
            const errorMsg = error.response?.data?.msg || "Could not connect to server or no assignments found.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleButtonClick = (assignmentId) => {
        navigate(`/AssignmentSubmission/${assignmentId}`);
    };

    return (
        <div className="assignment-view-wrapper">
            <header className="view-header">
                <h1 className="view-title"><FaClipboardList /> Available Assignments</h1>
                <p className="view-subtitle">Review the list below and submit your work before the deadline.</p>
            </header>

            {error && (
                <div className="state-message error">
                    <FaExclamationTriangle className="icon" />
                    <p>{error}</p>
                </div>
            )}
            
            {isLoading ? (
                <div className="state-message loading">
                    <FaSpinner className="icon spinner" />
                    <p>Fetching assignments...</p>
                </div>
            ) : (
                <>
                    {assignments.length === 0 && !error ? (
                        <div className="state-message no-data">
                             <FaClipboardList className="icon" />
                             <p>No assignments have been published yet!</p>
                        </div>
                    ) : (
                        <div className="assignment-list-container">
                            <table className="assignment-table">
                                <thead>
                                    <tr>
                                        <th>Title & Details</th>
                                        <th className="date-col"><FaCalendarAlt /> Issued</th>
                                        <th className="date-col"><FaClock /> Due Date</th>
                                        <th>File</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment) => (
                                        <tr key={assignment._id}>
                                            <td className="title-details">
                                                <div className="title-text">{assignment.Title}</div>
                                                <div className="description-text">{assignment.Description}</div>
                                                <div className="id-text">ID: {assignment.Id}</div>
                                            </td>
                                            <td>{formatDate(assignment.IssueDate)}</td>
                                            <td>{formatDate(assignment.SubmissionDate)}</td>
                                            <td>
                                                <a
                                                    href={`http://localhost:7000/uploads/${assignment.Assignment}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="pdf-link"
                                                >
                                                    <FaFilePdf /> Download
                                                </a>
                                            </td>
                                            <td>
                                                <button 
                                                    className="submit-button" 
                                                    onClick={() => handleButtonClick(assignment._id)}
                                                >
                                                    <FaPaperPlane /> Submit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ViewAssignment;