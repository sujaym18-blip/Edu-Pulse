import React, { useEffect, useState } from 'react';
import axios from "axios";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaSave, FaUsers, FaSpinner } from 'react-icons/fa';
import '../CSS/studentattendance.css';

const getLocalDate = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const StuAttendance = () => {
    const [students, setStudents] = useState([]);
    const [records, setRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getLocalDate);
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchStudentData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get("http://localhost:7000/viewstudent", { withCredentials: true });
            setStudents(response.data.student || []);
        } catch (error) {
            console.error("Error fetching student data:", error);
            setError("Failed to fetch student list. Check server connection (7000) or URL.");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    useEffect(() => {
        if (!selectedDate || students.length === 0) {
            setRecords([]);
            return undefined;
        }

        let active = true;
        const fetchAttendanceForDate = async () => {
            setLoadingAttendance(true);
            setError('');
            try {
                const response = await axios.get('http://localhost:7000/stuviewattendance', {
                    params: { date: selectedDate },
                    withCredentials: true,
                });
                if (!active) return;

                const savedRecords = new Map(
                    (response.data.attendance || []).map(record => [String(record.id), record.status])
                );
                setRecords(students.map(student => ({
                    id: student.id,
                    name: student.name,
                    status: savedRecords.get(String(student.id)) || 'Leave',
                    date: selectedDate,
                })));
            } catch (attendanceError) {
                console.error('Error fetching student attendance:', attendanceError);
                if (active) {
                    setRecords([]);
                    setError(attendanceError.response?.data?.msg || 'Failed to load attendance for this date. Please try again.');
                }
            } finally {
                if (active) setLoadingAttendance(false);
            }
        };

        fetchAttendanceForDate();
        return () => { active = false; };
    }, [selectedDate, students]);

    const handleDateChange = (e) => {
        setRecords([]);
        setSelectedDate(e.target.value);
    };

    const handleRadioChange = (e, studentId) => {
        const status = e.target.value;
        setRecords(prevRecords => prevRecords.map(record => 
            record.id === studentId ? { ...record, status: status } : record
        ));
    };

    const funsave = async (e) => {
        e.preventDefault();

        if (!selectedDate) {
            setError("Please select the attendance date.");
            return;
        }

        const dataToSend = records.filter(r => r.date === selectedDate);
        if (dataToSend.length === 0) {
             setError("No attendance records to save for the selected date.");
             return;
        }

        setIsSaving(true);
        setError('');

        try {
            const response = await axios.post(
                "http://localhost:7000/attendancecheck",
                { records: dataToSend },
                { withCredentials: true }
            );
            setRecords(dataToSend);
            alert(response.data.msg || "Attendance saved successfully!");
        } catch (error) {
            setError(error.response?.data?.msg || `Error saving attendance: ${error.message}.`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="attendance-container loading-state">
                <FaSpinner className="spinner-icon" />
                <p>Loading Student Data...</p>
            </div>
        );
    }
    
    if (students.length === 0 && !error) {
         return (
            <div className="attendance-container error-state">
                <FaUsers />
                <p>No student members found in the system.</p>
            </div>
        );
    }

    return (
        <div className="attendance-container">
            <h1 className="attendance-title"><FaClock /> Student Daily Attendance</h1>
            
            <form onSubmit={funsave}>
                
                <div className="date-selector-bar">
                    <label htmlFor="attendance-date"><FaCalendarAlt /> Select Date:</label>
                    <input
                        id="attendance-date"
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        required
                        max={getLocalDate()}
                    />
                </div>
                
                {error && <div className="message-box error-message">{error}</div>}
                {loadingAttendance && <div className="message-box">Loading attendance for selected date...</div>}
                
                <div className="attendance-table-wrapper">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Present</th>
                                <th>Half Day</th>
                                <th>Absent/Leave</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={record.id} className={record.status === 'Leave' ? 'status-leave' : ''}>
                                    <td>{index + 1}</td>
                                    <td className="student-name-col">{students.find(m => m.id === record.id)?.name || 'N/A'}</td>
                                    
                                    <td className="radio-col">
                                        <label className={`attendance-option ${record.status === 'Full' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`attendance_${record.id}`}
                                                value="Full"
                                                checked={record.status === 'Full'}
                                                onChange={(e) => handleRadioChange(e, record.id)}
                                                disabled={!selectedDate}
                                            />
                                            <FaCheckCircle className="check-icon full-day" />
                                            <span>Present</span>
                                        </label>
                                    </td>
                                    
                                    <td className="radio-col">
                                        <label className={`attendance-option ${record.status === 'Half' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`attendance_${record.id}`}
                                                value="Half"
                                                checked={record.status === 'Half'}
                                                onChange={(e) => handleRadioChange(e, record.id)}
                                                disabled={!selectedDate}
                                            />
                                            <FaCheckCircle className="check-icon half-day" />
                                            <span>Half Day</span>
                                        </label>
                                    </td>
                                    
                                    <td className="radio-col">
                                        <label className={`attendance-option ${record.status === 'Leave' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`attendance_${record.id}`}
                                                value="Leave"
                                                checked={record.status === 'Leave'}
                                                onChange={(e) => handleRadioChange(e, record.id)}
                                                disabled={!selectedDate}
                                            />
                                            <FaTimesCircle className="check-icon leave-status" />
                                            <span>Absent/Leave</span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button 
                    type='submit' 
                    className='save-button' 
                    disabled={isSaving || loadingAttendance || !selectedDate || students.length === 0 || records.length === 0}
                >
                    <FaSave /> {isSaving ? 'Saving...' : 'Save Attendance'}
                </button>
            </form>
        </div>
    );
};

export default StuAttendance;