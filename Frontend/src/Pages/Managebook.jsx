import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSyncAlt,
  FaUndoAlt,
  FaBook,
  FaRegCalendarAlt,
  FaClock
} from 'react-icons/fa';
import '../CSS/Managebook.css';

const Managebook = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReturning, setIsReturning] = useState(null);

  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:7000';
  const IMAGE_BASE_URL = 'http://localhost:7000';

  const calculateDaysIssued = (issueDate) => {
    const today = new Date();
    const issued = new Date(issueDate);
    const diff = Math.ceil((today - issued) / (1000 * 60 * 60 * 24));
    return diff;
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  const fetchIssuedBooks = async () => {
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/issued`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      setIssuedBooks(res.data?.books || []);
    } catch (err) {
      setError('Failed to load issued books');
      setIssuedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (bookId) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;

    setIsReturning(bookId);
    try {
      const token = Cookies.get('token');

      await axios.post(
        `${API_BASE_URL}/returnbook`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      setIssuedBooks(prev => prev.filter(b => (b.bookId || b._id) !== bookId));
    } catch (err) {
      alert('Return failed');
    } finally {
      setIsReturning(null);
    }
  };

  if (loading) {
    return (
      <div className="status-box status-loading">
        <FaSpinner className="spin" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-box status-error">
        <FaExclamationTriangle /> {error}
      </div>
    );
  }

  if (issuedBooks.length === 0) {
    return (
      <div className="status-box status-info">
        <FaInfoCircle /> No active issued books
      </div>
    );
  }

  return (
    <div className="manage-book-container">
      <header className="page-header">
        <h1 className="main-heading">
          <FaBook /> Active Book Issue Management
        </h1>
        <p className="sub-heading">
          Track issued books with images, titles and overdue status
        </p>
      </header>

      <button className="action-btn secondary-btn" onClick={fetchIssuedBooks}>
        <FaSyncAlt /> Refresh
      </button>

      <table className="institutional-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Book</th>
            <th>Student</th>
            <th><FaRegCalendarAlt /> Days</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {issuedBooks.map((book) => {
            const bookTitle = book.bookName;
            const imageFilename = book.image || book.imageUrl;
            const bookId = book.bookId || book._id;
            const days = calculateDaysIssued(book.date);
            const overdue = days > 14;

            return (
              <tr key={bookId} className={overdue ? 'overdue-row' : ''}>
                <td>
                  {imageFilename ? (
                    <img
                      src={`${IMAGE_BASE_URL}/${imageFilename}`}
                      alt={bookTitle}
                      title={bookTitle}
                      className="book-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <FaBook size={30} title="No image" />
                  )}
                </td>

                <td>
                  <strong>{bookTitle}</strong>
                  <div>ID: {bookId}</div>
                </td>

                <td>{book.studentName || 'N/A'}</td>

                <td className={overdue ? 'overdue-days' : ''}>
                  {days} Days {overdue && <FaClock />}
                </td>

                <td>
                  <button
                    className="action-btn primary-btn"
                    onClick={() => handleReturn(bookId)}
                    disabled={isReturning === bookId}
                  >
                    {isReturning === bookId ? <FaSpinner className="spin" /> : <FaUndoAlt />}
                    Return
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Managebook;
