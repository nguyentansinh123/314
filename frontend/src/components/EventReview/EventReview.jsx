import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import './EventReview.css';

const EventReview = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { eventName, eventImage } = location.state || {};
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/review-event/${eventId}` } });
      return;
    }
    
    // Check if user has already reviewed this event
    const checkExistingReview = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/review/event/${eventId}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          const userReview = response.data.reviews.find(
            review => review.user._id === user._id
          );
          
          if (userReview) {
            setExistingReview(userReview);
            setRating(userReview.rating);
            setTitle(userReview.title || '');
            setComment(userReview.comment || '');
          }
        }
      } catch (error) {
        console.error("Error checking existing review:", error);
      }
    };
    
    if (eventId && user) {
      checkExistingReview();
    }
  }, [eventId, user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const reviewData = {
        event: eventId,
        rating,
        title,
        comment,
        userId: user._id
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/review',
        reviewData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSuccess(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        
        // Redirect after a delay
        setTimeout(() => {
          navigate(`/event/${eventId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error.response?.data?.error || 'An error occurred while submitting your review');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${i <= (hoverRating || rating) ? 'active' : ''}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill={i <= (hoverRating || rating) ? '#FFD700' : 'none'} stroke={i <= (hoverRating || rating) ? '#FFD700' : '#CBD5E0'}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      );
    }
    
    return stars;
  };
  
  return (
    <div className="review-page-container">
      <Navbar />
      
      <div className="review-content">
        <div className="event-preview">
          {eventImage && (
            <img 
              src={eventImage} 
              alt={eventName || "Event"} 
              className="event-preview-img" 
            />
          )}
          <div className="event-preview-info">
            <h2>{eventName || "Event Review"}</h2>
          </div>
        </div>
        
        <div className="review-form-container">
          <h1>{existingReview ? 'Update Your Review' : 'Write a Review'}</h1>
          
          <form onSubmit={handleSubmit} className="review-form">
            <div className="rating-container">
              <label>Your Rating</label>
              <div className="star-rating">
                {renderStars()}
              </div>
              <div className="rating-text">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="review-title">Review Title</label>
              <input
                type="text"
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience (optional)"
                maxLength="100"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="review-comment">Your Review</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience at this event..."
                rows="6"
              ></textarea>
            </div>
            
            {error && (
              <div className="review-error-message">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="#ef4444" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="review-success-message">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="#10b981" fill="none">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{success}</span>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-review-btn"
                onClick={() => navigate(`/event/${eventId}`)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-review-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="button-loader"></span>
                ) : existingReview ? (
                  'Update Review'
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventReview;