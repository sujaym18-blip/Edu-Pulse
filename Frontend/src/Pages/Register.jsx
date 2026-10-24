import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    GraduationCap,
    UserCheck,
    ShieldCheck,
    CheckCircle2,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    Lock,
    Mail,
    Phone,
    MapPin,
    User,
    Calendar,
    Camera,
    Check,
    AlertCircle,
    Sparkles,
    Building2,
    Home,
    Bus,
    BookOpen,
    Upload,
    X,
    CreditCard
} from 'lucide-react';

import studentImage from '../assets/student.webp';
import teacherImage from '../assets/teacher.png';
import adminImage from '../assets/admin.png';
import '../CSS/Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Determine initial role from URL query param (e.g. ?role=admin)
    const initialRoleParam = searchParams.get('role');
    const getInitialTabIndex = (role) => {
        if (!role) return 0;
        const lower = role.toLowerCase();
        if (lower === 'staff' || lower === 'teacher') return 1;
        if (lower === 'admin') return 2;
        return 0; // default student
    };

    const [activeTab, setActiveTab] = useState(getInitialTabIndex(initialRoleParam));
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Departments for dropdown
    const [departments, setDepartments] = useState([
        { id: 'cse', name: 'Computer Science & Engineering' },
        { id: 'mech', name: 'Mechanical Engineering' },
        { id: 'eee', name: 'Electrical & Electronics Engineering' },
        { id: 'civil', name: 'Civil Engineering' },
        { id: 'it', name: 'Information Technology' },
        { id: 'biotech', name: 'Biotechnology & Health Sciences' },
        { id: 'business', name: 'Business Administration (MBA/BBA)' }
    ]);

    // Student Form State
    const [studentForm, setStudentForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: '',
        dob: '',
        departmentId: 'Computer Science & Engineering',
        city: '',
        address: '',
        hostel: false,
        transport: false,
        library: false,
        agreeTerms: true
    });

    // Staff Form State
    const [staffForm, setStaffForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: '',
        department: 'Computer Science & Engineering',
        city: '',
        address: '',
        image: null,
        imagePreview: null,
        agreeTerms: true
    });

    // Admin Form State
    const [adminForm, setAdminForm] = useState({
        organization: '',
        email: '',
        contact: '',
        city: '',
        password: '',
        confirmPassword: '',
        agreeTerms: true
    });

    // Fetch dynamic departments from backend
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const response = await axios.get('http://localhost:7000/viewdepartment');
                if (response.data && response.data.dept && response.data.dept.length > 0) {
                    const mapped = response.data.dept.map((d) => ({
                        id: d.departId || d._id,
                        name: d.departName || d.departmentName || d.name
                    }));
                    setDepartments(mapped);
                }
            } catch (err) {
                // Keep default departments list
            }
        };
        fetchDepts();
    }, []);

    // Sync tab when query param changes
    useEffect(() => {
        if (initialRoleParam) {
            setActiveTab(getInitialTabIndex(initialRoleParam));
        }
    }, [initialRoleParam]);

    const handleRoleSelect = (index) => {
        setActiveTab(index);
        setError(null);
        setSuccessMsg(null);
        const roles = ['student', 'staff', 'admin'];
        setSearchParams({ role: roles[index] });
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Password strength evaluator
    const calculateStrength = (pwd) => {
        if (!pwd) return { pct: 0, text: 'Required', color: '#94a3b8' };
        let points = 0;
        if (pwd.length >= 6) points += 25;
        if (pwd.length >= 8) points += 25;
        if (/[0-9]/.test(pwd)) points += 25;
        if (/[^A-Za-z0-9]/.test(pwd)) points += 25;

        if (points <= 25) return { pct: 25, text: 'Weak', color: '#ef4444' };
        if (points <= 50) return { pct: 50, text: 'Moderate', color: '#f59e0b' };
        if (points <= 75) return { pct: 75, text: 'Good', color: '#3b82f6' };
        return { pct: 100, text: 'Strong & Secure', color: '#10b981' };
    };

    // Calculate student total tuition + optional fees
    const baseTuition = 100000;
    const hostelFee = studentForm.hostel ? 60000 : 0;
    const transportFee = studentForm.transport ? 25000 : 0;
    const libraryFee = studentForm.library ? 5000 : 0;
    const studentTotalFee = baseTuition + hostelFee + transportFee + libraryFee;

    // Handle Student Submit
    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.password) {
            setError('Please fill in all mandatory fields: Full Name, Email, and Password.');
            return;
        }
        if (!validateEmail(studentForm.email)) {
            setError('Please enter a valid academic or personal email address.');
            return;
        }
        if (studentForm.password.length < 6) {
            setError('Password must contain at least 6 characters.');
            return;
        }
        if (studentForm.password !== studentForm.confirmPassword) {
            setError('Passwords do not match. Please re-check your password fields.');
            return;
        }
        if (!studentForm.agreeTerms) {
            setError('Please accept the Institutional Terms & Conditions to complete enrollment.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: studentForm.name,
                email: studentForm.email,
                password: studentForm.password,
                contact: studentForm.contact ? Number(studentForm.contact) : undefined,
                dob: studentForm.dob,
                departmentId: studentForm.departmentId || (departments[0]?.name || 'Computer Science & Engineering'),
                city: studentForm.city,
                address: studentForm.address,
                hostel: studentForm.hostel ? 'Yes' : 'No',
                transport: studentForm.transport ? 'Yes' : 'No',
                library: studentForm.library ? 'Yes' : 'No',
                basefee: baseTuition,
                totalfee: studentTotalFee
            };

            const response = await axios.post('http://localhost:7000/admission', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                setSuccessMsg('Student registration completed successfully! Redirecting to student portal login...');
                setTimeout(() => {
                    navigate('/StudentLogin');
                }, 1600);
            } else {
                setError(response.data?.msg || response.data?.message || 'Registration failed. Please verify your details.');
            }
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Server connection error. Please verify backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Staff Submit
    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password) {
            setError('Please fill in required fields: Full Name, Official Email, and Password.');
            return;
        }
        if (!validateEmail(staffForm.email)) {
            setError('Please provide a valid institutional email address.');
            return;
        }
        if (staffForm.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (staffForm.password !== staffForm.confirmPassword) {
            setError('Passwords do not match. Please re-check your password.');
            return;
        }
        if (!staffForm.agreeTerms) {
            setError('Please affirm your institutional employment declaration.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', staffForm.name);
            formData.append('email', staffForm.email);
            formData.append('password', staffForm.password);
            formData.append('contact', staffForm.contact);
            formData.append('department', staffForm.department || (departments[0]?.name || 'Computer Science & Engineering'));
            formData.append('city', staffForm.city);
            formData.append('address', staffForm.address);
            if (staffForm.image) {
                formData.append('image', staffForm.image);
            }

            const response = await axios.post('http://localhost:7000/staffregister', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200 || response.status === 201) {
                setSuccessMsg('Faculty member registered successfully! Redirecting to faculty login...');
                setTimeout(() => {
                    navigate('/StaffLogin');
                }, 1600);
            } else {
                setError(response.data?.msg || response.data?.message || 'Staff registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Server error. Please verify staff registration service.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Admin Submit
    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!adminForm.email.trim() || !adminForm.password) {
            setError('Please fill in both Admin Email and Password.');
            return;
        }
        if (!validateEmail(adminForm.email)) {
            setError('Please enter a valid administrator email address.');
            return;
        }
        if (adminForm.password.length < 6) {
            setError('Password must contain at least 6 characters.');
            return;
        }
        if (adminForm.password !== adminForm.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!adminForm.agreeTerms) {
            setError('Please acknowledge administrator governance authority.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: adminForm.email,
                password: adminForm.password,
                contact: adminForm.contact ? Number(adminForm.contact) : undefined,
                city: adminForm.city,
                organization: adminForm.organization || 'EduPulse University System'
            };

            const response = await axios.post('http://localhost:7000/adminregister', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                setSuccessMsg('System Administrator registered successfully! Redirecting to admin console...');
                setTimeout(() => {
                    navigate('/AdminLogin');
                }, 1600);
            } else {
                setError(response.data?.msg || response.data?.message || 'Admin registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Server error. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Image file handler for staff
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStaffForm(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const removeStaffImage = () => {
        setStaffForm(prev => ({
            ...prev,
            image: null,
            imagePreview: null
        }));
    };

    const currentPasswordStrength =
        activeTab === 0
            ? calculateStrength(studentForm.password)
            : activeTab === 1
            ? calculateStrength(staffForm.password)
            : calculateStrength(adminForm.password);

    return (
        <div className="ep-register-wrapper">
            {/* Ambient Lighting Orbs */}
            <div className="ep-ambient-glow ep-glow-1" />
            <div className="ep-ambient-glow ep-glow-2" />
            <div className="ep-ambient-glow ep-glow-3" />

            <div className="ep-register-container">
                {/* Top Navigation Bar */}
                <div className="ep-top-bar">
                    <Link to="/" className="ep-brand-badge">
                        <div className="ep-brand-icon-box">
                            <Sparkles size={24} />
                        </div>
                        <div className="ep-brand-text">
                            <h2>EduPulse ERP</h2>
                            <span>Unified Campus OS</span>
                        </div>
                    </Link>

                    <Link to="/AllLogin" className="ep-back-btn">
                        <ArrowLeft size={16} />
                        <span>Back to Login Portals</span>
                    </Link>
                </div>

                {/* Main Split-Screen Container Card */}
                <div className="ep-main-card">
                    {/* ==================== LEFT SHOWCASE PANEL ==================== */}
                    <div className="ep-showcase-panel">
                        <div className="ep-showcase-decor" />

                        <div className="ep-showcase-header">
                            {/* Role Indicator Badge */}
                            {activeTab === 0 && (
                                <div className="ep-role-pill-badge ep-pill-student">
                                    <GraduationCap size={15} />
                                    <span>Student Academic Admission</span>
                                </div>
                            )}
                            {activeTab === 1 && (
                                <div className="ep-role-pill-badge ep-pill-staff">
                                    <UserCheck size={15} />
                                    <span>Faculty & Staff Onboarding</span>
                                </div>
                            )}
                            {activeTab === 2 && (
                                <div className="ep-role-pill-badge ep-pill-admin">
                                    <ShieldCheck size={15} />
                                    <span>Institutional Governance</span>
                                </div>
                            )}

                            {/* Dynamic Showcase Heading */}
                            <h2 className="ep-showcase-title">
                                {activeTab === 0 && 'Shape Your Future With Digital Learning'}
                                {activeTab === 1 && 'Elevate Academic Teaching & Research'}
                                {activeTab === 2 && 'Complete Command of Institutional Systems'}
                            </h2>

                            <p className="ep-showcase-desc">
                                {activeTab === 0 &&
                                    'Unlock centralized access to lecture schedules, grade reports, hostel living, bus routes, and automated fee statements.'}
                                {activeTab === 1 &&
                                    'Manage academic grading, student attendance, departmental curriculum, and staff salary records in one unified interface.'}
                                {activeTab === 2 &&
                                    'Oversee campus departments, student admissions, faculty appointments, financial audits, and security controls with real-time insight.'}
                            </p>
                        </div>

                        {/* Feature Highlights with Glowing Icons */}
                        <div className="ep-feature-list">
                            {activeTab === 0 && (
                                <>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-student">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Integrated Campus Amenities</h4>
                                            <p>Instant enrollment into on-campus hostel, express bus transit, and digital library.</p>
                                        </div>
                                    </div>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-student">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Real-Time Gradebooks & Tests</h4>
                                            <p>Access UT1, UT2, Mid-Term, and Final report cards on your personalized dashboard.</p>
                                        </div>
                                    </div>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-student">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Itemized Fee Transparency</h4>
                                            <p>Clear tuition calculations with digital receipts and downloadable payment history.</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 1 && (
                                <>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-staff">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Lecture & Syllabus Management</h4>
                                            <p>Plan weekly lectures, issue digital assignments, and review student file submissions.</p>
                                        </div>
                                    </div>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-staff">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Automated Attendance & Grading</h4>
                                            <p>Track class presence in seconds and push exam marks directly to student portals.</p>
                                        </div>
                                    </div>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-staff">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Faculty Profile & Salary Register</h4>
                                            <p>Access monthly payroll records, leave logs, and official departmental circulars.</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 2 && (
                                <>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-admin">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Enterprise Department Directory</h4>
                                            <p>Create and supervise engineering, sciences, arts, and business departments.</p>
                                        </div>
                                    </div>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-admin">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Financial & Fee Oversight</h4>
                                            <p>Aggregate student tuition, hostel collections, transport dues, and faculty disbursements.</p>
                                        </div>
                                    </div>
                                    <div className="ep-feature-item">
                                        <div className="ep-feature-icon ep-icon-admin">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="ep-feature-text">
                                            <h4>Campus Security & Broadcasts</h4>
                                            <p>Publish emergency announcements, maintain driver records, and track live bus GPS.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Interactive Dynamic Mockup Card */}
                        <div className="ep-mockup-card">
                            <div className="ep-mockup-header">
                                <span className="ep-mockup-tag">
                                    {activeTab === 0 ? 'Digital Student Pass' : activeTab === 1 ? 'Faculty Credential' : 'System Command'}
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.72rem',
                                        color: '#34d399',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontWeight: 700
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: '#34d399',
                                            display: 'inline-block'
                                        }}
                                    />
                                    Verified Secure
                                </span>
                            </div>
                            <div className="ep-mockup-body">
                                <img
                                    src={activeTab === 0 ? studentImage : activeTab === 1 ? teacherImage : adminImage}
                                    alt="Profile Avatar"
                                    className="ep-mockup-avatar"
                                />
                                <div className="ep-mockup-info">
                                    <h5>
                                        {activeTab === 0
                                            ? studentForm.name || 'Sample Student'
                                            : activeTab === 1
                                            ? staffForm.name || 'Faculty Member'
                                            : adminForm.organization || 'EduPulse University'}
                                    </h5>
                                    <p>
                                        {activeTab === 0
                                            ? studentForm.departmentId || 'Computer Science & Engineering'
                                            : activeTab === 1
                                            ? staffForm.department || 'Academic Department'
                                            : adminForm.email || 'system-admin@edupulse.edu'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Social Proof Trust Banner */}
                        <div className="ep-showcase-footer">
                            <div className="ep-trust-badge">
                                <ShieldCheck size={16} color="#38bdf8" />
                                <span>256-Bit SSL Encrypted ERP</span>
                            </div>
                            <div className="ep-trust-badge">
                                <span>Session 2025–2026</span>
                            </div>
                        </div>
                    </div>

                    {/* ==================== RIGHT FORM PANEL ==================== */}
                    <div className="ep-form-panel">
                        <div className="ep-form-header">
                            <div className="ep-form-header-top">
                                <span className="ep-login-redirect-link">
                                    Already have an account?{' '}
                                    <Link
                                        to={
                                            activeTab === 0
                                                ? '/StudentLogin'
                                                : activeTab === 1
                                                ? '/StaffLogin'
                                                : '/AdminLogin'
                                        }
                                    >
                                        Sign In →
                                    </Link>
                                </span>
                            </div>
                            <h1 className="ep-form-title">Create Your Account</h1>
                            <p className="ep-form-subtitle">
                                Select your institutional role below to get started with instant access.
                            </p>
                        </div>

                        {/* Interactive Role Switcher Cards */}
                        <div className="ep-role-selector">
                            {/* 1. Student Card */}
                            <div
                                className={`ep-role-card ${activeTab === 0 ? 'active-student' : ''}`}
                                onClick={() => handleRoleSelect(0)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="ep-role-card-icon ep-role-student-icon">
                                    <GraduationCap size={22} />
                                </div>
                                <div className="ep-role-card-title">Student</div>
                                <div className="ep-role-card-desc">Academic Enrollment</div>
                                {activeTab === 0 && <span className="ep-role-active-indicator" />}
                            </div>

                            {/* 2. Staff Card */}
                            <div
                                className={`ep-role-card ${activeTab === 1 ? 'active-staff' : ''}`}
                                onClick={() => handleRoleSelect(1)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="ep-role-card-icon ep-role-staff-icon">
                                    <UserCheck size={22} />
                                </div>
                                <div className="ep-role-card-title">Faculty / Staff</div>
                                <div className="ep-role-card-desc">Teaching & Departments</div>
                                {activeTab === 1 && <span className="ep-role-active-indicator" />}
                            </div>

                            {/* 3. Admin Card */}
                            <div
                                className={`ep-role-card ${activeTab === 2 ? 'active-admin' : ''}`}
                                onClick={() => handleRoleSelect(2)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="ep-role-card-icon ep-role-admin-icon">
                                    <ShieldCheck size={22} />
                                </div>
                                <div className="ep-role-card-title">Administrator</div>
                                <div className="ep-role-card-desc">System Operations</div>
                                {activeTab === 2 && <span className="ep-role-active-indicator" />}
                            </div>
                        </div>

                        {/* Error Alert Banner */}
                        {error && (
                            <div className="ep-alert-banner ep-alert-error">
                                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>{error}</div>
                                <button
                                    type="button"
                                    onClick={() => setError(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        padding: 0
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Success Alert Banner */}
                        {successMsg && (
                            <div className="ep-alert-banner ep-alert-success">
                                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>{successMsg}</div>
                            </div>
                        )}

                        {/* ============================================================== */}
                        {/* FORM 1: STUDENT REGISTRATION                                    */}
                        {/* ============================================================== */}
                        {activeTab === 0 && (
                            <form onSubmit={handleStudentSubmit}>
                                <div className="ep-form-section-title">
                                    <span className="ep-section-step">Step 01</span>
                                    <h3>Personal & Account Credentials</h3>
                                </div>

                                <div className="ep-form-grid">
                                    {/* Full Name */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Full Name <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <User size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="e.g. Rahul Sharma"
                                                value={studentForm.name}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Email Address <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                type="email"
                                                className="ep-input-control"
                                                placeholder="rahul@example.com"
                                                value={studentForm.email}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Password <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="ep-input-control has-action"
                                                placeholder="Create strong password"
                                                value={studentForm.password}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ep-input-eye-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {studentForm.password && (
                                            <div className="ep-password-meter">
                                                <div className="ep-meter-bar">
                                                    <div
                                                        className="ep-meter-fill"
                                                        style={{
                                                            width: `${currentPasswordStrength.pct}%`,
                                                            backgroundColor: currentPasswordStrength.color
                                                        }}
                                                    />
                                                </div>
                                                <div className="ep-meter-labels">
                                                    <span>Strength: <strong style={{ color: currentPasswordStrength.color }}>{currentPasswordStrength.text}</strong></span>
                                                    <span>Min 6 characters</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Confirm Password <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="ep-input-control has-action"
                                                placeholder="Re-enter password"
                                                value={studentForm.confirmPassword}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ep-input-eye-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {studentForm.confirmPassword && (
                                            <div style={{ fontSize: '0.74rem', marginTop: 4 }}>
                                                {studentForm.password === studentForm.confirmPassword ? (
                                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Check size={14} /> Passwords match perfectly
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#ef4444' }}>Passwords do not match yet</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Program & Contact */}
                                <div className="ep-form-section-title">
                                    <span className="ep-section-step">Step 02</span>
                                    <h3>Academic Program & Contact</h3>
                                </div>

                                <div className="ep-form-grid">
                                    {/* Department */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Academic Program / Department <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Building2 size={18} />
                                            </span>
                                            <select
                                                className="ep-select-control"
                                                value={studentForm.departmentId}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, departmentId: e.target.value }))}
                                            >
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.name}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">Phone / Mobile Number</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Phone size={18} />
                                            </span>
                                            <input
                                                type="tel"
                                                className="ep-input-control"
                                                placeholder="9876543210"
                                                value={studentForm.contact}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, contact: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* DOB */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">Date of Birth</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Calendar size={18} />
                                            </span>
                                            <input
                                                type="date"
                                                className="ep-input-control"
                                                value={studentForm.dob}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, dob: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">City</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <MapPin size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="e.g. Mumbai, Indore, Bangalore"
                                                value={studentForm.city}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="ep-form-group ep-col-full">
                                        <label className="ep-form-label">Residential Address</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Home size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="Apartment, Street address, Area"
                                                value={studentForm.address}
                                                onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Campus Amenities Opt-In & Fee Breakdown */}
                                <div className="ep-form-section-title">
                                    <span className="ep-section-step">Step 03</span>
                                    <h3>Campus Facilities & Fee Estimate</h3>
                                </div>

                                <div className="ep-facilities-grid">
                                    {/* Hostel Option */}
                                    <div
                                        className={`ep-facility-card ${studentForm.hostel ? 'selected' : ''}`}
                                        onClick={() => setStudentForm(prev => ({ ...prev, hostel: !prev.hostel }))}
                                    >
                                        <div className="ep-facility-top">
                                            <div className="ep-facility-icon-circle">
                                                <Home size={18} />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={studentForm.hostel}
                                                readOnly
                                                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563eb' }}
                                            />
                                        </div>
                                        <div className="ep-facility-name">Hostel Living</div>
                                        <div className="ep-facility-fee">+ ₹60,000 / yr</div>
                                    </div>

                                    {/* Transport Option */}
                                    <div
                                        className={`ep-facility-card ${studentForm.transport ? 'selected' : ''}`}
                                        onClick={() => setStudentForm(prev => ({ ...prev, transport: !prev.transport }))}
                                    >
                                        <div className="ep-facility-top">
                                            <div className="ep-facility-icon-circle">
                                                <Bus size={18} />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={studentForm.transport}
                                                readOnly
                                                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563eb' }}
                                            />
                                        </div>
                                        <div className="ep-facility-name">Bus Transit</div>
                                        <div className="ep-facility-fee">+ ₹25,000 / yr</div>
                                    </div>

                                    {/* Library Option */}
                                    <div
                                        className={`ep-facility-card ${studentForm.library ? 'selected' : ''}`}
                                        onClick={() => setStudentForm(prev => ({ ...prev, library: !prev.library }))}
                                    >
                                        <div className="ep-facility-top">
                                            <div className="ep-facility-icon-circle">
                                                <BookOpen size={18} />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={studentForm.library}
                                                readOnly
                                                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563eb' }}
                                            />
                                        </div>
                                        <div className="ep-facility-name">Digital Library</div>
                                        <div className="ep-facility-fee">+ ₹5,000 / yr</div>
                                    </div>
                                </div>

                                {/* Live Fee Calculator Box */}
                                <div className="ep-fee-calculator-box">
                                    <div className="ep-fee-details">
                                        <h5>
                                            <CreditCard size={17} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                                            Estimated Academic Fee
                                        </h5>
                                        <p>
                                            Base Tuition: ₹1,00,000
                                            {studentForm.hostel && ' • Hostel (+₹60,000)'}
                                            {studentForm.transport && ' • Transit (+₹25,000)'}
                                            {studentForm.library && ' • Library (+₹5,000)'}
                                        </p>
                                    </div>
                                    <div className="ep-total-fee-badge">
                                        <div className="ep-total-fee-label">Total First Year</div>
                                        <div className="ep-total-fee-amount">₹{studentTotalFee.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="ep-terms-row">
                                    <input
                                        type="checkbox"
                                        id="studentAgreeTerms"
                                        checked={studentForm.agreeTerms}
                                        onChange={(e) => setStudentForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                                    />
                                    <label htmlFor="studentAgreeTerms" className="ep-terms-label">
                                        I certify that the information entered is accurate and agree to institutional terms of admission.
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="ep-submit-btn ep-btn-student" disabled={loading}>
                                    {loading ? (
                                        <span>Enrolling Student Account...</span>
                                    ) : (
                                        <>
                                            <span>Complete Student Registration</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* ============================================================== */}
                        {/* FORM 2: STAFF / FACULTY REGISTRATION                           */}
                        {/* ============================================================== */}
                        {activeTab === 1 && (
                            <form onSubmit={handleStaffSubmit}>
                                <div className="ep-form-section-title">
                                    <span className="ep-section-step">Step 01</span>
                                    <h3>Faculty Credentials & Profile</h3>
                                </div>

                                <div className="ep-form-grid">
                                    {/* Name */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Full Name & Title <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <User size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="e.g. Dr. Priya Nair"
                                                value={staffForm.name}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Official Faculty Email <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                type="email"
                                                className="ep-input-control"
                                                placeholder="priya.nair@edupulse.edu"
                                                value={staffForm.email}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Password <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="ep-input-control has-action"
                                                placeholder="Create faculty password"
                                                value={staffForm.password}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ep-input-eye-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {staffForm.password && (
                                            <div className="ep-password-meter">
                                                <div className="ep-meter-bar">
                                                    <div
                                                        className="ep-meter-fill"
                                                        style={{
                                                            width: `${currentPasswordStrength.pct}%`,
                                                            backgroundColor: currentPasswordStrength.color
                                                        }}
                                                    />
                                                </div>
                                                <div className="ep-meter-labels">
                                                    <span>Strength: <strong style={{ color: currentPasswordStrength.color }}>{currentPasswordStrength.text}</strong></span>
                                                    <span>Min 6 characters</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Confirm Password <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="ep-input-control has-action"
                                                placeholder="Re-enter password"
                                                value={staffForm.confirmPassword}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ep-input-eye-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="ep-form-section-title">
                                    <span className="ep-section-step">Step 02</span>
                                    <h3>Department & Contact Details</h3>
                                </div>

                                <div className="ep-form-grid">
                                    {/* Department */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Assigned Department <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Building2 size={18} />
                                            </span>
                                            <select
                                                className="ep-select-control"
                                                value={staffForm.department}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, department: e.target.value }))}
                                            >
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.name}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">Contact Number</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Phone size={18} />
                                            </span>
                                            <input
                                                type="tel"
                                                className="ep-input-control"
                                                placeholder="9876543210"
                                                value={staffForm.contact}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, contact: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">City</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <MapPin size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="Campus city"
                                                value={staffForm.city}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">Address</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Home size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="Campus quarters / Residence"
                                                value={staffForm.address}
                                                onChange={(e) => setStaffForm(prev => ({ ...prev, address: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Profile Image Dropzone */}
                                    <div className="ep-form-group ep-col-full">
                                        <label className="ep-form-label">Faculty Profile Photo (Optional)</label>
                                        <div className="ep-upload-zone">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                {staffForm.imagePreview ? (
                                                    <img
                                                        src={staffForm.imagePreview}
                                                        alt="Faculty Preview"
                                                        className="ep-upload-avatar-preview"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: 54,
                                                            height: 54,
                                                            borderRadius: 14,
                                                            backgroundColor: '#d1fae5',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#059669'
                                                        }}
                                                    >
                                                        <Camera size={24} />
                                                    </div>
                                                )}
                                                <div className="ep-upload-info">
                                                    <h5>{staffForm.image ? staffForm.image.name : 'Upload Official ID Photo'}</h5>
                                                    <p>Supports PNG, JPG, or WEBP up to 5MB</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {staffForm.image && (
                                                    <button
                                                        type="button"
                                                        onClick={removeStaffImage}
                                                        style={{
                                                            borderRadius: 8,
                                                            border: '1px solid #ef4444',
                                                            background: 'none',
                                                            color: '#ef4444',
                                                            padding: '6px 12px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                                <label
                                                    style={{
                                                        borderRadius: 8,
                                                        border: '1px solid #10b981',
                                                        background: '#10b981',
                                                        color: '#ffffff',
                                                        padding: '6px 14px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6
                                                    }}
                                                >
                                                    <Upload size={14} />
                                                    {staffForm.image ? 'Change Photo' : 'Choose File'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        hidden
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ep-terms-row">
                                    <input
                                        type="checkbox"
                                        id="staffAgreeTerms"
                                        checked={staffForm.agreeTerms}
                                        onChange={(e) => setStaffForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                                    />
                                    <label htmlFor="staffAgreeTerms" className="ep-terms-label">
                                        I certify that the academic credentials and departmental affiliation provided are authentic.
                                    </label>
                                </div>

                                <button type="submit" className="ep-submit-btn ep-btn-staff" disabled={loading}>
                                    {loading ? (
                                        <span>Registering Faculty Member...</span>
                                    ) : (
                                        <>
                                            <span>Register Faculty Account</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* ============================================================== */}
                        {/* FORM 3: ADMINISTRATOR REGISTRATION                            */}
                        {/* ============================================================== */}
                        {activeTab === 2 && (
                            <form onSubmit={handleAdminSubmit}>
                                <div className="ep-form-section-title">
                                    <span className="ep-section-step">Step 01</span>
                                    <h3>Institution & Security Authority</h3>
                                </div>

                                <div className="ep-form-grid">
                                    {/* Organization */}
                                    <div className="ep-form-group ep-col-full">
                                        <label className="ep-form-label">Institution / University Name</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Building2 size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="e.g. EduPulse National Institute of Technology"
                                                value={adminForm.organization}
                                                onChange={(e) => setAdminForm(prev => ({ ...prev, organization: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Administrator Email <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                type="email"
                                                className="ep-input-control"
                                                placeholder="admin@institution.edu"
                                                value={adminForm.email}
                                                onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">Official Emergency Contact</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Phone size={18} />
                                            </span>
                                            <input
                                                type="tel"
                                                className="ep-input-control"
                                                placeholder="022-2345678"
                                                value={adminForm.contact}
                                                onChange={(e) => setAdminForm(prev => ({ ...prev, contact: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Master Password <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="ep-input-control has-action"
                                                placeholder="Enter secure master password"
                                                value={adminForm.password}
                                                onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ep-input-eye-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {adminForm.password && (
                                            <div className="ep-password-meter">
                                                <div className="ep-meter-bar">
                                                    <div
                                                        className="ep-meter-fill"
                                                        style={{
                                                            width: `${currentPasswordStrength.pct}%`,
                                                            backgroundColor: currentPasswordStrength.color
                                                        }}
                                                    />
                                                </div>
                                                <div className="ep-meter-labels">
                                                    <span>Strength: <strong style={{ color: currentPasswordStrength.color }}>{currentPasswordStrength.text}</strong></span>
                                                    <span>Min 6 characters</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="ep-form-group ep-col-half">
                                        <label className="ep-form-label">
                                            Confirm Master Password <span className="ep-required">*</span>
                                        </label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="ep-input-control has-action"
                                                placeholder="Re-enter master password"
                                                value={adminForm.confirmPassword}
                                                onChange={(e) => setAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ep-input-eye-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="ep-form-group ep-col-full">
                                        <label className="ep-form-label">Headquarters / Campus City</label>
                                        <div className="ep-input-box">
                                            <span className="ep-input-icon">
                                                <MapPin size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                className="ep-input-control"
                                                placeholder="e.g. New Delhi, Bengaluru"
                                                value={adminForm.city}
                                                onChange={(e) => setAdminForm(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="ep-terms-row">
                                    <input
                                        type="checkbox"
                                        id="adminAgreeTerms"
                                        checked={adminForm.agreeTerms}
                                        onChange={(e) => setAdminForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                                    />
                                    <label htmlFor="adminAgreeTerms" className="ep-terms-label">
                                        I confirm that I hold administrative authority and executive privileges for this campus.
                                    </label>
                                </div>

                                <button type="submit" className="ep-submit-btn ep-btn-admin" disabled={loading}>
                                    {loading ? (
                                        <span>Creating Administrator Profile...</span>
                                    ) : (
                                        <>
                                            <span>Register Administrator Account</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Footer Portal Links */}
                        <div className="ep-form-footer-links">
                            <div>Need direct login access?</div>
                            <div className="ep-quick-portal-links">
                                <Link to="/StudentLogin" className="ep-portal-link">
                                    Student Portal →
                                </Link>
                                <Link to="/StaffLogin" className="ep-portal-link">
                                    Faculty Portal →
                                </Link>
                                <Link to="/AdminLogin" className="ep-portal-link">
                                    Admin Console →
                                </Link>
                                <Link to="/AllLogin" className="ep-portal-link">
                                    All Portals Overview →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
