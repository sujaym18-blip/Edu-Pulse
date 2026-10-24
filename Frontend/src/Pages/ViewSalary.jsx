import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus, faMoneyCheckAlt, faSpinner, faTable } from '@fortawesome/free-solid-svg-icons';
import '../CSS/viewsal.css';

const BASE_URL = "http://localhost:7000";

const ViewSalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  let navigate = useNavigate();

  const fetchSalaryData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}/salaryview`);
      setSalaries(response.data.salary);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch salary data. Check server connection.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalaryData();
  }, [fetchSalaryData]);

  const deleteSalary = async (mongoId) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) {
      return;
    }
    try {
      const response = await axios.delete(`${BASE_URL}/salarydelete/${mongoId}`);
      if (response.status === 200) {
        setSalaries(salaries.filter(salary => salary._id !== mongoId));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete salary record. Please try again.");
    }
  };

  const handleUpdateClick = (mongoId) => {
    navigate(`/UpdateSalary/${mongoId}`);
  };

  const handleAddSalaryClick = () => {
    navigate('/SalaryRegister');
  };

  const calculateNetSalary = (basic, allowance, deduction) => {
    return (
      (parseFloat(basic || 0) + parseFloat(allowance || 0) - parseFloat(deduction || 0))
    ).toFixed(2);
  };

  return (
    <div className="admin-page__containert">
      <div className="admin-page__headert">
        <h2 className="admin-page__titlet">
            <FontAwesomeIcon icon={faMoneyCheckAlt} className="admin-page__icont" />
            Salary Payment Register
        </h2>
        <button className="admin-page__button--primaryt" onClick={handleAddSalaryClick}>
          <FontAwesomeIcon icon={faPlus} /> Record New Salary
        </button>
      </div>

      {(loading || error) && (
        <div className={`message__bart ${error ? 'message__bar--errort' : 'message__bar--loadingt'}`}>
          {loading ? (
            <span><FontAwesomeIcon icon={faSpinner} spin /> Loading Salary Data...</span>
          ) : (
            error
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="salary-table__wrapert">
          <div className="salary-table__infot">
            <FontAwesomeIcon icon={faTable} /> Showing {salaries.length} Records
          </div>
          
          {salaries.length === 0 ? (
            <div className="message__bar--empty-listt">
              No salary records found. Click "Record New Salary" to start.
            </div>
          ) : (
            <div className="table__responsive-areat">
              <table className="salary__table--styledt">
                <thead>
                  <tr>
                    <th className="header__employeet">Employee</th>
                    <th className="header__departmentt">Department</th>
                    <th className="header__salaryt">Basic (₹)</th>
                    <th className="header__allowancet">Allowance (₹)</th>
                    <th className="header__deductiont">Deduction (₹)</th>
                    <th className="header__nett">Net Salary (₹)</th>
                    <th className="header__paydatet">Pay Date</th>
                    <th className="header__actionst action--centert">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((salary) => (
                    <tr key={salary._id}>
                      <td data-label="Employee" className="data__employeet">{salary.employee}</td>
                      <td data-label="Department" className="data__departmentt">{salary.department}</td>
                      <td data-label="Basic Salary" className="data__amountt">{parseFloat(salary.basicsalary).toLocaleString('en-IN')}</td>
                      <td data-label="Allowance" className="data__amountt data__amount--allowancet">{parseFloat(salary.allowance).toLocaleString('en-IN')}</td>
                      <td data-label="Deduction" className="data__amountt data__amount--deductiont">{parseFloat(salary.deduction).toLocaleString('en-IN')}</td>
                      <td data-label="Net Salary" className="data__amountt data__amount--nett">
                        {calculateNetSalary(salary.basicsalary, salary.allowance, salary.deduction).toLocaleString('en-IN')}
                      </td>
                      <td data-label="Pay Date" className="data__datet">{new Date(salary.paydate).toLocaleDateString()}</td>
                      <td data-label="Actions" className="data__actionst">
                        <button className="action__button--updatet" onClick={() => handleUpdateClick(salary._id)} title="Update Record">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="action__button--deletet" onClick={() => deleteSalary(salary._id)} title="Delete Record">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewSalary;