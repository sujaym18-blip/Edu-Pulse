import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/addroutes.css'; 
import { FaBus, FaPlus, FaTimes, FaClock, FaCalendarAlt } from 'react-icons/fa';

function AddRoutes() {
  const [formData, setFormData] = useState({
    routeNumber: '',
    startTime: '',
    endTime: '',
    stops: [{ stopName: '', arrivalTime: '', departureTime: '' }]
  });
  const [routes, setRoutes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setError('');
    setMessage('');
  };

  const handleStopChange = (e, index) => {
    const { name, value } = e.target;
    const updatedStops = [...formData.stops];
    updatedStops[index][name] = value;
    setFormData(prevData => ({
      ...prevData,
      stops: updatedStops
    }));
    setError('');
    setMessage('');
  };

  const addStop = () => {
    if (formData.stops.length < 10) {
      setFormData(prevData => ({
        ...prevData,
        stops: [...prevData.stops, { stopName: '', arrivalTime: '', departureTime: '' }]
      }));
    } else {
      setError('You can only add up to 10 stops per route.');
    }
  };

  const removeStop = (index) => {
    if (formData.stops.length > 1) {
      const updatedStops = formData.stops.filter((_, i) => i !== index);
      setFormData(prevData => ({ ...prevData, stops: updatedStops }));
      setError('');
    } else {
      setError('A route must have at least one stop.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!formData.routeNumber || !formData.startTime || !formData.endTime) {
        setError('Please fill out the main route details.');
        setLoading(false);
        return;
    }

    try {
      const response = await axios.post('http://localhost:7000/addroute', formData, {
   
         withCredentials: true, 
      });
      
      if (response.status === 200) {
        setMessage(`Route ${formData.routeNumber} added successfully!`);
        setRoutes([...routes, formData]);
        

        setFormData({
          routeNumber: '',
          startTime: '',
          endTime: '',
          stops: [{ stopName: '', arrivalTime: '', departureTime: '' }]
        });
      }
    } catch (error) {
      console.error('Error submitting the route:', error);
      setError('Failed to add route. Server error or duplicate route number.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="routes-page-container">
      <div className="route-form-card">
        <h1 className="page-title"><FaBus className="title-icon" /> Add New Bus Route</h1>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section-header">Route Information</div>
          <div className="route-details-group">
            <div className="input-group">
              <label htmlFor="routeNumber">Route Number:</label>
              <input
                type="text"
                id="routeNumber"
                name="routeNumber"
                value={formData.routeNumber}
                onChange={handleChange}
                placeholder="E.g., R001"
                required
              />
            </div>
            <div className="input-group time-group">
                <label htmlFor="startTime">Start Time (<FaClock/>):</label>
                <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="input-group time-group">
                <label htmlFor="endTime">End Time (<FaClock/>):</label>
                <input
                    type="time" 
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                />
            </div>
          </div>

          <div className="form-section-header stop-header">Route Stops ({formData.stops.length})</div>
          
          <div className="stops-list">
            {formData.stops.map((stop, index) => (
              <div key={index} className="stop-item-card">
                <h4 className="stop-title">Stop {index + 1}</h4>
                
                {formData.stops.length > 1 && (
                    <button 
                        type="button" 
                        onClick={() => removeStop(index)}
                        className="remove-stop-button"
                        title="Remove Stop"
                    >
                        <FaTimes />
                    </button>
                )}

                <div className="stop-inputs-group">
                    <div className="input-group full-width">
                        <label>Stop Name:</label>
                        <input
                            type="text"
                            name="stopName"
                            value={stop.stopName}
                            onChange={(e) => handleStopChange(e, index)}
                            placeholder="e.g., Main Square"
                            required
                        />
                    </div>
                    <div className="input-group time-group">
                        <label>Arrival Time:</label>
                        <input
                            type="time"
                            name="arrivalTime"
                            value={stop.arrivalTime}
                            onChange={(e) => handleStopChange(e, index)}
                            required
                        />
                    </div>
                    <div className="input-group time-group">
                        <label>Departure Time:</label>
                        <input
                            type="time"
                            name="departureTime"
                            value={stop.departureTime}
                            onChange={(e) => handleStopChange(e, index)}
                            required
                        />
                    </div>
                </div>
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addStop} className="add-stop-button">
            <FaPlus /> Add Another Stop
          </button>
          
          <button type="submit" className="submit-route-button" disabled={loading}>
            {loading ? 'Adding Route...' : 'Confirm and Add Route'}
          </button>
        </form>
      </div>

      <div className="routes-list-card">
        <h2 className="list-title"><FaCalendarAlt /> Recently Added Routes</h2>
        <div className="route-list">
            {routes.length === 0 ? (
                <p className="no-routes-found">No routes added in this session.</p>
            ) : (
                <ul>
                    {routes.map((route, index) => (
                        <li key={index} className="listed-route-item">
                            <h4 className="listed-route-number">Route: {route.routeNumber}</h4>
                            <p className="listed-route-time">
                                **{route.startTime}** to **{route.endTime}**
                            </p>
                            <span className="listed-stop-count">{route.stops.length} Stops</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
}

export default AddRoutes;