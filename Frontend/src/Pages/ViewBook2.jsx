import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaBookOpen, FaUser, FaTag, FaInfoCircle, FaTrash, FaSpinner, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import '../CSS/viewbooks.css';

const DeleteBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null); 
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:7000/viewbook", {
                withCredentials: true,
            });
            
            if (response.data.book) {
                setBooks(response.data.book);
            } else {
                setBooks([]); 
            }
        } catch (err) {
            console.error("Error fetching books for deletion:", err);
            setError("Failed to fetch book catalog. Check server connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDelete = async (bookId, bookName) => {
        if (!window.confirm(`Are you sure you want to permanently delete the book: "${bookName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(bookId);
        const token = Cookies.get("emtoken"); 

        if (!token || token === 'undefined') {
            alert("Authorization failed. Please log in as an admin.");
            setDeletingId(null);
            return;
        }

        try {
            const response = await axios.delete(
                `http://localhost:7000/deletebook/${bookId}`, 
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200 || response.data.success) {
                alert(`Book "${bookName}" deleted successfully!`);
                setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
            } else {
                alert(`Failed to delete book: ${response.data.msg || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error while deleting book:", err);
            alert(`Failed to delete book: ${err.response?.data?.msg || err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="book-view-containere">
                <div className="state-messagee loading-statee"><FaSpinner className="spinnere" /> Loading book catalog for deletion...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="book-view-containere">
                <div className="state-messagee error-statee"><FaExclamationTriangle /> {error}</div>
            </div>
        );
    }
    
    return (
        <div className="book-view-containere">
            <h1 className="page-titlee delete-page-titlee"><FaTrash className="title-icone" /> Delete Books Management</h1>

            {books.length === 0 ? (
                <div className="state-messagee no-datae">
                    <p>The catalog is empty. No books to delete.</p>
                </div>
            ) : (
                <div className="book-gride">
                    {books.map((book) => {
                        const isDeleting = deletingId === book._id;
                        
                        return (
                            <div className="book-carde delete-carde" key={book._id}>
                                <div className="card-image-boxe">
                                    <img 
                                        src={`http://localhost:7000/images/${book.image}`} 
                                        alt={book.bookName} 
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }} 
                                    />
                                    <span className="status-badgee check-mark-tage">
                                            <FaCheckCircle /> Listede
                                    </span>
                                </div>
                                
                                <div className="card-contente">
                                    <h3 className="book-namee">{book.bookName}</h3>
                                    
                                    <p className="book-authore"><FaUser /> {book.author}</p>
                                    <p className="book-categorye"><FaTag /> {book.category}</p>

                                    <div className="book-descriptione">
                                        <FaInfoCircle />
                                        <p className="pe">{book.description ? book.description.substring(0, 100) + '...' : 'No description provided.'}</p>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(book._id, book.bookName)} 
                                        disabled={isDeleting} 
                                        className="delete-buttone"
                                    >
                                        {isDeleting ? <FaSpinner className="spinnere" /> : <FaTrash />} 
                                        {isDeleting ? "Deleting..." : "Delete Permanentlye"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeleteBooks;