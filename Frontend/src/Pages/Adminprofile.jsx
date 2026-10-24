import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    FaBuilding, FaCamera, FaCity, FaEnvelope, FaPhone, FaSpinner, FaUserCircle,
} from 'react-icons/fa';
import '../CSS/adminprofile.css';

const API_URL = 'http://localhost:7000';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const AdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [retryToken, setRetryToken] = useState(0);
    const imageInput = useRef(null);

    useEffect(() => {
        if (!selectedImage) {
            setImagePreviewUrl('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(selectedImage);
        setImagePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    useEffect(() => {
        let active = true;
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_URL}/adminprofile`, { withCredentials: true });
                if (!response.data.success || !response.data.profile) {
                    throw new Error(response.data.msg || 'Unable to load your profile.');
                }
                if (active) setProfile(response.data.profile);
            } catch (fetchError) {
                console.error('Error fetching admin profile:', fetchError);
                if (active) {
                    setError(fetchError.response?.data?.msg || 'Unable to load your profile. Please try again.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchProfile();
        return () => { active = false; };
    }, [retryToken]);

    const handleImageSelection = event => {
        const file = event.target.files?.[0] || null;
        setError('');
        setMessage('');
        if (!file) {
            setSelectedImage(null);
            return;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError('Choose a JPG, PNG, or WEBP image.');
            event.target.value = '';
            setSelectedImage(null);
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setError('The profile image must be 5 MB or smaller.');
            event.target.value = '';
            setSelectedImage(null);
            return;
        }
        setSelectedImage(file);
    };

    const uploadImage = async event => {
        event.preventDefault();
        if (!selectedImage) return;

        setUploading(true);
        setError('');
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            const response = await axios.put(`${API_URL}/adminprofile/image`, formData, {
                withCredentials: true,
            });
            if (!response.data.success || !response.data.profile) {
                throw new Error(response.data.msg || 'Unable to save profile image.');
            }
            setProfile(response.data.profile);
            setSelectedImage(null);
            if (imageInput.current) imageInput.current.value = '';
            setMessage(response.data.msg || 'Profile image updated successfully.');
        } catch (uploadError) {
            console.error('Error uploading admin profile image:', uploadError);
            setError(uploadError.response?.data?.msg || 'Unable to upload profile image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <main className="admin-profile-page">
                <div className="admin-profile-state" role="status">
                    <FaSpinner className="admin-profile-spinner" />
                    <p>Loading admin profile...</p>
                </div>
            </main>
        );
    }

    if (error && !profile) {
        return (
            <main className="admin-profile-page">
                <div className="admin-profile-state admin-profile-error" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={() => setRetryToken(token => token + 1)}>Try again</button>
                </div>
            </main>
        );
    }

    if (!profile) return null;

    return (
        <main className="admin-profile-page">
            <article className="admin-profile-card">
                <header className="admin-profile-header">
                    <div className="admin-profile-avatar">
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Selected admin profile preview" />
                        ) : profile.image ? (
                            <img src={`${API_URL}/images/${encodeURIComponent(profile.image)}`} alt="Admin profile" />
                        ) : (
                            <FaUserCircle aria-hidden="true" />
                        )}
                        <button
                            type="button"
                            className="admin-profile-camera"
                            onClick={() => imageInput.current?.click()}
                            aria-label="Choose a profile image"
                        >
                            <FaCamera aria-hidden="true" />
                        </button>
                    </div>
                    <h1>{profile.organization || 'Admin Profile'}</h1>
                    <p>System Administrator</p>
                    <form className="admin-profile-upload" onSubmit={uploadImage}>
                        <input
                            ref={imageInput}
                            id="admin-profile-image"
                            name="image"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={handleImageSelection}
                            aria-label="Select profile image"
                        />
                        <button
                            type="button"
                            className="admin-profile-choose-button"
                            onClick={() => imageInput.current?.click()}
                        >
                            Choose photo
                        </button>
                        <span className="admin-profile-selected-file">
                            {selectedImage?.name || 'JPG, PNG, WEBP · Max 5 MB'}
                        </span>
                        <button type="submit" className="admin-profile-save-button" disabled={!selectedImage || uploading}>
                            {uploading ? <><FaSpinner className="admin-profile-spinner" /> Saving...</> : 'Save photo'}
                        </button>
                    </form>
                </header>

                {(error || message) && (
                    <div className={`admin-profile-notice ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>
                        {error || message}
                    </div>
                )}

                <section className="admin-profile-details" aria-label="Profile details">
                    <div className="admin-profile-detail">
                        <FaEnvelope aria-hidden="true" />
                        <span>Email</span>
                        <strong>{profile.email || 'Not provided'}</strong>
                    </div>
                    <div className="admin-profile-detail">
                        <FaPhone aria-hidden="true" />
                        <span>Contact</span>
                        <strong>{profile.contact || 'Not provided'}</strong>
                    </div>
                    <div className="admin-profile-detail">
                        <FaBuilding aria-hidden="true" />
                        <span>Organization</span>
                        <strong>{profile.organization || 'Not provided'}</strong>
                    </div>
                    <div className="admin-profile-detail">
                        <FaCity aria-hidden="true" />
                        <span>City</span>
                        <strong>{profile.city || 'Not provided'}</strong>
                    </div>
                </section>
            </article>
        </main>
    );
};

export default AdminProfile;
