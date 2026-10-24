import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';
import { FaGraduationCap, FaSchool, FaBook, FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import '../CSS/Subject.css';

const BASE_URL = 'http://localhost:7000';
const EMPTY_SUBJECTS = {
  subject1: '',
  subject2: '',
  subject3: '',
  subject4: '',
  subject5: '',
  subject6: '',
};

const normalizeDepartment = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '');

const departmentKeys = (value) => {
  const normalized = normalizeDepartment(value);
  const acronym = String(value || '')
    .trim()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toLowerCase();
  const aliases = { eec: 'eee', eee: 'eec' };
  return new Set([normalized, acronym, aliases[normalized], aliases[acronym]].filter(Boolean));
};

const SubjectRegistration = () => {
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [registeredSubjects, setRegisteredSubjects] = useState([]);
  const [subjects, setSubjects] = useState(EMPTY_SUBJECTS);
  const [authError, setAuthError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      const [departmentResult, subjectResult] = await Promise.allSettled([
        axios.get(`${BASE_URL}/viewdepartment`),
        axios.get(`${BASE_URL}/staff/viewsubjects`, { withCredentials: true }),
      ]);

      if (departmentResult.status === 'fulfilled') {
        const list = departmentResult.value.data.dept;
        if (Array.isArray(list)) {
          setDepartments(list.filter(department => department._id && department.departName));
        } else {
          setAuthError('The server returned an invalid department list.');
        }
      } else {
        console.error('Unable to load departments:', departmentResult.reason);
        setAuthError(departmentResult.reason.response?.data?.msg || 'Unable to load departments. Please try again.');
      }

      if (subjectResult.status === 'fulfilled' && Array.isArray(subjectResult.value.data.subject)) {
        setRegisteredSubjects(subjectResult.value.data.subject);
      } else if (subjectResult.status === 'rejected') {
        console.error('Unable to load saved subjects:', subjectResult.reason);
        setAuthError(previous => previous || subjectResult.reason.response?.data?.msg || 'Unable to load saved subjects.');
      }
      setLoadingDepartments(false);
    };

    fetchRegistrationData();
  }, []);

  const handleDepartmentChange = (e) => {
    const selectedRef = e.target.value;
    const department = departments.find(item => String(item._id) === selectedRef);
    setDepartmentId(selectedRef);
    setMessage('');
    setAuthError('');
    if (!department) {
      setSubjects(EMPTY_SUBJECTS);
      return;
    }

    const subjectEntry = registeredSubjects.find(entry =>
      String(entry.departmentRef || '') === selectedRef ||
      String(entry.departmentId || '') === String(department.departId ?? '') ||
      [...departmentKeys(entry.departmentName), ...departmentKeys(entry.branch)]
        .some(key => departmentKeys(department.departName).has(key)) ||
      [...departmentKeys(entry.branch)].some(key => departmentKeys(department.departId).has(key))
    );
    setSubjects(subjectEntry
      ? Object.fromEntries(Object.keys(EMPTY_SUBJECTS).map(key => [key, subjectEntry[key] || '']))
      : EMPTY_SUBJECTS);
  };

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    setSubjects((prev) => ({
      ...prev,
      [name]: value
    }));
    setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const token = cookie.get('emstoken'); 
    if (!token) {
      setAuthError('You must log in to submit the form.');
      return;
    }

    const department = departments.find(item => String(item._id) === departmentId);
    if (!department) {
      setAuthError('Please select a valid department.');
      return;
    }

    const subjectData = {
      departmentId: String(department.departId ?? ''),
      departmentRef: String(department._id),
      departmentName: department.departName,
      subject1: subjects.subject1,
      subject2: subjects.subject2,
      subject3: subjects.subject3,
      subject4: subjects.subject4,
      subject5: subjects.subject5,
      subject6: subjects.subject6,
    };

    try {
      setLoading(true); 
      const response = await axios.post(`${BASE_URL}/subjectregister`, subjectData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setMessage('Subjects saved. Students in this department can now view them in their report cards.');
        setRegisteredSubjects(previous => [
          ...previous.filter(item =>
            String(item.departmentRef || '') !== departmentId &&
            String(item.departmentId || '') !== String(department.departId ?? '')
          ),
          response.data.subject,
        ]);
      } else {
        setAuthError('Failed to register subjects. Server returned unexpected response.');
      }
    } catch (error) {
      setAuthError(`Error registering subjects: ${error.response?.data?.msg || error.message}`);
      console.error('Error registering subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departments.find(d => String(d._id) === departmentId);
  const currentDeptName = selectedDepartment?.departName || 'Department';

  return (
    <div className="form-container modern-layout-final">
      <header className="form-header">
        <h1 className="main-title"><FaBook className="icon-main" /> Subject Registration</h1>
        <p className="subtitle">Register the core subjects for a specific department.</p>
      </header>

      {authError && (
        <div className="alert-message alert-error">
          <FaTimesCircle />
          <span>{authError}</span>
        </div>
      )}
      {message && <div className="selection-info" role="status">{message}</div>}

      <form onSubmit={handleSubmit} className="subject-form">
        <div className="form-step active-step">
          <h3 className="step-header">
            <span className="step-number">1</span>
            <FaSchool /> Select Department
          </h3>
          <div className="form-group">
            <label htmlFor="department">Department Name</label>
            <select
              id="department"
              value={departmentId}
              onChange={handleDepartmentChange}
              className="form-control"
              required
              disabled={loadingDepartments}
            >
              <option value="">{loadingDepartments ? 'Loading departments...' : '-- Select Department --'}</option>
              {departments.map((dept) => (
                <option key={String(dept._id)} value={String(dept._id)}>
                  {dept.departName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`form-step ${!departmentId ? 'disabled-step' : 'active-step'}`}>
          <h3 className="step-header">
            <span className="step-number">2</span>
            <FaBook /> Enter Subjects for {currentDeptName}
          </h3>
          <div className="subjects-grid-2col">
            {['subject1', 'subject2', 'subject3', 'subject4', 'subject5', 'subject6'].map((subject, index) => (
              <div key={subject} className="form-group subject-input-item">
                <label htmlFor={subject}>Subject {index + 1} Name</label>
                <input
                  type="text"
                  id={subject}
                  name={subject}
                  value={subjects[subject]}
                  onChange={handleSubjectChange}
                  placeholder={`e.g., Data Structures`}
                  className="form-control"
                  required
                  disabled={!departmentId}
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={!departmentId || loading || loadingDepartments}
        >
          {loading ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {loading ? 'Registering Subjects...' : 'Register Subjects'}
        </button>
      </form>
    </div>
  );
};

export default SubjectRegistration;
