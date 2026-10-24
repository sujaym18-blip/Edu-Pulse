import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBook, FaIdCard, FaUser, FaSortNumericUp, FaTag, FaFileImage, FaPlusCircle, FaRegFileAlt, FaSpinner, FaFilePdf } from 'react-icons/fa';
import '../CSS/addbook.css'; 

const AddBook = () => {
    const [formData, setFormData] = useState({
        bookId: "",
        bookName: "",
        author: "",
        quantity: "",
        description: "",
        category: "",
        image: null,
        bookFile: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        if (e.target.name === "image" || e.target.name === "bookFile") {
            const file = e.target.files[0] || null;
            if (e.target.name === "bookFile" && file
                && (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf"))) {
                setError("Please select a PDF file for online reading.");
                setFormData(previous => ({ ...previous, bookFile: null }));
                e.target.value = "";
                return;
            }
            if (e.target.name === "bookFile" && file && file.size > 25 * 1024 * 1024) {
                setError("The book PDF must be 25 MB or smaller.");
                setFormData(previous => ({ ...previous, bookFile: null }));
                e.target.value = "";
                return;
            }
            setError("");
            setFormData(previous => ({ ...previous, [e.target.name]: file }));
        } else {
            setFormData(previous => ({ ...previous, [e.target.name]: e.target.value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const data = new FormData();
            for (const [key, value] of Object.entries(formData)) {
                if (value !== null) data.append(key, value);
            }
             
            const response = await axios.post("http://localhost:7000/addbook", data, {
                 withCredentials: true,
            });

            if (response.status === 201) {
                setFormData({ bookId: "", bookName: "", author: "", quantity: "", description: "", category: "", image: null, bookFile: null });
                navigate("/Dashboard"); 
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Error while adding the book! Please check server.");
        } finally {
            setLoading(false);
        }
    };

    const imagePreviewUrl = formData.image ? URL.createObjectURL(formData.image) : null;

    return (
        <div className="add-book-page">
            <div className="form-container">
                
                <h1 className="form-title">
                    <FaBook className="title-icon" /> Add New Book
                </h1>

                {error && <p className="status-message error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="book-form">
                    
                    <div className="form-grid">
                        
                        <div className="form-field">
                            <label htmlFor="bookId"><FaIdCard /> Book ID</label>
                            <input type="text" id="bookId" name="bookId" placeholder="Unique Book ID" value={formData.bookId} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="bookName"><FaBook /> Book Name</label>
                            <input type="text" id="bookName" name="bookName" placeholder="e.g., The Secret Garden" value={formData.bookName} onChange={handleChange} required />
                        </div>

                        <div className="form-field">
                            <label htmlFor="author"><FaUser /> Author</label>
                            <input type="text" id="author" name="author" placeholder="Author's Name" value={formData.author} onChange={handleChange} required />
                        </div>

                        <div className="form-field">
                            <label htmlFor="category"><FaTag /> Category</label>
                            <input type="text" id="category" name="category" placeholder="e.g., Fiction, Science" value={formData.category} onChange={handleChange} required />
                        </div>
                        <div className="form-field book-quantity-field">
                            <label htmlFor="quantity"><FaSortNumericUp /> Quantity</label>
                            <input type="number" id="quantity" name="quantity" placeholder="Available Quantity" value={formData.quantity} onChange={handleChange} required min="1" />
                        </div>

                        <div className="form-field book-reading-file-field">
                            <label htmlFor="bookFile"><FaFilePdf /> Reading File (PDF)</label>
                            <div className="book-file-picker">
                                <input type="file" id="bookFile" name="bookFile" accept=".pdf,application/pdf" onChange={handleChange} />
                                <label className="book-file-picker-button" htmlFor="bookFile">Choose PDF</label>
                                <span className="book-file-name" title={formData.bookFile?.name || "No PDF selected"}>
                                    {formData.bookFile ? formData.bookFile.name : "No PDF selected"}
                                </span>
                            </div>
                        </div>

                        <div className="form-field book-cover-field">
                            <label htmlFor="image"><FaFileImage /> Book Image (Cover)</label>
                            <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} />
                            {imagePreviewUrl ? (
                                <div className="image-preview">
                                    <img src={imagePreviewUrl} alt="Book Cover Preview" />
                                </div>
                            ) : (
                                <div className="image-placeholder">No Image Selected</div>
                            )}
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="description"><FaRegFileAlt /> Description</label>
                            <textarea id="description" name="description" placeholder="Brief summary of the book..." value={formData.description} onChange={handleChange} rows="4"></textarea>
                        </div>

                    </div>

                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? (
                            <> <FaSpinner className="spinner" /> Adding Book...</>
                        ) : (
                            <> <FaPlusCircle /> Add Book </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBook;