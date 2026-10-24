import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    FaCalendarAlt, FaClock, FaDownload, FaSpinner, FaSyncAlt, FaUserGraduate,
} from 'react-icons/fa';
import '../CSS/staffattendance.css';

const HISTORY_PAGE_SIZES = [10, 25, 50];
const ATTENDANCE_STATUSES = ['Full', 'Half', 'Leave'];

const getLocalDate = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const getMonthKey = date => date.slice(0, 7);

const getMonthLabel = monthKey => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
    });
};

const escapeCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

const getStatusLabel = status => {
    if (status === 'Full') return 'Present';
    if (status === 'Half') return 'Half Day';
    if (status === 'Leave') return 'Absent/Leave';
    return status || 'Unknown';
};

const StudentAttendance = ({ staffView = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [historyDateFilter, setHistoryDateFilter] = useState('all');
    const [historyFromDate, setHistoryFromDate] = useState('');
    const [historyToDate, setHistoryToDate] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState('');
    const [historySort, setHistorySort] = useState('newest');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyPageSize, setHistoryPageSize] = useState(10);
    const [refreshToken, setRefreshToken] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const historyMonths = useMemo(
        () => [...new Set(attendanceHistory.map(record => getMonthKey(record.date)))].sort().reverse(),
        [attendanceHistory]
    );

    const periodAttendance = useMemo(() => {
        const today = new Date();
        const todayString = getLocalDate();
        let startDate = '';
        let endDate = '';

        if (historyDateFilter === 'this-month') {
            startDate = `${todayString.slice(0, 7)}-01`;
            endDate = todayString;
        } else if (historyDateFilter === 'last-month') {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const monthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
            startDate = `${monthKey}-01`;
            endDate = `${monthKey}-${String(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
        } else if (historyDateFilter === 'this-year') {
            startDate = `${today.getFullYear()}-01-01`;
            endDate = todayString;
        } else if (historyDateFilter === 'custom') {
            startDate = historyFromDate;
            endDate = historyToDate;
        } else if (/^\d{4}-\d{2}$/.test(historyDateFilter)) {
            startDate = `${historyDateFilter}-01`;
            const [year, month] = historyDateFilter.split('-').map(Number);
            endDate = `${historyDateFilter}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
        }

        if (startDate && endDate && startDate > endDate) return [];
        return attendanceHistory.filter(record =>
            (!startDate || record.date >= startDate) && (!endDate || record.date <= endDate)
        );
    }, [attendanceHistory, historyDateFilter, historyFromDate, historyToDate]);

    const invalidHistoryDateRange = historyDateFilter === 'custom'
        && historyFromDate
        && historyToDate
        && historyFromDate > historyToDate;

    const filteredHistory = useMemo(() => periodAttendance
        .filter(record => !historyStatusFilter || record.status === historyStatusFilter)
        .sort((first, second) => String(first.date).localeCompare(String(second.date)) * (historySort === 'newest' ? -1 : 1)),
    [periodAttendance, historyStatusFilter, historySort]);
    const historyPageCount = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize));
    const currentHistoryPage = Math.min(historyPage, historyPageCount);
    const paginatedHistory = filteredHistory.slice(
        (currentHistoryPage - 1) * historyPageSize,
        currentHistoryPage * historyPageSize
    );
    const historyPageNumbers = [...new Set([
        1,
        historyPageCount,
        ...[currentHistoryPage - 1, currentHistoryPage, currentHistoryPage + 1]
            .filter(pageNumber => pageNumber > 1 && pageNumber < historyPageCount),
    ])].sort((first, second) => first - second);

    useEffect(() => {
        let active = true;
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [studentResponse, attendanceResponse] = await Promise.all([
                    axios.get(`http://localhost:7000/${staffView ? 'viewstudent' : 'admin/viewstudent'}`, {
                        withCredentials: true,
                    }),
                    axios.get(`http://localhost:7000/${staffView ? 'stuviewattendance' : 'admin/stuviewattendance'}`, {
                        withCredentials: true,
                    }),
                ]);
                if (!active) return;

                const studentRecord = (studentResponse.data.student || [])
                    .find(record => String(record.id) === String(id));
                const studentRecords = (attendanceResponse.data.attendance || [])
                    .filter(record => String(record.id) === String(id))
                    .sort((first, second) => String(second.date).localeCompare(String(first.date)));
                setStudent(studentRecord || null);
                setAttendanceHistory(studentRecords);
            } catch (fetchError) {
                console.error('Error fetching student attendance history:', fetchError);
                if (active) {
                    setStudent(null);
                    setAttendanceHistory([]);
                    setError(fetchError.response?.data?.msg || 'Failed to load attendance history. Please try again.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchData();
        return () => { active = false; };
    }, [id, staffView, refreshToken]);

    const clearHistoryFilters = () => {
        setHistoryDateFilter('all');
        setHistoryFromDate('');
        setHistoryToDate('');
        setHistoryStatusFilter('');
        setHistorySort('newest');
        setHistoryPage(1);
    };

    const exportAttendanceHistory = () => {
        const rows = [
            ['Student ID', 'Student Name', 'Date', 'Status'],
            ...filteredHistory.map(record => [
                student.id,
                student.name,
                record.date,
                getStatusLabel(record.status),
            ]),
        ];
        const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-${student.id}-attendance.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    if (loading) {
        return (
            <div className="attendance-container loading-state">
                <FaSpinner className="spinner-icon" />
                <p>Loading student attendance history...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="attendance-container error-state">
                <FaUserGraduate aria-hidden="true" />
                <p>{error || `Student #${id} was not found.`}</p>
                {error && (
                    <button type="button" className="history-back-button" onClick={() => setRefreshToken(token => token + 1)}>
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    const presentCount = periodAttendance.filter(record => record.status === 'Full').length;
    const halfDayCount = periodAttendance.filter(record => record.status === 'Half').length;
    const absentCount = periodAttendance.filter(record => record.status === 'Leave').length;
    const attendancePercentage = periodAttendance.length
        ? Math.round(((presentCount + halfDayCount * 0.5) / periodAttendance.length) * 100)
        : 0;

    return (
        <div className="attendance-container staff-attendance-history">
            <button type="button" className="history-back-button" onClick={() => navigate(-1)}>
                Back
            </button>
            <h1 className="attendance-title"><FaClock /> Attendance History</h1>

            <section className="staff-history-profile" aria-label="Student details">
                <h2>{student.name || 'Student'}</h2>
                <p>
                    Student ID: {student.id}
                    {student.email ? ` · ${student.email}` : ''}
                    {student.department ? ` · ${student.department}` : ''}
                </p>
            </section>

            <section className="staff-history-statistics" aria-label="Attendance summary">
                {[
                    { label: 'Recorded Days', value: periodAttendance.length, type: 'total' },
                    { label: 'Present', value: presentCount, type: 'present' },
                    { label: 'Half Day', value: halfDayCount, type: 'half' },
                    { label: 'Absent/Leave', value: absentCount, type: 'absent' },
                    { label: 'Attendance', value: `${attendancePercentage}%`, type: 'percentage' },
                ].map(stat => (
                    <div className={`staff-history-stat ${stat.type}`} key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                    </div>
                ))}
            </section>

            <section className="staff-history-filters" aria-label="Filter attendance history">
                <label>
                    <span><FaCalendarAlt aria-hidden="true" /> Date range</span>
                    <select
                        value={historyDateFilter}
                        onChange={event => {
                            setHistoryDateFilter(event.target.value);
                            setHistoryPage(1);
                        }}
                    >
                        <option value="all">All dates</option>
                        <option value="this-month">This month</option>
                        <option value="last-month">Last month</option>
                        <option value="this-year">This year</option>
                        {historyMonths.map(month => (
                            <option key={month} value={month}>{getMonthLabel(month)}</option>
                        ))}
                        <option value="custom">Custom date range</option>
                    </select>
                </label>
                {historyDateFilter === 'custom' && (
                    <div className="staff-history-custom-dates">
                        <label>
                            <span>From</span>
                            <input
                                type="date"
                                value={historyFromDate}
                                max={historyToDate || getLocalDate()}
                                onChange={event => {
                                    setHistoryFromDate(event.target.value);
                                    setHistoryPage(1);
                                }}
                            />
                        </label>
                        <label>
                            <span>To</span>
                            <input
                                type="date"
                                value={historyToDate}
                                min={historyFromDate || undefined}
                                max={getLocalDate()}
                                onChange={event => {
                                    setHistoryToDate(event.target.value);
                                    setHistoryPage(1);
                                }}
                            />
                        </label>
                    </div>
                )}
                <label>
                    <span>Status</span>
                    <select
                        value={historyStatusFilter}
                        onChange={event => {
                            setHistoryStatusFilter(event.target.value);
                            setHistoryPage(1);
                        }}
                    >
                        <option value="">All statuses</option>
                        {ATTENDANCE_STATUSES.map(status => (
                            <option key={status} value={status}>{getStatusLabel(status)}</option>
                        ))}
                    </select>
                </label>
                <label>
                    <span>Order</span>
                    <select value={historySort} onChange={event => setHistorySort(event.target.value)}>
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </label>
                <button
                    type="button"
                    className="history-toolbar-button"
                    onClick={clearHistoryFilters}
                    disabled={historyDateFilter === 'all' && !historyStatusFilter && historySort === 'newest' && !historyFromDate && !historyToDate}
                >
                    Clear filters
                </button>
                <button
                    type="button"
                    className="history-toolbar-button history-export-button"
                    onClick={exportAttendanceHistory}
                    disabled={filteredHistory.length === 0}
                >
                    <FaDownload /> Export CSV
                </button>
                <button
                    type="button"
                    className="history-toolbar-button"
                    onClick={() => setRefreshToken(token => token + 1)}
                >
                    <FaSyncAlt /> Refresh
                </button>
            </section>

            {invalidHistoryDateRange && (
                <div className="message-box error-message" role="alert">
                    The start date must be on or before the end date.
                </div>
            )}

            <div className="staff-history-table-heading">
                <h2 className="staff-history-heading">Attendance Records</h2>
                <span>{filteredHistory.length} record{filteredHistory.length === 1 ? '' : 's'}</span>
            </div>
            {filteredHistory.length === 0 ? (
                <div className="staff-history-state">
                    <FaUserGraduate aria-hidden="true" />
                    <p>
                        {attendanceHistory.length === 0
                            ? 'No attendance records have been saved for this student.'
                            : 'No attendance records match these filters.'}
                    </p>
                    {attendanceHistory.length > 0 && (
                        <button type="button" className="history-toolbar-button" onClick={clearHistoryFilters}>
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="attendance-table-wrapper">
                        <table className="attendance-table staff-history-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistory.map((record, index) => (
                                    <tr key={record._id || `${record.id}-${record.date}`}>
                                        <td>{(currentHistoryPage - 1) * historyPageSize + index + 1}</td>
                                        <td>{new Date(`${record.date}T00:00:00`).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}</td>
                                        <td>
                                            <span className={`staff-history-status ${String(record.status || '').toLowerCase()}`}>
                                                {getStatusLabel(record.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="staff-history-pagination">
                        <label>
                            Rows per page
                            <select
                                value={historyPageSize}
                                onChange={event => {
                                    setHistoryPageSize(Number(event.target.value));
                                    setHistoryPage(1);
                                }}
                            >
                                {HISTORY_PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </label>
                        <span className="staff-history-page-summary">
                            {(currentHistoryPage - 1) * historyPageSize + 1}–{Math.min(currentHistoryPage * historyPageSize, filteredHistory.length)} of {filteredHistory.length}
                        </span>
                        <div className="staff-history-page-controls">
                            <button
                                type="button"
                                className="history-toolbar-button"
                                onClick={() => setHistoryPage(currentHistoryPage - 1)}
                                disabled={currentHistoryPage === 1}
                            >
                                Previous
                            </button>
                            {historyPageNumbers.map((pageNumber, index) => (
                                <React.Fragment key={pageNumber}>
                                    {index > 0 && pageNumber - historyPageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
                                    <button
                                        type="button"
                                        className={`history-toolbar-button history-page-number ${pageNumber === currentHistoryPage ? 'selected' : ''}`}
                                        aria-current={pageNumber === currentHistoryPage ? 'page' : undefined}
                                        onClick={() => setHistoryPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                </React.Fragment>
                            ))}
                            <button
                                type="button"
                                className="history-toolbar-button"
                                onClick={() => setHistoryPage(currentHistoryPage + 1)}
                                disabled={currentHistoryPage === historyPageCount}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendance;
