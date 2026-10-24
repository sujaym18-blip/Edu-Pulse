import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewStudentTransportDetails = () => {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentTransportDetails = async () => {
      try {
        const response = await axios.get('http://localhost:7000/viewstudenttransport');
        setStudentData(response.data.data); 
        setLoading(false);
      } catch (err) {
        setError('Error fetching student transport details');
        setLoading(false);
      }
    };

    fetchStudentTransportDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>All Student Transport Details</h1>
      {studentData.length === 0 ? (
        <p>No student transport details available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student Age</th>
              <th>Roll No</th>
              <th>Grade</th>
              <th>Contact Number</th>
              <th>Parent Name</th>
              <th>Assigned Route</th>
              <th>Assigned Stop</th>
              <th>Arrival Time</th>
              <th>Departure Time</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <tr key={student._id}>
                <td>{student.studentName}</td>
                <td>{student.studentAge}</td>
                <td>{student.rollNo}</td>
                <td>{student.grade}</td>
                <td>{student.contactNumber}</td>
                <td>{student.parentName}</td>
                <td>{student.assignedRoute}</td>
                <td>{student.assignedStop}</td>
                <td>{student.arrivalTime}</td>
                <td>{student.departureTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewStudentTransportDetails;
