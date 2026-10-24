import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faSave, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import '../CSS/dept.css';

const BASE_URL = 'http://localhost:7000';

const DeptRegistration = () => {
  const [formData, setFormData] = useState({
    departId: '',
    departName: '',
    departDescription: '',
  });
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: 'loading', text: 'Registering Department...' });
    try {
      const response = await axios.post(`${BASE_URL}/adddepartment`, formData);
      if (response.status === 200 || response.status === 201) {
        setSubmitMessage({ type: 'success', text: 'Department registered successfully!' });
        setTimeout(() => {
          navigate('/ViewDepartment');
        }, 1500);
        setFormData({
          departId: '',
          departName: '',
          departDescription: '',
        });
      }
    } catch (err) {
      console.error(err);
      const errorText = err.response?.data?.message || 'Department registration failed due to a server error.';
      setSubmitMessage({ type: 'error', text: errorText });
    }
  };

  return (
    <div className="form-page__containerf">
      <div className="form-card__wrapf">
        <header className="form-card__headerf">
          <h1 className="form-card__titlef">
            <FontAwesomeIcon icon={faBuilding} className="title__iconf" />
            New Department Registration
          </h1>
          <button 
            className="header__back-buttonf"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back to List
          </button>
        </header>

        {submitMessage.text && (
          <div className={`message__barf message__bar--${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="department-formf">
          <div className="form-groupf">
            <label htmlFor="departId" className="form-labelf">Department ID</label>
            <input
              id="departId"
              type="number"
              placeholder="e.g., 101"
              name="departId"
              value={formData.departId}
              onChange={handleChange}
              className="form-inputf"
              required
            />
            <small className="form-helpf">A unique numeric identifier for the department.</small>
          </div>

          <div className="form-groupf">
            <label htmlFor="departName" className="form-labelf">Department Name</label>
            <input
              id="departName"
              type="text"
              placeholder="e.g., Computer Science Engineering"
              name="departName"
              value={formData.departName}
              onChange={handleChange}
              className="form-inputf"
              required
            />
          </div>

          <div className="form-groupf">
            <label htmlFor="departDescription" className="form-labelf">Description / Summary</label>
            <textarea
              id="departDescription"
              placeholder="Brief summary of the department, courses offered, etc."
              name="departDescription"
              value={formData.departDescription}
              onChange={handleChange}
              className="form-inputf form-input--textareaf"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-actionf">
            <button type="submit" className="form-button__submitf" disabled={submitMessage.type === 'loading'}>
              <FontAwesomeIcon icon={faSave} /> 
              {submitMessage.type === 'loading' ? 'Saving...' : 'Register Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeptRegistration;