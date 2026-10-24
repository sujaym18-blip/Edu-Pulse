import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../CSS/RoomManagement.css';

const Viewroom = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        axios.get('http://localhost:7000/viewroom', { withCredentials: true })
            .then(({ data }) => {
                if (active) setRooms(data.room || []);
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

    return (
        <main className="room-management-page">
            <section className="room-management-card room-management-view">
                <header className="room-management-header">
                    <div>
                        <span className="room-management-eyebrow">HOSTEL MANAGEMENT</span>
                        <h1>Room availability</h1>
                        <p>Review the room capacity currently configured for your hostel.</p>
                    </div>
                    <Link className="room-management-primary-link" to="/addroom">Update availability</Link>
                </header>

                {loading && <p className="room-management-state">Loading room availability...</p>}
                {error && <p className="room-management-alert room-management-alert-error" role="alert">{error}</p>}
                {!loading && !error && rooms.length === 0 && (
                    <div className="room-management-empty">
                        <h2>No room availability yet</h2>
                        <p>Add your hostel room capacity to make the current availability visible here.</p>
                        <Link className="room-management-primary-link" to="/addroom">Add room availability</Link>
                    </div>
                )}
                {!loading && !error && rooms.length > 0 && (
                    <div className="room-management-table-wrap">
                        <table className="room-management-table">
                            <thead>
                                <tr>
                                    <th>Room type</th>
                                    <th>Capacity</th>
                                    <th>Occupancy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => (
                                    <Fragment key={room._id}>
                                        <tr>
                                            <td><span className="room-type-name">Single rooms</span><small>One student per room</small></td>
                                            <td><span className="room-capacity">{room.singleRooms}</span></td>
                                            <td><span className="room-status">Capacity configured</span></td>
                                        </tr>
                                        <tr>
                                            <td><span className="room-type-name">Double rooms</span><small>Two students per room</small></td>
                                            <td><span className="room-capacity">{room.doubleRooms}</span></td>
                                            <td><span className="room-status">Capacity configured</span></td>
                                        </tr>
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                        <p className="room-management-note">These numbers show total configured capacity, not current occupancy.</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default Viewroom;
