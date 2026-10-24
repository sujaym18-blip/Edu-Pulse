import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faSave, faChevronLeft, faSpinner, faBuilding } from '@fortawesome/free-solid-svg-icons';
import '../CSS/update.css'; 

const BASE_URL = 'http://localhost:7000';

const UpdateStaff = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    city: "",
    image: "",
    department: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}/viewbyidstaff/${staffId}`);
      const staffData = response.data.staff; 
      setStaff({
        name: staffData.name ,
        email: staffData.email ,
        address: staffData.address ,
        contact: staffData.contact ,
        city: staffData.city ,
        image: staffData.image , 
        department: staffData.department ,
      });

      setLoading(false);
    } catch (err) {
      console.error("Staff Fetch Error:", err);
      setError("Failed to fetch staff data. Check ID or API.");
      setLoading(false);
    }
  }, [staffId]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/viewdepartment`);
      setDepartments(response.data.dept || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      if (!error) setError("Failed to fetch department options."); 
    }
  };

  useEffect(() => {
    fetchStaffData();
    fetchDepartments();
  }, [fetchStaffData]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setStaff((prev) => ({
        ...prev,
        image: files[0], 
      }));
    } else {
      setStaff((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: 'loading', text: 'Saving changes...' });
    setError("");

    try {
      const formDataToSend = new FormData();
      for (let key in staff) {
        if (key === 'image' && typeof staff[key] === 'string' && staff[key] !== '') {
            continue;
        }
        formDataToSend.append(key, staff[key]);
      }

      const response = await axios.put(
        `${BASE_URL}/updatestaff/${staffId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setSubmitMessage({ type: 'success', text: 'Staff updated successfully!' });
        setTimeout(() => {
          navigate("/viewstaff");
        }, 1500);
      }
    } catch (err) {
      console.error("Update Error:", err);
      const errorText = err.response?.data?.msg || 'Failed to update staff record.';
      setSubmitMessage({ type: 'error', text: errorText });
    }
  };

  return (
    <div className="update-page__containeru">
      <div className="update-card__wrapu">
        <header className="update-card__headeru">
          <h1 className="update-card__titleu">
            <FontAwesomeIcon icon={faUserEdit} className="title__iconu" />
            Update Staff Information
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
            
            <div className="form-sectionu form-section--personalu">
                <h3>Personal Details</h3>
                <div className="form-groupu">
                    <label className="form-labelu">Full Name</label>
                    <input type="text" name="name" value={staff.name} onChange={handleInputChange} className="form-inputu" required />
                </div>
                <div className="form-groupu">
                    <label className="form-labelu">Email</label>
                    <input type="email" name="email" value={staff.email} onChange={handleInputChange} className="form-inputu" required />
                </div>
                <div className="form-groupu">
                    <label className="form-labelu">Contact</label>
                    <input type="number" name="contact" value={staff.contact} onChange={handleInputChange} className="form-inputu" />
                </div>
                <div className="form-groupu">
                    <label className="form-labelu">City</label>
                    <input type="text" name="city" value={staff.city} onChange={handleInputChange} className="form-inputu" />
                </div>
            </div>

            <div className="form-sectionu form-section--address-deptu">
                <h3>Location & Department</h3>
                <div className="form-groupu form-group--fullu">
                    <label className="form-labelu">Address</label>
                    <input type="text" name="address" value={staff.address} onChange={handleInputChange} className="form-inputu" />
                </div>


            </div>

            <div className="form-sectionu form-section--imageu">
                <h3>Image Upload</h3>
                {staff.image && typeof staff.image === 'string' && (
                    <div className="image-previewu">
                        <p>Current Image:</p>
                        <img src={`${BASE_URL}/${staff.image}`} alt="Current Staff" className="preview-imageu" />
                    </div>
                )}
                <div className="form-groupu form-group--fullu">
                    <label className="form-labelu">Upload New Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="form-inputu form-input--fileu"
                    />
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

export default UpdateStaff;