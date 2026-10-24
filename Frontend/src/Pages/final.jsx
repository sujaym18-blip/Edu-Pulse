import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import html2pdf from 'html2pdf.js';
import '../CSS/final.css'; 

const MAXMARKS = 100;
const BASE_URL = 'http://localhost:7000';

const WEIGHTS = {
    UT1: 0.10,
    MIDTERM: 0.40,
    UT2: 0.10,
    FINAL: 0.40,
};

const processReportData = (subjectsData, ut1Marks, midTermMarks, ut2Marks, finalMarks) => {
    if (!subjectsData) return [];

    const subjectKeys = ['subject1', 'subject2', 'subject3', 'subject4', 'subject5', 'subject6'];

    const finalReportData = subjectKeys.map(key => {
        const subjectName = subjectsData[key];

        if (subjectName) {
            const ut1Original = parseFloat(ut1Marks[key] || 0);
            const midTermOriginal = parseFloat(midTermMarks[key] || 0);
            const ut2Original = parseFloat(ut2Marks[key] || 0);
            const finalOriginal = parseFloat(finalMarks[key] || 0);

            const ut1Weighted = ut1Original * WEIGHTS.UT1;
            const midTermWeighted = midTermOriginal * WEIGHTS.MIDTERM;
            const ut2Weighted = ut2Original * WEIGHTS.UT2;
            const finalWeighted = finalOriginal * WEIGHTS.FINAL;

            const finalMarksObtained = ut1Weighted + midTermWeighted + ut2Weighted + finalWeighted;

            return {
                subjectName: subjectName,
                ut1Original: ut1Original.toFixed(0),
                midTermOriginal: midTermOriginal.toFixed(0),
                ut2Original: ut2Original.toFixed(0),
                finalOriginal: finalOriginal.toFixed(0),
                ut1Weighted: ut1Weighted.toFixed(2),
                midTermWeighted: midTermWeighted.toFixed(2),
                ut2Weighted: ut2Weighted.toFixed(2),
                finalWeighted: finalWeighted.toFixed(2),
                finalMarksObtained: finalMarksObtained.toFixed(2),
                maxMarks: MAXMARKS,
            };
        }
        return null;
    }).filter(item => item !== null);

    return finalReportData;
};

