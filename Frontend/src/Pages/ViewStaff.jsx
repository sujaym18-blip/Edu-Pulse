import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaDownload, FaEdit, FaExclamationTriangle, FaSearch, FaSort,
    FaSpinner, FaTrash, FaUser, FaUserPlus, FaClipboardList, FaSyncAlt
} from 'react-icons/fa';
import { Alert, Snackbar } from '@mui/material';
import '../CSS/viewstaff.css';

const PAGE_SIZES = [10, 25, 50];
const EMPLOYMENT_STATUSES = ['Active', 'Inactive', 'On Leave'];

const getDepartment = (member) => member.department || '';
const getDesignation = (member) => member.designation || member.position || member.jobTitle || '';

const getLocalDate = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const getEmploymentStatus = (member, attendanceByStaffId) => {
    const status = String(member.employmentStatus || member.status || 'Active').trim().toLowerCase();
    if (status === 'inactive' || status === 'disabled' || status === 'terminated') return 'Inactive';
    if (
        status === 'on leave'
        || status === 'on-leave'
        || status === 'leave'
        || attendanceByStaffId.get(String(member.id)) === 'Leave'
    ) return 'On Leave';
    return 'Active';
};

const compareValues = (first, second) => {
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) return firstNumber - secondNumber;
    return String(first ?? '').localeCompare(String(second ?? ''), undefined, { sensitivity: 'base', numeric: true });
};

