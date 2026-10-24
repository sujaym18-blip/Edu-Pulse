import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../CSS/RoomManagement.css';

const RoomAvailabilityComponent = () => {
  const [singleRooms, setSingleRooms] = useState('');
  const [doubleRooms, setDoubleRooms] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    axios.get('http://localhost:7000/viewroom', { withCredentials: true })
      .then(({ data }) => {
        if (!active) return;
        const room = data.room?.[0];
        setSingleRooms(String(room?.singleRooms ?? 0));
        setDoubleRooms(String(room?.doubleRooms ?? 0));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.msg || 'Unable to load room availability.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const singleRoomCount = Number(singleRooms);
    const doubleRoomCount = Number(doubleRooms);

    if (
      singleRooms === '' || doubleRooms === '' ||
      !Number.isInteger(singleRoomCount) || singleRoomCount < 0 ||
      !Number.isInteger(doubleRoomCount) || doubleRoomCount < 0
    ) {
      setError('Enter a non-negative whole number for each room type.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await axios.post(
        'http://localhost:7000/addroom',
        { singleRooms: singleRoomCount, doubleRooms: doubleRoomCount },
        { withCredentials: true }
      );
      setMessage('Room availability updated successfully.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to save room availability.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="room-management-page">
      <section className="room-management-card">
        <header className="room-management-header">
          <div>
            <span className="room-management-eyebrow">HOSTEL MANAGEMENT</span>
            <h1>Room availability</h1>
            <p>Set the total capacity available for single and double rooms.</p>
          </div>
          <Link className="room-management-back" to="/Dashboard">Back to dashboard</Link>
        </header>

        {loading && <p className="room-management-state">Loading room availability...</p>}
        {error && <p className="room-management-alert room-management-alert-error" role="alert">{error}</p>}
        {message && <p className="room-management-alert room-management-alert-success" role="status">{message}</p>}

        <form className="room-management-form" onSubmit={handleSubmit}>
          <label className="room-management-field">
            <span>Single rooms</span>
            <small>Capacity for one student per room</small>
            <input
              type="number"
              value={singleRooms}
              onChange={(e) => setSingleRooms(e.target.value)}
              placeholder="e.g. 40"
              min="0"
              step="1"
              required
              disabled={loading || saving}
            />
          </label>

          <label className="room-management-field">
            <span>Double rooms</span>
            <small>Capacity for two students per room</small>
            <input
              type="number"
              value={doubleRooms}
              onChange={(e) => setDoubleRooms(e.target.value)}
              placeholder="e.g. 24"
              min="0"
              step="1"
              required
              disabled={loading || saving}
            />
          </label>

          <div className="room-management-actions">
            <button type="submit" disabled={loading || saving}>
              {saving ? 'Saving changes...' : 'Save availability'}
            </button>
            <Link to="/Viewroom">View room availability</Link>
          </div>
        </form>
      </section>
    </main>
  );
};

export default RoomAvailabilityComponent;