const FinalReportCard = () => {
    const [profile, setProfile] = useState({});
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const reportRef = useRef();

    const token = Cookies.get('token');

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
                
                if (!subjectEntry) {
                    throw new Error("Subjects have not been registered for your department.");
                }
                
                if (!subjectEntry.subject1) {
                    throw new Error("Subject mapping data is incomplete for your department.");
                }

                const [ut1Res, midTermRes, ut2Res, finalRes] = await Promise.all([
                    axios.get(`${BASE_URL}/getunittest1`, config),
                    axios.get(`${BASE_URL}/getmidTerm`, config),
                    axios.get(`${BASE_URL}/getunittest2`, config),
                    axios.get(`${BASE_URL}/getfinal`, config)
                ]);

                const finalData = processReportData(
                    subjectEntry,
                    ut1Res.data.marks || {},     
                    midTermRes.data.data || {},
                    ut2Res.data.data || {},     
                    finalRes.data.data || {},   
                );

                setReportData(finalData);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching report data:", err.response ? err.response.data : err.message);
                
                let message = err.response?.data?.msg || "Failed to load report data. Please contact server admin.";
                if (err.response && err.response.status === 401) {
                    message = "Unauthorized: Session expired. Please log in.";
                } else if (err.message) {
                    message = err.message; 
                }
                
                setError(message);
                setLoading(false);
            }
        };

        fetchReportData();
    }, [token]);

    const { totalMarksObtained, totalPossibleMarks, percentage } = useMemo(() => {
        const obtained = reportData.reduce((total, item) => total + parseFloat(item.finalMarksObtained || 0), 0);
        const possible = reportData.length * MAXMARKS; 

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

    const handleDownloadPDF = () => {
        const element = reportRef.current;
        const studentName = profile.name ? profile.name.replace(/\s/g, '_') : 'Student';
        const filename = `${studentName}_FinalReport.pdf`;

        const options = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        if (typeof html2pdf !== 'undefined' && html2pdf().set) {
             html2pdf().set(options).from(element).save();
        } else {
             alert("PDF generation library (html2pdf.js) not loaded.");
        }
    };

    if (loading) {
        return <div className="rpt-wrapper-d loading-d"><p>Loading Final Report...</p></div>;
    }

    if (error) {
        return (
            <div className="rpt-wrapper-d error-d">
                <p>❌ **Error Loading Report**:</p>
                <p className="error-message-detail">{error}</p>
            </div>
        );
    }

    return (
        <div className="rpt-wrapper-d">
            <button onClick={handleDownloadPDF} className="btn-download-d">
                ⬇️ Download Report Card (PDF)
            </button>
            

            <div className="rpt-card-d" ref={reportRef}>
                <h1 className="rpt-heading-d">FINAL ACADEMIC REPORT CARD</h1>
                <header className="rpt-header-d">
                    <div className="info-row-d">
                        <span className="lbl-d">NAME:</span>
                        <span className="val-d">{profile.name}</span>
                        <span className="lbl-d roll-d">ROLL NO.:</span>
                        <span className="val-d roll-val-d">{profile.id}</span>
                    </div>

                    <div className="info-row-d">
                        <span className="lbl-d">DOB:</span>
                        <span className="val-d">{profile.dob}</span>
                        <span className="lbl-d roll-d">ADDRESS:</span>
                        <span className="val-d roll-val-d">{profile.address}</span>
                    </div>

                    <div className="info-row-d college-d">
                        <span className="lbl-d">Department / Branch:</span>
                        <span className="val-d college-d">{profile.department}</span>
                    </div>
                </header>

                <h2 className="rpt-title-d">Final Assessment Report (10% UT1 + 40% Mid Term + 10% UT2 + 40% Final)</h2>
                
                <table className="marks-tbl-d">
                    <thead>
                        <tr>
                            <th className="sub-col-d" rowSpan="2">Subjects</th>
                            <th colSpan="2" className="ut-d">UT1 (10%)</th>
                            <th colSpan="2" className="mt-d">Mid-Term (40%)</th>
                            <th colSpan="2" className="ut-d">UT2 (10%)</th>
                            <th colSpan="2" className="final-d">Final Exam (40%)</th>
                            <th className="final-col-d" rowSpan="2">Final Marks (Max {MAXMARKS})</th>
                        </tr>
                        <tr>
                            <th className="sub-d">Original</th>
                            <th className="sub-d">Wt. (10)</th>
                            <th className="sub-d">Original</th>
                            <th className="sub-d">Wt. (40)</th>
                            <th className="sub-d">Original</th>
                            <th className="sub-d">Wt. (10)</th>
                            <th className="sub-d">Original</th>
                            <th className="sub-d">Wt. (40)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length === 0 ? (
                            <tr><td colSpan="10">No mark entries available for display.</td></tr>
                        ) : (
                            reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="sub-col-d">{item.subjectName}</td>
                                    <td className="sub-d">{item.ut1Original}</td>
                                    <td className="wt-d">{item.ut1Weighted}</td>
                                    <td className="sub-d">{item.midTermOriginal}</td>
                                    <td className="wt-d">{item.midTermWeighted}</td>
                                    <td className="sub-d">{item.ut2Original}</td>
                                    <td className="wt-d">{item.ut2Weighted}</td>
                                    <td className="sub-d">{item.finalOriginal}</td>
                                    <td className="wt-d">{item.finalWeighted}</td>
                                    <td className="final-col-d">{item.finalMarksObtained}</td>
                                </tr>
                            ))
                        )}
                        <tr className="total-row-d">
                            <td colSpan="9" className="total-label-d">Total Marks Obtained (out of {totalPossibleMarks})</td>
                            <td className="total-value-d">{totalMarksObtained}</td>
                        </tr>
                        <tr className="percentage-row-d">
                            <td colSpan="9" className="total-label-d">Final Percentage</td>
                            <td className="total-value-d">{percentage}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinalReportCard;
