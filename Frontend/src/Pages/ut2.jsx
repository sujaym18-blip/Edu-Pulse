import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../CSS/ut1.css'

const MAX_UT1_MARKS = 100; 

const processReportData = (subjectsData, ut1MarksObject) => { 
    if (!subjectsData || !ut1MarksObject) return [];

    const subjectKeys = ['subject1', 'subject2', 'subject3', 'subject4', 'subject5', 'subject6'];
    
    const finalReportData = subjectKeys.map(key => {
        const subjectName = subjectsData[key];
        const marksObtained = ut1MarksObject[key] || 0; 

        if (subjectName) {
            return {
                subjectName: subjectName,
                marksObtained: marksObtained,
                totalMarks: MAX_UT1_MARKS, 
            };
        }
        return null; 
    }).filter(item => item !== null); 

    return finalReportData;
};

const UT2ReportCard = () => {
    const [profile, setProfile] = useState({});
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = Cookies.get('token');
    const BASE_URL = 'http://localhost:7000';

    useEffect(() => {
        const fetchReportData = async () => {
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }

            const config = { 
                withCredentials: true 
            };

            try {
                const profileResponse = await axios.get(`${BASE_URL}/admstudentprofile`, config); 
                const studentProfile = profileResponse.data.students || profileResponse.data.student; 
                if (!studentProfile) throw new Error("Student profile data missing.");
                setProfile(studentProfile);
                
                const subjectsResponse = await axios.get(`${BASE_URL}/student/subjects`, config);
                const subjectEntry = subjectsResponse.data.subject;
                if (!subjectEntry) throw new Error("Subjects not found for your department.");
                const ut1Response = await axios.get(`${BASE_URL}/getunittest2`, config); 
                const ut1MarksObject = ut1Response.data.data || {}; 
                const finalData = processReportData(subjectEntry, ut1MarksObject);
                
                setReportData(finalData);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching report data:", err.response ? err.response.data : err.message);
                
                if (err.response && err.response.status === 401) {
                     setError("Unauthorized: Your session has expired. Please log in again.");
                } else {
                     setError(err.response?.data?.msg || err.message || "Failed to load UT2 report data.");
                }
                setLoading(false);
            }
        };

        fetchReportData();
    }, [token]);

    const { totalMarksObtained, totalPossibleMarks, percentage } = useMemo(() => {
        const obtained = reportData.reduce((total, item) => total + item.marksObtained, 0);
        const possible = reportData.reduce((total, item) => total + item.totalMarks, 0);
        
        let calculatedPercentage = 0;
        if (possible > 0) {
            calculatedPercentage = ((obtained / possible) * 100).toFixed(2);
        }

        return {
            totalMarksObtained: obtained,
            totalPossibleMarks: possible,
            percentage: calculatedPercentage
        };
    }, [reportData]);
    
    if (loading) {
        return <div className="report-card-container loading"><p>Loading UT2 Report Card...</p></div>;
    }

    if (error) {
        return <div className="report-card-container error"><p>{error}</p></div>;
    }

    return (
        <div className="report-card-container">
            <header className="report-header">
                <div className="info-row">
                    <span className="label">NAME :</span>
                    <span className="value">{profile.name}</span>
                    <span className="label roll-label">ROLL NO. :</span>
                    <span className="value roll-value">{profile.id}</span>
                </div>
                
                <div className="info-row">
                    <span className="label">dob:</span>
                    <span className="value">{profile.dob}</span> 
                    <span className="label roll-label">address :</span>
                    <span className="value roll-value">{profile.address}</span>
                </div>
                
                <div className="info-row college-row">
                    <span className="label">Department :</span>
                    <span className="value college-value">{profile.department}</span>
                </div>
            </header>

            <h2 className="report-title">Unit Test 2 Marks</h2>
            
            <table className="marks-table">
                <thead>
                    <tr>
                        <th className="subject-col">Subjects Offered</th>
                        <th className="grade-col">Marks Obtained</th>
                        <th className="points-col">Max Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.length === 0 ? (
                        <tr><td colSpan="3">No subjects or marks found for this report.</td></tr>
                    ) : (
                        reportData.map((item, index) => (
                            <tr key={index}>
                                <td className="subject-col">{item.subjectName}</td>
                                <td className="grade-col">{item.marksObtained}</td>
                                <td className="points-col">{item.totalMarks}</td>
                            </tr>
                        ))
                    )}
                    <tr className="total-row">
                        <td colSpan="2" className="total-label">Total Marks Obtained</td>
                        <td className="total-value">{totalMarksObtained} / {totalPossibleMarks}</td>
                    </tr>
                    <tr className="percentage-row">
                        <td colSpan="2" className="total-label percentage-label">Percentage</td>
                        <td className="total-value percentage-value">{percentage}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default UT2ReportCard;