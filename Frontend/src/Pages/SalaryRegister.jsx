import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faSave, faChevronLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../CSS/SalaryR.css';

const BASE_URL = 'http://localhost:7000';

const SalaryRegister = () => {
  const [formData, setFormData] = useState({
    department: '',
    employee: '',
    basicsalary: '',
    allowance: '',
    deduction: '',
    paydate: '',
  });

  const navigate = useNavigate();

  const [dept, setDept] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const fetchDept = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/viewdepartment`);
      setDept(response.data.dept);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch department data.');
    }
  }, []);

  const fetchEmployeesByDept = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/viewstaff`, {
        withCredentials: true,
      });
      setEmployees(response.data.staff);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Unauthorized access, please login.');
        navigate('/login');
      } else {
        setError('Failed to fetch employee data.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDept(), fetchEmployeesByDept()]).finally(() => {
      setLoading(false);
    });
  }, [fetchDept, fetchEmployeesByDept]);

  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setFormData({ ...formData, department: selectedDept });
  };

  const handleEmployeeChange = (e) => {
    const selectedEmployee = employees.find((emp) => emp.name === e.target.value);
    const employeeDepartment = String(selectedEmployee?.department || '').trim().toLowerCase();
    const matchingDepartment = dept.find((d) =>
      [d.departName, d.departId].some(
        (value) => String(value ?? '').trim().toLowerCase() === employeeDepartment
      )
    );

    setFormData((prev) => ({
      ...prev,
      employee: selectedEmployee?.name || '',
      ...(matchingDepartment ? { department: String(matchingDepartment.departId) } : {}),
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: 'loading', text: 'Processing Salary Record...' });
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/salaryregister`, formData);
      if (response.status === 201 || response.status === 200) {
        setSubmitMessage({ type: 'success', text: 'Salary registered successfully!' });
        setFormData({
          department: '',
          employee: '',
          basicsalary: '',
          allowance: '',
          deduction: '',
          paydate: '',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      const errorText = err.response?.data?.message || 'Salary registration failed! Please check input.';
      setSubmitMessage({ type: 'error', text: errorText });
    }
  };

  const netSalary = (
    parseFloat(formData.basicsalary || 0) +
    parseFloat(formData.allowance || 0) -
    parseFloat(formData.deduction || 0)
  ).toFixed(2);

  return (
    <div className="salary-page__containers">
      <div className="salary-card__wraps">
        <header className="salary-card__headers">
          <h1 className="salary-card__titles">
            <FontAwesomeIcon icon={faMoneyBillWave} className="title__icons" />
            New Salary Payment
          </h1>
          <button
            className="header__back-buttons"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
        </header>

        {(loading || error || submitMessage.text) && (
          <div className={`message__bars message__bar--${error ? 'errors' : submitMessage.type}`}>
            {loading ? (
              <span><FontAwesomeIcon icon={faSpinner} spin /> Loading Data...</span>
            ) : error ? (
              error
            ) : (
              submitMessage.text
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="salary-forms">
          <div className="form-sections form-section--selectors">
            <div className="form-groups">
              <label className="form-labels">Select Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleDepartmentChange}
                className="form-inputs"
                required
                disabled={loading}
              >
                <option value="">-- Choose Department --</option>
                {dept.map((d) => (
                  <option key={d._id} value={d.departId}>
                    {d.departName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-groups">
              <label className="form-labels">Select Employee</label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleEmployeeChange}
                className="form-inputs"
                required
                disabled={loading || employees.length === 0}
              >
                <option value="">
                  {loading ? 'Loading Employees...' : employees.length ? '-- Choose Employee --' : '-- No Employees Available --'}
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-sections form-section--finances">
            <div className="form-groups">
              <label className="form-labels">Basic Salary (₹)</label>
              <input
                type="number"
                placeholder="Basic Salary"
                name="basicsalary"
                value={formData.basicsalary}
                onChange={handleChange}
                className="form-inputs"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-groups">
              <label className="form-labels">Allowance (₹)</label>
              <input
                type="number"
                placeholder="Allowance"
                name="allowance"
                value={formData.allowance}
                onChange={handleChange}
                className="form-inputs"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-groups">
              <label className="form-labels">Deduction (₹)</label>
              <input
                type="number"
                placeholder="Deduction"
                name="deduction"
                value={formData.deduction}
                onChange={handleChange}
                className="form-inputs"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-sections form-section--final">
            <div className="form-groups">
              <label className="form-labels">Payment Date</label>
              <input
                type="date"
                name="paydate"
                value={formData.paydate}
                onChange={handleChange}
                className="form-inputs"
                required
              />
            </div>

            <div className="net-salary__displays">
                <span className="net-salary__labell">Net Payable Salary:</span>
                <span className="net-salary__values">₹ {netSalary}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="form-button__submits" disabled={submitMessage.type === 'loading' || loading}>
              <FontAwesomeIcon icon={faSave} />
              {submitMessage.type === 'loading' ? 'Saving Record...' : 'Register Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryRegister;