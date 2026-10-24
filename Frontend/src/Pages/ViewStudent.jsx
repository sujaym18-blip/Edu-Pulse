import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaUserPlus,
    FaTrash,
    FaEdit,
    FaUserGraduate,
    FaClipboardList,
    FaSpinner,
    FaExclamationTriangle,
    FaDownload,
    FaSearch,
    FaSyncAlt,
    FaSort,
    FaTimes
} from 'react-icons/fa';
import { Alert, Snackbar } from '@mui/material';
import '../CSS/viewstudent.css'; 

const BASE_URL = 'http://localhost:7000';
const PAGE_SIZES = [10, 25, 50];
const FACILITY_FIELDS = {
    hostel: 'hostel',
    transport: 'transport',
    library: 'library',
};

const isOptedIn = value => ['yes', 'true', '1', 'opted', 'active'].includes(String(value ?? '').trim().toLowerCase());

const compareValues = (first, second) => {
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
        return firstNumber - secondNumber;
    }
    return String(first ?? '').localeCompare(String(second ?? ''), undefined, {
        sensitivity: 'base',
        numeric: true,
    });
};

const ViewStudent = ({ staffView = false }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingStudentId, setDeletingStudentId] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [facilityFilter, setFacilityFilter] = useState('');
    const [facilityValue, setFacilityValue] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const navigate = useNavigate();
    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    const fetchStudentData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const endpoint = staffView ? '/viewstudent' : '/admin/viewstudent';
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                withCredentials: true,
            });
            if (!Array.isArray(response.data.student)) {
                throw new Error(response.data.msg || 'The server returned an invalid student list.');
            }
            setStudents(response.data.student);
        } catch (err) {
            console.error("Fetch Error:", err);
            if (err.response && err.response.status === 401) {
                setError(`Your ${staffView ? 'staff' : 'admin'} session has expired. Please sign in again.`);
                navigate(staffView ? '/StaffLogin' : '/AdminLogin');
            } else {
                setError(err.response?.data?.msg || err.message || "Failed to fetch student data.");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, staffView]);

    const deleteStudent = async (mongoId) => {
        const student = students.find((record) => record._id === mongoId);
        if (!student || !window.confirm(
            `Delete the student admission record for ${student.name || "this student"}? Historical attendance and fee records will be retained.`
        )) return;

        setDeletingStudentId(mongoId);
        setError("");
        try {
            const response = await axios.delete(`${BASE_URL}/deletestudent/${mongoId}`, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setStudents((currentStudents) => currentStudents.filter((record) => record._id !== mongoId));
                showToast('Student deleted successfully.');
            } 
        } catch (err) {
            console.error("Delete Error:", err);
            if (err.response && err.response.status === 401) {
                setError("Your admin session has expired. Please sign in again.");
                navigate('/AdminLogin');
            } else {
                showToast(err.response?.data?.msg || "Failed to delete student. Please try again later.", 'error');
            }
        } finally {
            setDeletingStudentId("");
        }
    };

    const departments = useMemo(
        () => [...new Set(students.map(student => student.department).filter(Boolean))]
            .sort((first, second) => first.localeCompare(second)),
        [students]
    );
    const cities = useMemo(
        () => [...new Set(students.map(student => student.city).filter(Boolean))]
            .sort((first, second) => first.localeCompare(second)),
        [students]
    );
    const filteredStudents = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return students
            .filter((student) =>
                [student.id, student.name, student.email, student.department, student.contact, student.city]
                    .some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch))
            )
            .filter(student => !departmentFilter || student.department === departmentFilter)
            .filter(student => !cityFilter || student.city === cityFilter)
            .filter(student => {
                if (!facilityFilter || !facilityValue) return true;
                const optedIn = isOptedIn(student[FACILITY_FIELDS[facilityFilter]]);
                return facilityValue === 'yes' ? optedIn : !optedIn;
            })
            .sort((first, second) => compareValues(first[sortBy], second[sortBy]) * (sortDirection === 'asc' ? 1 : -1));
    }, [students, searchTerm, departmentFilter, cityFilter, facilityFilter, facilityValue, sortBy, sortDirection]);
    const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pageNumbers = [...new Set([
        1,
        pageCount,
        ...[currentPage - 1, currentPage, currentPage + 1]
            .filter(pageNumber => pageNumber > 1 && pageNumber < pageCount),
    ])].sort((first, second) => first - second);
    const facilityCounts = useMemo(() => ({
        hostel: students.filter(student => isOptedIn(student.hostel)).length,
        transport: students.filter(student => isOptedIn(student.transport)).length,
        library: students.filter(student => isOptedIn(student.library)).length,
    }), [students]);
    const hasFilters = Boolean(searchTerm || departmentFilter || cityFilter || facilityValue);

    const clearFilters = () => {
        setSearchTerm('');
        setDepartmentFilter('');
        setCityFilter('');
        setFacilityFilter('');
        setFacilityValue('');
        setPage(1);
    };

    const applyFacilityFilter = facility => {
        const isSameFilter = facilityFilter === facility && facilityValue === 'yes';
        setFacilityFilter(isSameFilter ? '' : facility);
        setFacilityValue(isSameFilter ? '' : 'yes');
        setPage(1);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(direction => direction === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const sortHeader = (label, field) => (
        <button
            type="button"
            className="student-sort-button"
            onClick={() => handleSort(field)}
            aria-label={`Sort by ${label} ${sortBy === field && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
        >
            {label} <FaSort aria-hidden="true" />
        </button>
    );

    const exportStudents = () => {
        const columns = [
            ["Student ID", "id"],
            ["Name", "name"],
            ["Email", "email"],
            ["Contact", "contact"],
            ["Department", "department"],
            ["City", "city"],
            ["Hostel", "hostel"],
            ["Transport", "transport"],
            ["Library", "library"],
        ];
        const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [
            columns.map(([label]) => escapeCsv(label)).join(","),
            ...filteredStudents.map((student) =>
                columns.map(([, key]) => escapeCsv(student[key])).join(",")
            ),
        ].join("\r\n");
        const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "students.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleUpdateClick = (mongoId) => {
        navigate(`/UpdateStudent/${mongoId}`);
    };

    const handleProfileClick = (mongoId) => {
        navigate(staffView ? `/StaffStudentProfile/${mongoId}` : `/ProfileStudent/${mongoId}`);
    };

    const handleAddStudentClick = () => {
        navigate('/StudentRegistration');
    };
    
    const viewAttendance = (studentId) => {
        navigate(staffView ? `/StaffStudentAttendance/${studentId}` : `/StudentAttendance/${studentId}`);
    };

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);


    return (
        <div className={`student-container${staffView ? ' staff-student-view' : ''}`}>
            <h1 className="page-title">{staffView ? 'View Students' : 'Manage Students'}</h1>

            {!staffView && (
                <div className="student-page-topbar">
                    <button type="button" className="add-user-button" onClick={handleAddStudentClick}>
                        <FaUserPlus /> Add New Student
                    </button>
                </div>
            )}

            {!staffView && (
                <section className="student-statistics" aria-label="Student statistics">
                    <button
                        type="button"
                        className={`student-stat-card${!hasFilters ? ' selected' : ''}`}
                        onClick={clearFilters}
                        aria-pressed={!hasFilters}
                    >
                        <span>Total Students</span>
                        <strong>{students.length}</strong>
                    </button>
                    <button
                        type="button"
                        className={`student-stat-card${facilityFilter === 'hostel' && facilityValue === 'yes' ? ' selected' : ''}`}
                        onClick={() => applyFacilityFilter('hostel')}
                        aria-pressed={facilityFilter === 'hostel' && facilityValue === 'yes'}
                    >
                        <span>Hostel Residents</span>
                        <strong>{facilityCounts.hostel}</strong>
                    </button>
                    <button
                        type="button"
                        className={`student-stat-card${facilityFilter === 'transport' && facilityValue === 'yes' ? ' selected' : ''}`}
                        onClick={() => applyFacilityFilter('transport')}
                        aria-pressed={facilityFilter === 'transport' && facilityValue === 'yes'}
                    >
                        <span>Transport Opted</span>
                        <strong>{facilityCounts.transport}</strong>
                    </button>
                    <button
                        type="button"
                        className={`student-stat-card${facilityFilter === 'library' && facilityValue === 'yes' ? ' selected' : ''}`}
                        onClick={() => applyFacilityFilter('library')}
                        aria-pressed={facilityFilter === 'library' && facilityValue === 'yes'}
                    >
                        <span>Library Members</span>
                        <strong>{facilityCounts.library}</strong>
                    </button>
                </section>
            )}

            <div className="student-list-toolbar">
                <label className="student-search">
                    <FaSearch aria-hidden="true" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }}
                        placeholder="Search by name, ID, email, or department"
                        aria-label="Search students"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="student-search-clear"
                            onClick={() => { setSearchTerm(''); setPage(1); }}
                            aria-label="Clear student search"
                        >
                            <FaTimes />
                        </button>
                    )}
                </label>
                <div className="student-toolbar-actions">
                    <button className="student-toolbar-button" onClick={fetchStudentData} disabled={loading}>
                        <FaSyncAlt className={loading ? "refresh-spinning" : ""} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                    <button className="student-toolbar-button" onClick={exportStudents} disabled={filteredStudents.length === 0}>
                        <FaDownload /> Export CSV
                    </button>
                </div>
            </div>

            {!staffView && students.length > 0 && (
                <section className="student-filter-panel" aria-label="Filter students">
                    <div className="student-filter-grid">
                        <label className="student-filter">
                            <span>Department</span>
                            <select value={departmentFilter} onChange={event => { setDepartmentFilter(event.target.value); setPage(1); }}>
                                <option value="">All departments</option>
                                {departments.map(department => <option key={department} value={department}>{department}</option>)}
                            </select>
                        </label>
                        <label className="student-filter">
                            <span>City</span>
                            <select value={cityFilter} onChange={event => { setCityFilter(event.target.value); setPage(1); }}>
                                <option value="">All cities</option>
                                {cities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </label>
                        <label className="student-filter">
                            <span>Facility</span>
                            <select
                                value={facilityFilter}
                                onChange={event => {
                                    setFacilityFilter(event.target.value);
                                    setFacilityValue(event.target.value ? 'yes' : '');
                                    setPage(1);
                                }}
                            >
                                <option value="">All facilities</option>
                                <option value="hostel">Hostel</option>
                                <option value="transport">Transport</option>
                                <option value="library">Library</option>
                            </select>
                        </label>
                        <label className="student-filter">
                            <span>Facility status</span>
                            <select
                                value={facilityValue}
                                onChange={event => { setFacilityValue(event.target.value); setPage(1); }}
                                disabled={!facilityFilter}
                            >
                                <option value="">Any</option>
                                <option value="yes">Opted</option>
                                <option value="no">Not opted</option>
                            </select>
                        </label>
                    </div>
                    <div className="student-table-tools">
                    <label className="student-sort-control">
                        <span>Sort by</span>
                        <select value={sortBy} onChange={event => setSortBy(event.target.value)}>
                            <option value="name">Name</option>
                            <option value="id">Student ID</option>
                            <option value="email">Email</option>
                            <option value="department">Department</option>
                        </select>
                    </label>
                    <button
                        type="button"
                        className="student-toolbar-button"
                        onClick={() => setSortDirection(direction => direction === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortDirection === 'asc' ? 'A to Z' : 'Z to A'}
                    </button>
                    <button
                        type="button"
                        className="student-toolbar-button"
                        onClick={clearFilters}
                        disabled={!hasFilters}
                    >
                        Clear Filters
                    </button>
                    </div>
                </section>
            )}

            {error && (
                <div className="student-list-error" role="alert">
                    <FaExclamationTriangle />
                    <span>{error}</span>
                    <button className="student-toolbar-button" onClick={fetchStudentData} disabled={loading}>
                        <FaSyncAlt className={loading ? "refresh-spinning" : ""} />
                        {loading ? "Retrying..." : "Try Again"}
                    </button>
                </div>
            )}

            {loading && students.length === 0 ? (
                <div className="student-list-state" role="status">
                    <FaSpinner className="spinner-icon" />
                    <p>Loading Student Data...</p>
                </div>
            ) : students.length === 0 && error ? (
                <div className="student-list-state">
                    <p>No student records could be loaded.</p>
                    <button className="student-toolbar-button" onClick={fetchStudentData}>
                        <FaSyncAlt /> Try Again
                    </button>
                </div>
            ) : students.length === 0 ? (
                <div className="student-list-state">
                    <p>No students found in the system. Please add a new student.</p>
                </div>
            ) : filteredStudents.length === 0 && !error ? (
                <div className="student-list-state">
                    <p>
                        {searchTerm
                            ? `No students match “${searchTerm}” and the selected filters.`
                            : 'No students match the selected filters.'}
                    </p>
                    <button type="button" className="student-toolbar-button" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                <div className="student-table-wrapper">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{sortHeader('Student ID', 'id')}</th>
                                <th>{sortHeader('Name', 'name')}</th>
                                <th>{sortHeader('Email', 'email')}</th>
                                {staffView
                                    ? <th colSpan="2" className='action-header'>Actions</th>
                                    : <th colSpan="4" className='action-header'>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {pageStudents.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="staff-id-col">{student.id}</td>
                                    <td className="staff-name-col">{student.name}</td>
                                    <td>{student.email}</td>
                                    {staffView ? (
                                        <>
                                            <td>
                                                <button className="table-button profile-button" onClick={() => handleProfileClick(student._id)}>
                                                    <FaUserGraduate /> Profile
                                                </button>
                                            </td>
                                            <td>
                                                <button className="table-button attendance-button" onClick={() => viewAttendance(student.id)}>
                                                    <FaClipboardList /> Attendance
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>
                                                <button className="table-button update-button" onClick={() => handleUpdateClick(student._id)}>
                                                    <FaEdit /> Update
                                                </button>
                                            </td>
                                            <td>
                                                <button className="table-button profile-button" onClick={() => handleProfileClick(student._id)}>
                                                    <FaUserGraduate /> Profile
                                                </button>
                                            </td>
                                            <td>
                                                <button className="table-button attendance-button" onClick={() => viewAttendance(student.id)}>
                                                    <FaClipboardList /> Attendance
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className="table-button delete-button"
                                                    onClick={() => deleteStudent(student._id)}
                                                    disabled={deletingStudentId === student._id}
                                                >
                                                    <FaTrash /> {deletingStudentId === student._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="student-pagination">
                    {!staffView && (
                        <label className="student-page-size">
                            Rows per page
                            <select
                                value={pageSize}
                                onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}
                            >
                                {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </label>
                    )}
                    <span className="student-page-summary">
                        {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length}
                    </span>
                    <div className="student-page-controls">
                        <button type="button" className="student-page-button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                            Previous
                        </button>
                        {pageNumbers.map((pageNumber, index) => (
                            <React.Fragment key={pageNumber}>
                                {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
                                <button
                                    type="button"
                                    className={`student-page-button${pageNumber === currentPage ? ' selected' : ''}`}
                                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                                    onClick={() => setPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            </React.Fragment>
                        ))}
                        <button type="button" className="student-page-button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>
                            Next
                        </button>
                    </div>
                </div>
                </>
            )}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast(current => ({ ...current, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast(current => ({ ...current, open: false }))}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ViewStudent;