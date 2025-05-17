import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './SinglePage.css';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';

const SinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedFood, setSelectedFood] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const url = `http://localhost:5000/api/event/${id}`;
        const response = await axios.get(url, { withCredentials: true });
        
        console.log("API Response:", response.data);
        
        if (response.data.success) {
          setEvent(response.data.data);
          console.log("Event data loaded:", response.data.data);
          
          if (response.data.data.ticketTypes && response.data.data.ticketTypes.length > 0) {
            console.log("Available ticket types:", response.data.data.ticketTypes);
            setSelectedTicket({...response.data.data.ticketTypes[0]});
            console.log("Selected first ticket:", response.data.data.ticketTypes[0]);
          } else {
            console.log("No ticket types found in event data");
          }
        } else {
          setError('Failed to load event details');
          console.error("API returned error:", response.data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('An error occurred while loading the event');
      } finally {
        setLoading(false);
      }
    };
    
    console.log("Fetching event with ID:", id);
    fetchEvent();
  }, [id]);
  
  const checkRegistrationStatus = async () => {
    if (!user || !event) return;
    
    try {
      setLoading(true);
      
      const response = await axios.get(
        `http://localhost:5000/api/user/my-registrations`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const isRegistered = response.data.registrations.some(
          reg => reg.event._id === event._id
        );
        
        console.log("Registration check for event:", event._id);
        console.log("User already registered:", isRegistered);
        
        setIsAlreadyRegistered(isRegistered);
        
        // If already registered, show success message
        if (isRegistered) {
          console.log("User is already registered for this event");
          // Optional: show a temporary success message
          setSuccessMessage('You are already registered for this event!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
      // Don't show error to user for this background check
    } finally {
      setLoading(false);
    }
  };

  const loadEventReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/review/event/${id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  useEffect(() => {
    if (user && event) {
      checkRegistrationStatus();
    }
  }, [user, event]);

  useEffect(() => {
    if (event) {
      loadEventReviews();
    }
  }, [event]);
  
  const selectTicket = (ticket) => {
    console.log("User selected ticket:", ticket);
    if (ticket) {
      setSelectedTicket({...ticket});
      setSelectedSeat(null);
      setSelectedFood('');
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };
  
  const handleSeatSelection = (seatNumber) => {
    setSelectedSeat(seatNumber === selectedSeat ? null : seatNumber);
  };
  
  const formatEventDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };
  
  const getEventImage = () => {
    if (!event || !event.images || event.images.length === 0) {
      return "https://via.placeholder.com/800x400?text=No+Image+Available";
    }
    
    const featuredImage = event.images.find(img => img.isFeatured);
    return featuredImage ? featuredImage.url : event.images[0].url;
  };
  
  const handleRegistration = async () => {
    try {
      if (!user) {
        console.log("User not logged in, redirecting to login page");
        navigate('/login', { state: { from: `/event/${id}` } });
        return;
      }
      
      // Check if user is already registered for this event
      if (isAlreadyRegistered) {
        setError('You are already registered for this event.');
        
        // Scroll to error message
        setTimeout(() => {
          const errorElement = document.querySelector('.error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
        return;
      }
      
      if (!selectedTicket) {
        setError('Please select a ticket type');
        return;
      }
  
      setLoading(true);
      
      const registrationData = {
        eventId: event._id,
        ticketTypeId: selectedTicket._id,
        quantity: quantity,
        paymentMethod: 'paypal', 
        userId: user._id
      };
      
      console.log("Registration data being sent:", registrationData);
      
      if (selectedTicket.isVIP) {
        registrationData.extras = [];
        
        if (selectedSeat) {
          registrationData.extras.push(`Seat: ${selectedSeat}`);
        }
        
        if (selectedFood) {
          registrationData.extras.push(`Food: ${selectedFood}`);
        }
      }
      
      // Make API call to register for the event
      const response = await axios.post(
        'http://localhost:5000/api/registration/register',
        registrationData,
        { withCredentials: true }
      );
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        // Registration successful, proceed to payment
        setSuccessMessage('Registration successful! Proceeding to payment...');
        
        const orderDetailsForPayment = {
          eventId: event._id,
          eventName: event.title,
          ticketType: selectedTicket.name,
          ticketTypeId: selectedTicket._id,
          price: selectedTicket.price,
          quantity: quantity,
          total: selectedTicket.price * quantity * 1.05, // Including service fee
          currency: "USD",
          registrationId: response.data.registration._id,
          ticketNumber: response.data.registration.ticketNumber
        };
        
        // Add VIP extras to payment details if applicable
        if (selectedTicket.isVIP) {
          orderDetailsForPayment.extras = [];
          
          if (selectedSeat) {
            orderDetailsForPayment.extras.push(`Seat: ${selectedSeat}`);
          }
          
          if (selectedFood) {
            orderDetailsForPayment.extras.push(`Food: ${selectedFood}`);
          }
        }
        
        // Short delay to show success message before redirecting
        setTimeout(() => {
          navigate('/payment', { state: { orderDetails: orderDetailsForPayment } });
        }, 1500);
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEvent = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        `http://localhost:5000/api/event/publishEvent/${event._id}`,
        { userId: user._id },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Update the local event state with the published event
        setEvent({
          ...event,
          status: 'published'
        });
        setSuccessMessage('Event successfully published!');
        
        // Automatically hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.data.error || 'Failed to publish event');
      }
    } catch (error) {
      console.error('Error publishing event:', error);
      setError(error.response?.data?.error || 'An error occurred while publishing the event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    try {
      if (!cancellationReason.trim()) {
        setError('Please provide a reason for cancellation');
        return;
      }
      
      setLoading(true);
      
      const response = await axios.put(
        `http://localhost:5000/api/event/cancelEvent/${event._id}`,
        { 
          userId: user._id,
          cancellationReason: cancellationReason 
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Update the local event state with the cancelled event
        setEvent({
          ...event,
          status: 'cancelled',
          cancellationReason: cancellationReason
        });
        setSuccessMessage('Event successfully cancelled');
        setShowCancellationModal(false);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.data.error || 'Failed to cancel event');
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      setError(error.response?.data?.error || 'An error occurred while cancelling the event');
    } finally {
      setLoading(false);
    }
  };

  const CancellationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Cancel Event</h3>
        <p>Please provide a reason for cancellation:</p>
        <textarea
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Cancellation reason"
          rows="3"
        ></textarea>
        <div className="modal-actions">
          <button 
            className="cancel-btn"
            onClick={() => setShowCancellationModal(false)}
            disabled={loading}
          >
            Back
          </button>
          <button 
            className="confirm-btn"
            onClick={handleCancelEvent}
            disabled={loading || !cancellationReason.trim()}
          >
            {loading ? <span className="button-loader"></span> : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="single-page-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="single-page-container">
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Event not found'}</p>
          <button className="back-btn" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  console.log("Rendering with event:", event);
  console.log("Selected ticket:", selectedTicket);
  console.log("Rendering ticket types:", event?.ticketTypes);
  
  return (
    <div className="single-page-container">
      <Navbar />
      
      <div className="event-banner-container">
        <div className="event-banner">
          <img 
            src={getEventImage()} 
            alt={event.title}
            className="event-banner-img"
          />
          <div className="event-banner-overlay"></div>
          
          <div className={`event-corner-status status-${event.status}`}>
            {event.status === 'draft' && 'Draft'}
            {event.status === 'published' && 'Active'}
            {event.status === 'cancelled' && 'Cancelled'}
            {event.status === 'completed' && 'Completed'}
          </div>
        </div>
        
        <div className="event-organizer-card">
          <div className="organizer-avatar">
            {event.organizer?.name?.charAt(0) || 'O'}
          </div>
          <div className="organizer-meta">
            <div className="organizer-label">Organized by</div>
            <div className="organizer-name">{event.organizer?.name || 'Unknown Organizer'}</div>
          </div>
        </div>
      </div>
      
      <div className="event-details-card">
        <div className="event-header">
          <h1 className="event-title">{event.title}</h1>
          
          <div className="event-meta">
            {selectedTicket && (
              <span className="event-price-tag">${selectedTicket.price}</span>
            )}
            <span className="event-category-tag">{event.category}</span>
            <span className="event-author">
              By: {event.organizer?.name || 'Unknown Organizer'}
            </span>
          </div>
          
          <div className="event-time-location">
            <div className="event-time">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ff6b35" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatEventDate(event.startDate)}</span>
            </div>
            <div className="event-location">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ff6b35" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{event.location.venue}, {event.location.address.city}</span>
            </div>
          </div>
          
          {(event.status === 'published' || event.status === 'draft') && event.ticketTypes && event.ticketTypes.length > 0 && (
            <>
              <div className="ticket-selection-container">
                <h3 className="ticket-section-title">Select Ticket Type</h3>
                {/* Add direct style to the dropdown to ensure visibility */}
                <div className="ticket-dropdown-wrapper" style={{ position: 'relative', zIndex: 10 }}>
                  <select 
                    className="ticket-dropdown"
                    value={selectedTicket ? selectedTicket._id : ""}
                    onChange={(e) => {
                      const selected = event.ticketTypes.find(ticket => ticket._id === e.target.value);
                      if (selected) selectTicket(selected);
                    }}
                  >
                    <option value="" disabled>Choose a ticket type</option>
                    {event.ticketTypes && event.ticketTypes.map((ticket) => (
                      <option 
                        key={ticket._id} 
                        value={ticket._id}
                        disabled={ticket.sold >= ticket.quantity}
                      >
                        {ticket.name} - ${ticket.price.toFixed(2)} {ticket.isVIP ? "(VIP)" : ""}
                        {ticket.sold >= ticket.quantity ? " (Sold Out)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="dropdown-arrow">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {selectedTicket && (
                  <div className="ticket-description-container">
                    <div className="ticket-header-details">
                      <div className="ticket-name-container">
                        <span className="selected-ticket-name">{selectedTicket.name}</span>
                        {selectedTicket.isVIP && <span className="vip-badge">VIP</span>}
                      </div>
                      <div className="ticket-availability">
                        {selectedTicket.sold >= selectedTicket.quantity ? (
                          <span className="ticket-sold-out">Sold Out</span>
                        ) : (
                          <span className="tickets-remaining">
                            {selectedTicket.quantity - selectedTicket.sold} tickets left
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ticket-price">${selectedTicket.price.toFixed(2)}</div>
                    
                    {selectedTicket.description && (
                      <div className="ticket-description">
                        <h4 className="description-title">Description:</h4>
                        <p>{selectedTicket.description}</p>
                      </div>
                    )}
                    
                    <div className="ticket-benefits">
                      {selectedTicket.isVIP ? (
                        <>
                          <h4 className="benefits-title">VIP Benefits:</h4>
                          <ul className="benefits-list">
                            {selectedTicket.benefits && selectedTicket.benefits.length > 0 ? (
                              selectedTicket.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                              ))
                            ) : (
                              <>
                                <li>Priority seating with seat selection</li>
                                <li>Complimentary food item</li>
                                <li>Express entry</li>
                                <li>Exclusive merchandise</li>
                              </>
                            )}
                          </ul>
                        </>
                      ) : (
                        <>
                          <h4 className="benefits-title">Standard Benefits:</h4>
                          <ul className="benefits-list">
                            {selectedTicket.benefits && selectedTicket.benefits.length > 0 ? (
                              selectedTicket.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                              ))
                            ) : (
                              <>
                                <li>General admission entry</li>
                                <li>Standard seating (first come, first served)</li>
                              </>
                            )}
                          </ul>
                        </>
                      )}
                    </div>

                    {selectedTicket && selectedTicket.isVIP && (
                      <div className="vip-extras-container">
                        <h3 className="ticket-section-title">VIP Extras</h3>
                        
                        <div className="vip-seat-selection">
                          <h4 className="benefits-title">Select your preferred seat:</h4>
                          <div className="seat-grid">
                            {['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'].map(seat => (
                              <button 
                                key={seat}
                                className={`seat-btn ${selectedSeat === seat ? 'selected' : ''}`}
                                onClick={() => handleSeatSelection(seat)}
                              >
                                {seat}
                              </button>
                            ))}
                          </div>
                          {selectedSeat && (
                            <p className="selected-seat-info">You selected seat: {selectedSeat}</p>
                          )}
                        </div>
                        
                        <div className="vip-food-selection">
                          <h4 className="benefits-title">Select complimentary food:</h4>
                          <select
                            value={selectedFood}
                            onChange={(e) => setSelectedFood(e.target.value)}
                            className="food-dropdown"
                          >
                            <option value="">Select a food option</option>
                            <option value="Gourmet Sandwich">Gourmet Sandwich</option>
                            <option value="Vegetarian Wrap">Vegetarian Wrap</option>
                            <option value="Cheese Platter">Cheese Platter</option>
                            <option value="Fruit Bowl">Fruit Bowl</option>
                          </select>
                          {selectedFood && (
                            <p className="selected-food-info">You selected: {selectedFood}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedTicket && (
                <div className="quantity-selection">
                  <h3 className="ticket-section-title">How many tickets?</h3>
                  <div className="quantity-selector-container">
                    <button 
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="quantity-btn quantity-minus"
                      disabled={quantity <= 1}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={handleQuantityChange}
                      min="1" 
                      max={selectedTicket ? (selectedTicket.quantity - selectedTicket.sold) : 1}
                      className="quantity-input"
                    />
                    <button 
                      onClick={() => quantity < (selectedTicket ? (selectedTicket.quantity - selectedTicket.sold) : 10) && setQuantity(quantity + 1)}
                      className="quantity-btn quantity-plus"
                      disabled={quantity >= (selectedTicket ? (selectedTicket.quantity - selectedTicket.sold) : 10)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {selectedTicket && (
                <div className="price-summary">
                  <div className="price-calculation">
                    <div className="price-row ticket-row">
                      <div className="ticket-details">
                        <span className="ticket-name">{selectedTicket.name}</span>
                        {selectedTicket.isVIP && <span className="vip-badge small">VIP</span>}
                      </div>
                      <div className="ticket-price-calc">
                        <span className="ticket-quantity">{quantity} × ${selectedTicket.price.toFixed(2)}</span>
                        <span className="ticket-subtotal">${(selectedTicket.price * quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="fee-row">
                      <span>Service Fee</span>
                      <span>${(selectedTicket.price * quantity * 0.05).toFixed(2)}</span>
                    </div>
                    
                    <div className="total-price">
                      <span>Total</span>
                      <span>${(selectedTicket.price * quantity * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket && (
                <div className="register-button-container">
                  <button 
                    className={`register-btn ${isAlreadyRegistered ? 'already-registered-btn' : ''}`}
                    onClick={handleRegistration}
                    disabled={!selectedTicket || selectedTicket.sold >= selectedTicket.quantity || loading || isAlreadyRegistered}
                  >
                    {loading ? (
                      <span className="button-loader"></span>
                    ) : isAlreadyRegistered ? (
                      <>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#10b981" fill="none">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Already Registered</span>
                      </>
                    ) : selectedTicket && selectedTicket.sold >= selectedTicket.quantity ? (
                      'Sold Out'
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="8.5" cy="7" r="4"/>
                          <line x1="20" y1="8" x2="20" y2="14"/>
                          <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        <span>Register for This Event</span>
                      </>
                    )}
                  </button>
                  
                  {isAlreadyRegistered && (
                    <button 
                      className="view-tickets-btn"
                      onClick={() => navigate('/my-tickets')}
                    >
                      View My Tickets
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="review-section">
          <div className="review-header">
            <h3>Event Reviews</h3>
            <button 
              className="write-review-btn"
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: `/event/${id}` } });
                  return;
                }
                navigate(`/review-event/${event._id}`, { 
                  state: { 
                    eventName: event.title,
                    eventImage: getEventImage(),
                    eventId: event._id
                  } 
                });
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Write a Review
            </button>
          </div>
          <div className="event-reviews-list">
            {reviews.length > 0 ? (
              <>
                <div className="reviews-summary">
                  <div className="average-rating">
                    <span className="rating-number">
                      {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="rating-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg 
                          key={i} 
                          viewBox="0 0 24 24" 
                          width="16" 
                          height="16" 
                          fill={(i + 1) <= Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) ? '#FFD700' : 'none'} 
                          stroke="#FFD700"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </span>
                    <span className="total-reviews">({reviews.length} reviews)</span>
                  </div>
                </div>
              
                {reviews.map(review => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="reviewer-meta">
                          <div className="reviewer-name">{review.user?.name || 'Anonymous'}</div>
                          <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="review-rating">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg 
                            key={i} 
                            viewBox="0 0 24 24" 
                            width="16" 
                            height="16" 
                            fill={(i + 1) <= review.rating ? '#FFD700' : 'none'} 
                            stroke="#FFD700"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.title && <h4 className="review-title">{review.title}</h4>}
                    <p className="review-comment">{review.comment}</p>
                    
                    {review.response && (
                      <div className="review-response">
                        <div className="response-header">
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#5d35f0" fill="none">
                            <polyline points="9 14 4 9 9 4"></polyline>
                            <path d="M20 20v-7a4 4 0 00-4-4H4"></path>
                          </svg>
                          <span>Response from Organizer</span>
                        </div>
                        <p>{review.response.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>

        {/* Always show the registration options */}
        <div className="event-actions">
          {isAlreadyRegistered ? (
            <div className="already-registered">
              <div className="registration-success">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#10b981" fill="none">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>You're registered for this event!</span>
              </div>
              <button 
                className="view-ticket-btn"
                onClick={() => navigate('/my-tickets')}
              >
                View My Ticket
              </button>
            </div>
          ) : (
            <button 
              className="buy-btn" 
              onClick={handleRegistration}
              disabled={!selectedTicket || selectedTicket.sold >= selectedTicket.quantity || loading || event.status !== 'published'}
            >
              {loading ? (
                <span className="button-loader"></span>
              ) : event.status !== 'published' ? (
                'Event Not Published'
              ) : selectedTicket && selectedTicket.sold >= selectedTicket.quantity ? (
                'Sold Out'
              ) : (
                <>
                  <span>Register Now</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          )}
          
          {/* Show event status info if not published */}
          {event.status !== 'published' && (
            <div className="event-status-banner">
              <div className={`status-badge status-${event.status}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke={event.status === 'draft' ? '#f59e0b' : event.status === 'cancelled' ? '#ef4444' : '#3b82f6'} fill="none">
                  {event.status === 'draft' && (
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  )}
                  {event.status === 'cancelled' && (
                    <><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></>
                  )}
                  {event.status === 'completed' && (
                    <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>
                  )}
                </svg>
                <span>
                  {event.status === 'draft' && 'Draft - Not Yet Published'}
                  {event.status === 'cancelled' && 'Cancelled'}
                  {event.status === 'completed' && 'Completed'}
                </span>
              </div>
              {event.status === 'cancelled' && event.cancellationReason && (
                <p className="cancellation-reason">
                  Reason: {event.cancellationReason}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="event-organizer-info">
          <h3>Organized by</h3>
          <div className="organizer-details">
            <div className="organizer-avatar">
              {event.organizer?.name?.charAt(0) || 'O'}
            </div>
            <div className="organizer-meta">
              <div className="organizer-name">{event.organizer?.name || 'Unknown Organizer'}</div>
              {event.organizer?.email && (
                <div className="organizer-contact">{event.organizer.email}</div>
              )}
            </div>
          </div>
        </div>
        
        {user && (user._id === event.organizer?._id || user.role === 'admin') && (
          <div className="event-management-actions">
            <Link to={`/edit-event/${event._id}`} className="edit-event-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Event
            </Link>
            
            {event.status === 'draft' && (
              <button 
                className="publish-event-btn" 
                onClick={handlePublishEvent}
                disabled={loading}
              >
                {loading ? (
                  <span className="button-loader"></span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                      <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Publish Event
                  </>
                )}
              </button>
            )}
            
            {event.status === 'published' && (
              <button 
                className="cancel-event-btn"
                onClick={() => setShowCancellationModal(true)}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Cancel Event
              </button>
            )}
          </div>
        )}

        {showCancellationModal && <CancellationModal />}

        {successMessage && (
          <div className="success-message">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#10b981" fill="none">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ef4444" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePage;