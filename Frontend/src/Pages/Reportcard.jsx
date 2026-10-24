import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; 
import axios from 'axios'; 
import { 
    FaChartLine, FaClipboardList, FaBookOpen, FaAward, 
    FaGraduationCap
} from 'react-icons/fa';
import '../CSS/reportcard.css'; 

const ReportCard = () => {
    const navigate = useNavigate();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [studentName, setStudentName] = useState("Student"); 
    
    const reportItems = [
        { id: 'ut1', name: "Unit Test 1 (UT1) Scorecard", path: "/ut1", icon: <FaClipboardList /> },
        { id: 'ut2', name: "Unit Test 2 (UT2) Scorecard", path: "/ut2", icon: <FaBookOpen /> },
        { id: 'midterm', name: "Mid Term Scorecard", path: "/midterm", icon: <FaChartLine /> },
        { id: 'final', name: "Final Report Card", path: "/final", icon: <FaAward />},
    ];

    useEffect(() => {
        const verifyAuth = async () => {
            setLoadingAuth(true);
            const token = Cookies.get('token');
            
            if (!token) {
                setIsAuthenticated(false);
                setLoadingAuth(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:7000/admstudentprofile', { 
                    withCredentials: true, 
                });
                
                if (response.data.success) {
                    setIsAuthenticated(true);
                    setStudentName(response.data.student.name || "Student"); 
                } else {
                    setIsAuthenticated(false);
                }

            } catch (error) {
                console.error("Auth verification failed:", error);
                setIsAuthenticated(false);
            } finally {
                setLoadingAuth(false);
            }
        };

        verifyAuth();
    }, [navigate]);


    const handleNavigation = (path, reportName) => {
        console.log(`Accessing Report: ${reportName}`);
        navigate(path);
    };


    return (
        <div className="report-card-container">
            <header className="report-card-header">
                <FaGraduationCap className="header-icon" />
                <h1 className="report-title">Academic Report Card Access</h1>
                <p className="welcome-message">Welcome, <b>{studentName}</b>.</p>
            </header>
            

            <div className="report-grid">
                {reportItems.map((item) => (
                    <div 
                        key={item.id}
                        className="report-item-card"
                        onClick={() => handleNavigation(item.path, item.name)}
                    >
                        <div className="card-icon-area">
                            {item.icon}
                        </div>
                        <div className="card-content-area">
                            <h2 className="card-title">{item.name}</h2>
                            <p className="card-description">{item.description}</p>
                            <span className="card-action-link">View Report →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportCard;