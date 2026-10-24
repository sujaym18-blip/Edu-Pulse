import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../CSS/midterm.css' 

const MAX_MARKS_PER_EXAM = 100; 
const processReportData = (subjectsData, ut1MarksObject, midTermMarksObject) => { 
    if (!subjectsData) return [];

    const subjectKeys = ['subject1', 'subject2', 'subject3', 'subject4', 'subject5', 'subject6'];
    
    const finalReportData = subjectKeys.map(key => {
        const subjectName = subjectsData[key];
        
        if (subjectName) {
            const ut1Original = ut1MarksObject[key] || 0; 
            const midTermOriginal = midTermMarksObject[key] || 0; 
            const ut1Weighted = ut1Original * 0.20; 
            const midTermWeighted = midTermOriginal * 0.80; 
            const finalMarksObtained = ut1Weighted + midTermWeighted;

            return {
                subjectName: subjectName,
                ut1Original: ut1Original,
                midTermOriginal: midTermOriginal,
                ut1Weighted: ut1Weighted.toFixed(2),
                midTermWeighted: midTermWeighted.toFixed(2),
                finalMarksObtained: finalMarksObtained.toFixed(2),
                maxMarks: MAX_MARKS_PER_EXAM,
            };
        }
        return null; 
    }).filter(item => item !== null); 

    return finalReportData;
};

const MidTermReportCard = () => {
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
                const ut1Response = await axios.get(`${BASE_URL}/getunittest1`, config); 
                const ut1MarksObject = ut1Response.data.marks || {}; 
                const midTermResponse = await axios.get(`${BASE_URL}/getmidTerm`, config); 
                const midTermMarksObject = midTermResponse.data.data || {}; 
                const finalData = processReportData(subjectEntry, ut1MarksObject, midTermMarksObject);
                
                setReportData(finalData);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching report data:", err.response ? err.response.data : err.message);
                
                if (err.response && err.response.status === 401) {
                     setError("Unauthorized: Your session has expired. Please log in again.");
                } else {
                     setError(err.response?.data?.msg || err.message || "Failed to load Mid-Term report data.");
                }
                setLoading(false);
            }
        };

        fetchReportData();
    }, [token]);

    const { totalMarksObtained, totalPossibleMarks, percentage } = useMemo(() => {
        const obtained = reportData.reduce((total, item) => total + parseFloat(item.finalMarksObtained || 0), 0);
        const possible = reportData.reduce((total, item) => total + item.maxMarks, 0);
        
        let calculatedPercentage = 0;
        if (possible > 0) {
            calculatedPercentage = ((obtained / possible) * 100).toFixed(2);
        }

        return {
            totalMarksObtained: obtained.toFixed(2),
            totalPossibleMarks: possible,
            percentage: calculatedPercentage
        };
    }, [reportData]);
    
    if (loading) {
        return <div className="report-card-container loading"><p>Loading Mid-Term Report Card...</p></div>;
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
                    <span className="label">F/H NAME :</span>
                    <span className="value">{profile.fatherName}</span> 
                    <span className="label roll-label">ENROLLMENT NO. :</span>
                    <span className="value roll-value">{profile.enrollment}</span>
                </div>
                
                <div className="info-row college-row">
                    <span className="label">Department :</span>
                    <span className="value college-value">{profile.department}</span>
                </div>
            </header>

            <h2 className="report-title">Mid-Term Assessment Report (20% UT1 + 80% MT)</h2>
            
            <table className="marks-table">
                <thead>
                    <tr>
                        <th className="subject-col" rowSpan="2">Subjects Offered</th>
                        <th colSpan="2" className="exam-group-header">UT1 (20% Weightage)</th>
                        <th colSpan="2" className="exam-group-header">Mid-Term (80% Weightage)</th>
                        <th className="final-col" rowSpan="2">Final Marks (Max 100)</th>
                    </tr>
                    <tr>
                        <th className="sub-col">Original Marks</th>
                        <th className="sub-col">Weighted Marks (20%)</th>
                        <th className="sub-col">Original Marks</th>
                        <th className="sub-col">Weighted Marks (80%)</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.length === 0 ? (
                        <tr><td colSpan="6">No subjects or marks found for this report.</td></tr>
                    ) : (
                        reportData.map((item, index) => (
                            <tr key={index}>
                                <td className="subject-col">{item.subjectName}</td>
                                
                                <td className="sub-col original-mark">{item.ut1Original}</td>
                                <td className="sub-col weighted-mark">{item.ut1Weighted}</td>

                                <td className="sub-col original-mark">{item.midTermOriginal}</td>
                                <td className="sub-col weighted-mark">{item.midTermWeighted}</td>
                                
                                <td className="final-col total-mark">{item.finalMarksObtained}</td>
                            </tr>
                        ))
                    )}
                    <tr className="total-row">
                        <td colSpan="5" className="total-label">Total Final Marks Obtained</td>
                        <td className="total-value">{totalMarksObtained} / {totalPossibleMarks}</td>
                    </tr>
                    <tr className="percentage-row">
                        <td colSpan="5" className="total-label percentage-label">Percentage</td>
                        <td className="total-value percentage-value">{percentage}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default MidTermReportCard;