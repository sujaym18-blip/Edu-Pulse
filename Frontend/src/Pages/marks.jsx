import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';
import { FaGraduationCap, FaUserGraduate, FaClipboardList, FaCheckCircle, FaExclamationCircle, FaSpinner, FaSchool, FaPencilAlt, FaTimesCircle } from 'react-icons/fa';
import '../CSS/ExamMarks.css'; 

const normalizeDepartment = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const ExamMarksRegistration = () => {
    const [branch, setBranch] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [examType, setExamType] = useState('');
    const [marks, setMarks] = useState({
        subject1: '', subject2: '', subject3: '', subject4: '', subject5: '', subject6: '',
    });
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false); 
    const [fetchingStudents, setFetchingStudents] = useState(true); 

    const departmentOptions = useMemo(() => {
        const departmentsByName = new Map();
        students.forEach((student) => {
            const value = String(student.department || '').trim();
            const key = normalizeDepartment(value);
            if (key && !departmentsByName.has(key)) {
                departmentsByName.set(key, { key, label: value });
            }
        });
        return Array.from(departmentsByName.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [students]);

    const filteredStudents = useMemo(
        () => branch
            ? students.filter(student => normalizeDepartment(student.department) === branch)
            : [],
        [branch, students]
    );

    useEffect(() => {
        const fetchStudents = async () => {
            setFetchingStudents(true);
            const token = cookie.get('emstoken');
            
            if (!token) {
                setAuthError('You must log in to submit the form.');
                setFetchingStudents(false);
                return;
            }

            try {
                const studentResponse = await axios.get('http://localhost:7000/viewstudent', {
                    withCredentials: true,
                });

                if (!studentResponse.data.success || !Array.isArray(studentResponse.data.student)) {
                    throw new Error(studentResponse.data.msg || 'The server returned an invalid student list.');
                }
                setStudents(studentResponse.data.student);
            } catch (error) {
                console.error('Error fetching marks form data:', error);
                setAuthError(error.response?.data?.msg || error.message || 'An error occurred while fetching students. Please try again.');
            } finally {
                setFetchingStudents(false);
            }
        };
        fetchStudents();
    }, []);

    const handleMarksChange = (e, subject) => {
        setMarks((prev) => ({ ...prev, [subject]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setLoading(true); 

        if (!selectedStudent || !examType) {
            setAuthError('Please select a student, exam type, and enter marks.');
            setLoading(false);
            return;
        }

        const token = cookie.get('emstoken');
        if (!token) {
            setAuthError('You must log in to submit the form.');
            setLoading(false);
            return;
        }

        const marksData = {
            studentId: selectedStudent,
            subject1: marks.subject1,
            subject2: marks.subject2,
            subject3: marks.subject3,
            subject4: marks.subject4,
            subject5: marks.subject5,
            subject6: marks.subject6,
        };

        let apiUrl = '';
        switch (examType) {
            case 'ut1': apiUrl = 'http://localhost:7000/unittest1'; break;
            case 'ut2': apiUrl = 'http://localhost:7000/unittest2'; break;
            case 'midterm': apiUrl = 'http://localhost:7000/midTerm'; break;
            case 'final': apiUrl = 'http://localhost:7000/final'; break;
            default: setAuthError('Invalid exam type selected.'); setLoading(false); return;
        }

        try {
            const response = await axios.post(apiUrl, marksData, {
                withCredentials: true,
            });

            if (response.status === 200) {
                alert('Marks submitted successfully!');
                setMarks({ subject1: '', subject2: '', subject3: '', subject4: '', subject5: '', subject6: '', });
                setSelectedStudent('');
                setExamType('');
                setBranch(''); 
            } else {
                setAuthError('Failed to submit marks.');
            }
        } catch (error) {
            setAuthError(`An error occurred while submitting marks: ${error.response?.data?.msg || error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const currentStudent = filteredStudents.find(s => String(s.id) === selectedStudent);
    const rollNoDisplay = currentStudent?.rollNo || currentStudent?.id || 'N/A';
    const nameDisplay = currentStudent?.name || 'N/A';


    if (fetchingStudents) {
         return (
             <div className="full-page-wrapper loading-state">
                 <FaSpinner className="loading-spinner" />
                 <p>Fetching student data from server...</p>
             </div>
         );
    }

    return (
        <div className="form-container modern-layout-final">
            <header className="form-header">
                <h1 className="main-title"><FaGraduationCap className="icon-main" /> Marks Submission Portal</h1>
                <p className="subtitle">Please complete the steps below to submit examination scores.</p>
            </header>

            {authError && (
                <div className="alert-message alert-error">
                    <FaTimesCircle />
                    <span>{authError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="marks-form">
                
                <div className="form-step active-step">
                    <h3 className="step-header">
                        <span className="step-number">1</span>
                        <FaSchool /> Select Department
                    </h3>
                    <div className="form-group">
                        <label htmlFor="branch">Department</label>
                        <select 
                            id="branch"
                            value={branch} 
                            onChange={(e) => {
                                setBranch(e.target.value);
                                setSelectedStudent('');
                                setExamType('');
                            }}
                            className="form-control"
                            required
                            disabled={fetchingStudents || departmentOptions.length === 0}
                        >
                            <option value="">-- Choose Department --</option>
                            {departmentOptions.map((department) => (
                                <option key={department.key} value={department.key}>
                                    {department.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={`form-step ${!branch ? 'disabled-step' : 'active-step'}`}>
                    <h3 className="step-header">
                        <span className="step-number">2</span>
                        <FaUserGraduate /> Select Student
                    </h3>
                    <div className="form-group">
                        <label htmlFor="student">Student Name / Roll No</label>
                        <select
                            id="student"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="form-control"
                            required
                            disabled={!branch || filteredStudents.length === 0}
                        >
                            <option value="">
                                {fetchingStudents
                                    ? 'Loading students...'
                                    : !branch
                                    ? '-- Select Department First --'
                                    : filteredStudents.length === 0
                                        ? 'No students registered in this department'
                                        : '-- Select Student --'}
                            </option>
                            {filteredStudents.map((student) => (
                                <option key={student._id || student.id} value={String(student.id)}> 
                                    {`${student.name} (Roll: ${student.rollNo || student.id || 'N/A'})`} 
                                </option>
                            ))}
                        </select>
                        {selectedStudent && currentStudent && (
                            <p className="selection-info">
                                Selected: {nameDisplay} (Roll No: {rollNoDisplay})
                            </p>
                        )}
                    </div>
                </div>

                <div className={`form-step ${!selectedStudent ? 'disabled-step' : 'active-step'}`}>
                    <h3 className="step-header">
                        <span className="step-number">3</span>
                        <FaClipboardList /> Select Exam Type
                    </h3>
                    <div className="form-group">
                        <label htmlFor="examType">Examination Type</label>
                        <select 
                            id="examType"
                            value={examType} 
                            onChange={(e) => setExamType(e.target.value)} 
                            className="form-control"
                            required
                            disabled={!selectedStudent}
                        >
                            <option value="">-- Choose Exam Type --</option>
                            <option value="ut1">Unit Test 1 (UT1)</option>
                            <option value="ut2">Unit Test 2 (UT2)</option>
                            <option value="midterm">Midterm Examination</option>
                            <option value="final">Final Examination</option>
                        </select>
                    </div>
                </div>

                <div className={`form-step marks-entry-step ${!examType || !selectedStudent ? 'disabled-step' : 'active-step'}`}>
                    <h3 className="step-header">
                        <span className="step-number">4</span>
                        <FaPencilAlt /> Enter Marks
                    </h3>
                    
                    <div className="marks-vertical-stack">
                        {['subject1', 'subject2', 'subject3', 'subject4', 'subject5', 'subject6'].map((subject, index) => (
                            <div key={subject} className="marks-input-row">
                                <label htmlFor={subject}>Subject {index + 1} Marks</label>
                                <input
                                    id={subject}
                                    type="number"
                                    name={subject}
                                    placeholder="0-100"
                                    value={marks[subject]}
                                    onChange={(e) => handleMarksChange(e, subject)} 
                                    className="form-control marks-input"
                                    min="0"
                                    max="100"
                                    required
                                    disabled={!examType}
                                />
                            </div>
                        ))}
                    </div>
                </div>


                <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={!examType || !selectedStudent || loading}
                >
                    {loading ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                    {loading ? 'Submitting Data...' : 'Submit All Marks'}
                </button>
            </form>
        </div>
    );
};

export default ExamMarksRegistration;