const ViewStaff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [attendanceError, setAttendanceError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const navigate = useNavigate();

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    const fetchTodayAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        setAttendanceError('');
        try {
            const response = await axios.get('http://localhost:7000/viewattendance', {
                params: { date: getLocalDate() },
                withCredentials: true,
            });
            if (!Array.isArray(response.data?.attendance)) {
                throw new Error('The attendance service returned an invalid response.');
            }
            setTodayAttendance(response.data.attendance);
        } catch (fetchError) {
            console.error('Error fetching today’s staff attendance:', fetchError);
            setAttendanceError(
                fetchError.response?.data?.msg
                || fetchError.message
                || 'Could not load today’s staff attendance. Retry to update On Leave status.'
            );
            if (fetchError.response?.status === 401) {
                navigate('/AdminLogin');
            }
        } finally {
            setAttendanceLoading(false);
        }
    }, [navigate]);

    const fetchStaffData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get("http://localhost:7000/viewstaff", {
                withCredentials: true,
            });
            setStaff(response.data.staff || []);
        } catch (fetchError) {
            console.error('Error fetching staff data:', fetchError);
            if (fetchError.response?.status === 401) {
                setError('Your admin session has expired. Please log in again.');
                navigate('/AdminLogin');
            } else {
                setError(fetchError.response?.data?.msg || 'Failed to fetch staff data. Check the server connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    useEffect(() => {
        fetchTodayAttendance();
        const refreshOnFocus = () => fetchTodayAttendance();
        const intervalId = window.setInterval(fetchTodayAttendance, 60_000);
        window.addEventListener('focus', refreshOnFocus);
        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshOnFocus);
        };
    }, [fetchTodayAttendance]);

    const attendanceByStaffId = useMemo(
        () => new Map(todayAttendance.map(record => [String(record.id), record.status])),
        [todayAttendance]
    );
    const departments = useMemo(
        () => [...new Set(staff.map(getDepartment).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [staff]
    );
    const designations = useMemo(
        () => [...new Set(staff.map(getDesignation).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [staff]
    );

    const filteredStaff = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return staff
            .filter(member => {
                const matchesSearch = !query || [member.id, member.name, member.email]
                    .some(value => String(value ?? '').toLowerCase().includes(query));
                const matchesDepartment = !departmentFilter || getDepartment(member) === departmentFilter;
                const matchesDesignation = !designationFilter
                    || (designationFilter === '__unspecified' ? !getDesignation(member) : getDesignation(member) === designationFilter);
                const matchesStatus = !statusFilter || getEmploymentStatus(member, attendanceByStaffId) === statusFilter;
                return matchesSearch && matchesDepartment && matchesDesignation && matchesStatus;
            })
            .sort((first, second) => {
                const value = sortBy === 'department'
                    ? getDepartment(first)
                    : first[sortBy];
                const otherValue = sortBy === 'department'
                    ? getDepartment(second)
                    : second[sortBy];
                return compareValues(value, otherValue) * (sortDirection === 'asc' ? 1 : -1);
            });
    }, [staff, searchTerm, departmentFilter, designationFilter, statusFilter, sortBy, sortDirection, attendanceByStaffId]);

    const pageCount = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageStaff = filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pageNumbers = [...new Set([
        1,
        pageCount,
        ...[currentPage - 1, currentPage, currentPage + 1]
            .filter(pageNumber => pageNumber > 1 && pageNumber < pageCount),
    ])].sort((first, second) => first - second);
    const statistics = useMemo(() => staff.reduce((counts, member) => {
        counts[getEmploymentStatus(member, attendanceByStaffId)] += 1;
        return counts;
    }, { Total: staff.length, Active: 0, Inactive: 0, 'On Leave': 0 }), [staff, attendanceByStaffId]);

    const hasFilters = searchTerm || departmentFilter || designationFilter || statusFilter;
    const clearFilters = () => {
        setSearchTerm('');
        setDepartmentFilter('');
        setDesignationFilter('');
        setStatusFilter('');
        setPage(1);
    };

    const handleDelete = async (member) => {
        if (!window.confirm(`Are you sure you want to delete ${member.name || 'this staff member'}? This action cannot be undone.`)) return;
        setDeletingId(member._id);
        try {
            const response = await axios.delete(`http://localhost:7000/deletestaff/${member._id}`, {
                withCredentials: true,
            });
            if (!response.data?.success) {
                throw new Error(response.data?.msg || 'Failed to delete staff member.');
            }
            setStaff(previousStaff => previousStaff.filter(staffMember => staffMember._id !== member._id));
            showToast('Staff member deleted successfully.');
        } catch (deleteError) {
            console.error('Error deleting staff member:', deleteError);
            const message = deleteError.response?.data?.msg || deleteError.message || 'Failed to delete staff member.';
            showToast(message, 'error');
            if (deleteError.response?.status === 401) {
                navigate('/AdminLogin');
            }
        } finally {
            setDeletingId(null);
        }
    };

    const exportCsv = () => {
        const columns = [
            ['Staff ID', member => member.id],
            ['Name', member => member.name],
            ['Email', member => member.email],
            ['Department', getDepartment],
            ['Designation', getDesignation],
            ['Employment Status', member => getEmploymentStatus(member, attendanceByStaffId)],
        ];
        const escapeCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const csv = [
            columns.map(([heading]) => escapeCsv(heading)).join(','),
            ...filteredStaff.map(member => columns.map(([, getValue]) => escapeCsv(getValue(member))).join(',')),
        ].join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'staff-records.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(`Exported ${filteredStaff.length} filtered staff record${filteredStaff.length === 1 ? '' : 's'}.`);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const sortHeader = (label, field) => (
        <button
            type="button"
            className="staff-sort-button"
            onClick={() => handleSort(field)}
            aria-label={`Sort by ${label} ${sortBy === field && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
        >
            {label} <FaSort aria-hidden="true" />
        </button>
    );

    return (
        <div className="staff-container">
            <h1 className="page-title">View Staff Members</h1>

            <div className="top-bar">
                <button className="add-user-button" onClick={() => navigate('/StaffRegistration')}>
                    <FaUserPlus /> Add New Staff
                </button>
            </div>

            <section className="staff-statistics" aria-label="Staff statistics">
                {[
                    { label: 'Total Staff', value: statistics.Total, filter: '', unavailable: false },
                    {
                        label: 'Active Staff',
                        value: attendanceLoading ? '…' : attendanceError ? '—' : statistics.Active,
                        filter: 'Active',
                        unavailable: attendanceLoading || Boolean(attendanceError),
                    },
                    { label: 'Inactive Staff', value: statistics.Inactive, filter: 'Inactive', unavailable: false },
                    {
                        label: 'On Leave Today',
                        value: attendanceLoading ? '…' : attendanceError ? '—' : statistics['On Leave'],
                        filter: 'On Leave',
                        unavailable: attendanceLoading || Boolean(attendanceError),
                    },
                ].map(stat => (
                    <button
                        type="button"
                        className={`staff-stat-card${statusFilter === stat.filter ? ' selected' : ''}`}
                        key={stat.label}
                        onClick={() => {
                            setStatusFilter(stat.filter);
                            setPage(1);
                        }}
                        disabled={stat.unavailable}
                        aria-pressed={statusFilter === stat.filter}
                        title={`Show ${stat.label.toLowerCase()}`}
                    >
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                    </button>
                ))}
            </section>

            <section className="staff-tools" aria-label="Search and filter staff">
                <div className="staff-filter-grid">
                <label className="staff-search">
                    <FaSearch aria-hidden="true" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={event => { setSearchTerm(event.target.value); setPage(1); }}
                        placeholder="Search by staff ID, name, or email"
                        aria-label="Search staff by ID, name, or email"
                    />
                </label>
                <label className="staff-filter">
                    <span>Department</span>
                    <select value={departmentFilter} onChange={event => { setDepartmentFilter(event.target.value); setPage(1); }}>
                        <option value="">All departments</option>
                        {departments.map(department => <option key={department} value={department}>{department}</option>)}
                    </select>
                </label>
                <label className="staff-filter">
                    <span>Designation</span>
                    <select value={designationFilter} onChange={event => { setDesignationFilter(event.target.value); setPage(1); }}>
                        <option value="">All designations</option>
                        {designations.map(designation => <option key={designation} value={designation}>{designation}</option>)}
                        <option value="__unspecified">Unspecified</option>
                    </select>
                </label>
                <label className="staff-filter staff-employment-filter">
                    <span>Employment status</span>
                    <select
                        value={statusFilter}
                        onChange={event => { setStatusFilter(event.target.value); setPage(1); }}
                        disabled={attendanceLoading || Boolean(attendanceError)}
                    >
                        <option value="">All statuses</option>
                        {EMPLOYMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </label>
                <label className="staff-filter">
                    <span>Sort by</span>
                    <select value={sortBy} onChange={event => setSortBy(event.target.value)}>
                        <option value="id">Staff ID</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="department">Department</option>
                    </select>
                </label>
                </div>
                <div className="staff-tool-actions">
                <button
                    type="button"
                    className="staff-toolbar-button"
                    onClick={() => setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc')}
                    aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                >
                    {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </button>
                <button type="button" className="staff-toolbar-button" onClick={clearFilters} disabled={!hasFilters}>
                    Clear Filters
                </button>
                <button type="button" className="staff-toolbar-button export-button" onClick={exportCsv} disabled={filteredStaff.length === 0}>
                    <FaDownload /> Export CSV
                </button>
                </div>
            </section>

            {attendanceError && (
                <div className="staff-list-error" role="alert">
                    <FaExclamationTriangle />
                    <span>Today’s staff attendance could not be loaded, so the status filter and attendance-based statistics are unavailable. {attendanceError}</span>
                    <button type="button" className="staff-toolbar-button" onClick={fetchTodayAttendance} disabled={attendanceLoading}>
                        {attendanceLoading ? <FaSpinner className="inline-spinner" /> : <FaSyncAlt />}
                        {attendanceLoading ? 'Loading...' : 'Retry attendance'}
                    </button>
                </div>
            )}

            {error && (
                <div className="staff-list-error" role="alert">
                    <FaExclamationTriangle />
                    <span>{error}</span>
                    <button type="button" className="staff-toolbar-button" onClick={fetchStaffData}>
                        <FaSyncAlt /> Try Again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="staff-state">
                    <FaSpinner className="spinner-icon" />
                    <p>Loading staff data...</p>
                </div>
            ) : error ? null : staff.length === 0 ? (
                <div className="staff-state">
                    <p>No staff members found. Add a staff member to get started.</p>
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="staff-state">
                    <p>No staff members match these search and filter criteria.</p>
                    <button type="button" className="staff-toolbar-button" onClick={clearFilters}>Clear Filters</button>
                </div>
            ) : (
                <>
                    <div className="staff-table-wrapper">
                        <table className="staff-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{sortHeader('Staff ID', 'id')}</th>
                                    <th>{sortHeader('Name', 'name')}</th>
                                    <th>{sortHeader('Email', 'email')}</th>
                                    <th colSpan="4" className="action-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageStaff.map((staffMember, index) => (
                                    <tr key={staffMember._id}>
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td className="staff-id-col">{staffMember.id}</td>
                                        <td className="staff-name-col">{staffMember.name}</td>
                                        <td>{staffMember.email}</td>
                                        <td>
                                            <button className="table-button update-button" onClick={() => navigate(`/UpdateStaff/${staffMember._id}`)}>
                                                <FaEdit /> Update
                                            </button>
                                        </td>
                                        <td>
                                            <button className="table-button profile-button" onClick={() => navigate(`/viewbyidstaff/${staffMember._id}`)}>
                                                <FaUser /> Profile
                                            </button>
                                        </td>
                                        <td>
                                            <button className="table-button attendance-button" onClick={() => navigate(`/StaffAttendance/${staffMember.id}`)}>
                                                <FaClipboardList /> Attendance
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="table-button delete-button"
                                                onClick={() => handleDelete(staffMember)}
                                                disabled={deletingId === staffMember._id}
                                            >
                                                {deletingId === staffMember._id ? <FaSpinner className="inline-spinner" /> : <FaTrash />}
                                                {deletingId === staffMember._id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="staff-pagination">
                        <label>
                            Rows per page
                            <select
                                value={pageSize}
                                onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}
                            >
                                {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </label>
                        <span className="staff-page-summary">
                            {filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length}
                        </span>
                        <div className="staff-page-controls">
                            <button type="button" className="staff-page-button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                            {pageNumbers.map((pageNumber, index) => (
                                <React.Fragment key={pageNumber}>
                                    {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && <span className="staff-page-ellipsis">…</span>}
                                    <button
                                        type="button"
                                        className={`staff-page-button page-number ${pageNumber === currentPage ? 'selected' : ''}`}
                                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                                        onClick={() => setPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                </React.Fragment>
                            ))}
                            <button type="button" className="staff-page-button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast(previous => ({ ...previous, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setToast(previous => ({ ...previous, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ViewStaff;
