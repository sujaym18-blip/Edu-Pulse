import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus, faBuilding, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../CSS/viewdept.css';

const BASE_URL = "http://localhost:7000";

const ViewDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  let navigate = useNavigate();

  const fetchDepartmentData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}/viewdepartment`);
      if (Array.isArray(response.data.dept)) {
        setDepartments(response.data.dept);
      } else {
        setDepartments([]);
        setError("Invalid data format received from server.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch department data. Check server connection.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  const deleteDepartment = async (mongoId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    try {
      const originalDepartments = departments;
      setDepartments(departments.filter(d => d._id !== mongoId));

      const response = await axios.delete(`${BASE_URL}/deletedepartment/${mongoId}`);

      if (response.status !== 200) {
         setDepartments(originalDepartments);
         setError("Failed to delete department. Server error.");
      }
      setError(""); 
    } catch (err) {
      console.error("Delete Error:", err);
      setError("Failed to delete department. Network error or permission issue.");
    }
  };

  const handleUpdateClick = (mongoId) => {
    navigate(`/UpdateDepartment/${mongoId}`);
  };

  return (
    <div className="admin-page__containerz">
      <div className="admin-page__headerz">
        <h2 className="admin-page__titlez">
            <FontAwesomeIcon icon={faBuilding} className="admin-page__iconz" />
            Department Directory
        </h2>
        <button 
          className="admin-page__button--primaryz" 
          onClick={() => navigate('/DeptRegistration')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Department
        </button>
      </div>

      {(loading || error) && (
        <div className={`admin-page__messagez ${error ? 'errorz' : 'loadingz'}`}>
          {loading && "Loading Department Data..."}
          {error && `Error: ${error}`}
        </div>
      )}

      {!loading && !error && (
        <>
          {departments.length === 0 ? (
            <div className="admin-page__message--emptyz">
                <FontAwesomeIcon icon={faInfoCircle} /> No departments registered in the system.
            </div>
          ) : (
            <>
              <p className="admin-page__subtitlez">Total Active Departments: {departments.length}</p>
              <div className="department-grid__containerz">
                {departments.map((department) => (
                  <div key={department._id} className="department-card__itemz">
                    <div className="department-card__contentz">
                        <h3 className="department-card__namez">{department.departName}</h3>
                        <p className="department-card__idz">ID: {department.departId}</p>
                        <p className="department-card__descriptionz">{department.departDescription || "No description provided."}</p>
                    </div>

                    <div className="department-card__actionsz">
                        <button 
                            className="department-card__button--updatez" 
                            onClick={() => handleUpdateClick(department._id)}
                            title="Edit Department"
                        >
                            <FontAwesomeIcon icon={faEdit} /> Update
                        </button>
                        <button 
                            className="department-card__button--deletez" 
                            onClick={() => deleteDepartment(department._id)}
                            title="Delete Department"
                        >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ViewDepartment;