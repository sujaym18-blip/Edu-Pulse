import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faChevronLeft, faSpinner, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import '../CSS/update.css';

const BASE_URL = 'http://localhost:7000';

const UpdateSalary = () => {
  const { salaryId } = useParams();
  const navigate = useNavigate();
  const [salary, setSalary] = useState({
    basicsalary: "",
    allowance: "",
    deduction: "",
    paydate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const fetchSalaryData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}/viewbyidsal/${salaryId}`);
      const salaryData = response.data.salary;

      if (!salaryData) {
        throw new Error("Data structure missing 'salary' object.");
      }
      
      setSalary({
        basicsalary: salaryData.basicsalary || "",
        allowance: salaryData.allowance || "",
        deduction: salaryData.deduction || "",
        paydate: salaryData.paydate ? new Date(salaryData.paydate).toISOString().split('T')[0] : '',
      });
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch salary data for update. Check ID or server connection.");
      setLoading(false);
    }
  }, [salaryId]);

  useEffect(() => {
    fetchSalaryData();
  }, [fetchSalaryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalary((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: 'loading', text: 'Saving changes...' });
    setError("");

    try {
      const response = await axios.put(
        `${BASE_URL}/salaryupdate/${salaryId}`,
        salary
      );
      if (response.status === 200) {
        setSubmitMessage({ type: 'success', text: 'Record updated successfully!' });
        setTimeout(() => {
          navigate("/ViewSal");
        }, 1500);
      }
    } catch (err) {
      console.error("Update Error:", err);
      const errorText = err.response?.data?.msg || 'Failed to update salary record.';
      setSubmitMessage({ type: 'error', text: errorText });
    }
  };
  
  const netSalary = (
    parseFloat(salary.basicsalary || 0) +
    parseFloat(salary.allowance || 0) -
    parseFloat(salary.deduction || 0)
  ).toFixed(2);


  return (
    <div className="update-page__containeru">
      <div className="update-card__wrapu">
        <header className="update-card__headeru">
          <h1 className="update-card__titleu">
            <FontAwesomeIcon icon={faEdit} className="title__iconu" />
            Update Salary Record
          </h1>
          <button
            className="header__back-buttonu"
            onClick={() => navigate(-1)} 
            title="Go Back"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
        </header>

        {(loading || error || submitMessage.text) && (
          <div className={`message__baru message__bar--${error ? 'erroru' : submitMessage.type}`}>
            {loading ? (
              <span><FontAwesomeIcon icon={faSpinner} spin /> Fetching data...</span>
            ) : error ? (
              error
            ) : (
              submitMessage.text
            )}
          </div>
        )}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="update-formu">
            
            <div className="form-sectionu form-section--financesu">
                <div className="form-groupu">
                    <label className="form-labelu">Basic Salary (₹)</label>
                    <input
                      type="number"
                      name="basicsalary"
                      value={salary.basicsalary}
                      onChange={handleInputChange}
                      className="form-inputu"
                      required
                      min="0"
                      step="0.01"
                    />
                </div>
                <div className="form-groupu">
                    <label className="form-labelu">Allowance (₹)</label>
                    <input
                      type="number"
                      name="allowance"
                      value={salary.allowance}
                      onChange={handleInputChange}
                      className="form-inputu"
                      min="0"
                      step="0.01"
                    />
                </div>
                <div className="form-groupu">
                    <label className="form-labelu">Deduction (₹)</label>
                    <input
                      type="number"
                      name="deduction"
                      value={salary.deduction}
                      onChange={handleInputChange}
                      className="form-inputu"
                      min="0"
                      step="0.01"
                    />
                </div>
            </div>

            <div className="form-sectionu form-section--summaryu">
              <div className="form-groupu">
                  <label className="form-labelu">Payment Date</label>
                  <input
                    type="date"
                    name="paydate"
                    value={salary.paydate}
                    onChange={handleInputChange}
                    className="form-inputu"
                    required
                  />
              </div>

              <div className="net-salary__displayu">
                <span className="net-salary__labelu"><FontAwesomeIcon icon={faMoneyBillWave} /> Net Payable (Calculated):</span>
                <span className="net-salary__valueu">₹ {netSalary}</span>
              </div>
            </div>
            
            <div className="form-actionu">
              <button type="submit" className="form-button__submitu" disabled={submitMessage.type === 'loading'}>
                <FontAwesomeIcon icon={faSave} /> 
                {submitMessage.type === 'loading' ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateSalary;