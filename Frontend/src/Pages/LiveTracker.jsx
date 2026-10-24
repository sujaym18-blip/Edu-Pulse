import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import '../CSS/tracker.css'; 
import L from 'leaflet';
import { FaMapMarkerAlt, FaLocationArrow, FaSpinner, FaTimesCircle, FaCheckCircle, FaSatelliteDish } from 'react-icons/fa';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const LiveTracker = () => {
    const [position, setPosition] = useState({ lat: 27.55, lng: 76.6 }); 
    const [locationStatus, setLocationStatus] = useState("Waiting for GPS data...");
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus("Error: Geolocation is not supported by your browser.");
            return;
        }

        const success = (pos) => {
            const newPos = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
            setPosition(newPos);
            setLocationStatus("Location updated successfully!");
            setZoom(17); 
        };

        const error = (err) => {
            setLocationStatus(`Error (${err.code}): ${err.message}. Please enable location services.`);
        };

        const watchId = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const getStatusIcon = (status) => {
        if (status.includes('Error')) return <FaTimesCircle />;
        if (status.includes('updated')) return <FaCheckCircle />;
        if (status.includes('Waiting') || status.includes('data')) return <FaSpinner className="spin" />;
        return <FaLocationArrow />;
    };

    const getStatusBarClass = (status) => {
        if (status.includes('Error')) return 'error';
        if (status.includes('updated')) return 'success';
        return 'info';
    };

    return (
        <div className="tracker-container">
            <header className="tracker-header">
                <FaSatelliteDish className="header-icon" />
                <h1>Live Location Monitor</h1>
                <p className={`status-bar ${getStatusBarClass(locationStatus)}`}>
                    {getStatusIcon(locationStatus)} {locationStatus}
                </p>
            </header>
            
            <div className="map-wrapper">
                 
                <MapContainer 
                    center={position} 
                    zoom={zoom} 
                    scrollWheelZoom={true}
                    className="leaflet-map-host"
                >
                    <ChangeView center={position} zoom={zoom} /> 
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright"></a> '
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            <div className="popup-content">
                                <h3>Current Coordinates</h3>
                                <p>Lat: {position.lat.toFixed(5)}</p>
                                <p>Lng: {position.lng.toFixed(5)}</p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
            
            <div className="location-info-footer">
                <div className="coordinate-box lat-box">
                    <FaMapMarkerAlt />
                    <span className="label">Latitude</span>
                    <strong>{position.lat.toFixed(5)}</strong>
                </div>
                <div className="coordinate-box lng-box">
                    <FaMapMarkerAlt />
                    <span className="label">Longitude</span>
                    <strong>{position.lng.toFixed(5)}</strong>
                </div>
            </div>
        </div>
    );
};

export default LiveTracker;