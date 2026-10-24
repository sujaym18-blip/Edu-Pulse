import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBookOpen, FaUser, FaTag, FaBookmark, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../CSS/viewbooks.css'; 

const ViewBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [issuingBookId, setIssuingBookId] = useState(null);
    const [error, setError] = useState(null);
    const [issueMessage, setIssueMessage] = useState(null);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:7000/viewbook", {
                withCredentials: true,
            });
            if (response.data.book) {
                const processedBooks = response.data.book.map(book => ({
                    ...book,
                    status: book.status ? book.status.toLowerCase() : 'unknown'
                }));
                setBooks(processedBooks);
            } else {
                setBooks([]); 
            }
        } catch {
            setError("Failed to fetch books. Please check server connection or authentication.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleIssue = async (bookId) => {
        setIssuingBookId(bookId);
        setIssueMessage(null);

        try {
            const response = await axios.post(
                `http://localhost:7000/issuebook`,
                { bookId: bookId },
                { withCredentials: true }
            );
            setIssueMessage({ type: 'success', text: response.data.msg || "Book issued successfully." });
            await fetchBooks();
        } catch (err) {
            setIssueMessage({
                type: 'error',
                text: err.response?.data?.msg || err.response?.data?.message || err.message || "Failed to issue book.",
            });
        } finally {
            setIssuingBookId(null);
        }
    };

    if (loading) {
        return (
            <div className="book-view-containere">
                <div className="state-messagee loading-statee"><FaSpinner className="spinnere" /> Loading book catalog...</div>
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
            <h1 className="page-titlee"><FaBookOpen className="title-icone" /> Featured Books</h1>
            {issueMessage && (
                <div className={`state-messagee ${issueMessage.type === 'error' ? 'error-statee' : 'no-datae'}`} role="status">
                    {issueMessage.type === 'error' && <FaExclamationTriangle />}
                    {issueMessage.text}
                </div>
            )}

            {books.length === 0 ? (
                <div className="state-messagee no-datae">
                    <p>No books are available in the library right now.</p>
                </div>
            ) : (
                <div className="book-gride"> 
                    {books.map((book) => {
                        const isAvailable = book.status && book.status.toLowerCase() === "available";
                        
                        return (
                            <div className={`book-carde ${book.bookFile ? 'has-reading-filee' : ''}`} key={book._id}>
                                <div className="card-image-boxe">
                                    <img 
                                        src={`http://localhost:7000/images/${book.image}`} 
                                        alt={book.bookName} 
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }} 
                                    />
                                    <span className={`status-badgee ${isAvailable ? 'availablee' : 'issuede'}`}>
                                        {book.status}
                                    </span>
                                </div>
                                
                                <div className="card-contente">
                                    <h3 className="book-namee">{book.bookName}</h3>
                                    
                                    <p className="book-authore"><FaUser /> {book.author}</p>
                                    
                                    <p className="book-categorye"><FaTag /> {book.category}</p>

                                    
                                    {book.bookFile && (
                                        <a
                                            href={`http://localhost:7000/readbook/${encodeURIComponent(book._id)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="read-book-buttone"
                                        >
                                            <FaBookOpen /> Read Book
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => handleIssue(book._id)} 
                                        disabled={!isAvailable || issuingBookId !== null} 
                                        className={`issue-buttone ${!isAvailable || issuingBookId !== null ? 'disabled-buttone' : ''}`}
                                    >
                                        {issuingBookId === book._id ? <FaSpinner className="spinnere" /> : <FaBookmark />} 
                                        {issuingBookId === book._id ? "Issuing..." : isAvailable ? "Issue Booke" : "Issued Oute"}
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

export default ViewBooks;