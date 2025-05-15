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
  
  const handleBuyTicket = () => {
    if (!selectedTicket) {
      setError('Please select a ticket type');
      return;
    }
    
    const orderDetails = {
      eventId: event._id,
      eventName: event.title,
      ticketType: selectedTicket.name,
      ticketTypeId: selectedTicket._id,
      price: selectedTicket.price,
      quantity: quantity,
      total: selectedTicket.price * quantity,
      currency: "USD"
    };
    
    if (selectedTicket.isVIP) {
      orderDetails.extras = [];
      
      if (selectedSeat) {
        orderDetails.extras.push(`Seat: ${selectedSeat}`);
      }
      
      if (selectedFood) {
        orderDetails.extras.push(`Food: ${selectedFood}`);
      }
    }
    
    navigate('/payment', { state: { orderDetails } });
  };
  
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
                            <li>Priority seating with seat selection</li>
                            <li>Complimentary food item</li>
                            <li>Express entry</li>
                            <li>Exclusive merchandise</li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <h4 className="benefits-title">Standard Benefits:</h4>
                          <ul className="benefits-list">
                            <li>General admission entry</li>
                            <li>Standard seating (first come, first served)</li>
                          </ul>
                        </>
                      )}
                    </div>
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
            </>
          )}
        </div>
        
        <div className="event-content">
          <h2>About this event</h2>
          <p>{event.description}</p>
          
          {event.tags && event.tags.length > 0 && (
            <div className="event-tags">
              <h3>Tags</h3>
              <div className="tags-container">
                {event.tags.map((tag, index) => (
                  <span key={index} className="event-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {event.status === 'published' && selectedTicket && selectedTicket.isVIP && (
          <div className="seat-selection-container">
            <h3>VIP Benefits</h3>
            
            <div className="vip-benefits">
              <div className="seating-chart">
                <h4>Select Your Seat</h4>
                <div className="screen">STAGE</div>
                <div className="seats">
                  <div className="seat-row">
                    {['A1', 'A2', 'A3', 'A4'].map(seat => (
                      <div 
                        key={seat}
                        className={`seat ${selectedSeat === seat ? 'selected' : 'available'}`}
                        onClick={() => handleSeatSelection(seat)}
                      >
                        {seat}
                      </div>
                    ))}
                  </div>
                  <div className="seat-row">
                    {['B1', 'B2', 'B3', 'B4'].map(seat => (
                      <div 
                        key={seat}
                        className={`seat ${selectedSeat === seat ? 'selected' : Math.random() > 0.7 ? 'reserved' : 'available'}`}
                        onClick={() => handleSeatSelection(seat)}
                      >
                        {seat}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="legend">
                  <div className="legend-item">
                    <div className="seat-sample available"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat-sample reserved"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat-sample selected"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
              
              <div className="vip-food-options">
                <h4>Choose Your Free Food</h4>
                <div className="food-dropdown">
                  <select 
                    className="food-select"
                    value={selectedFood}
                    onChange={(e) => setSelectedFood(e.target.value)}
                  >
                    <option value="">Choose Your Free Food</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Popcorn">Popcorn</option>
                    <option value="Nachos">Nachos</option>
                    <option value="Sandwich">Sandwich</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {event.status === 'published' ? (
          <div className="event-actions">
            <button 
              className="buy-btn" 
              onClick={handleBuyTicket}
              disabled={!selectedTicket || selectedTicket.sold >= selectedTicket.quantity}
            >
              {selectedTicket && selectedTicket.sold >= selectedTicket.quantity ? (
                'Sold Out'
              ) : (
                <>
                  <span>Get Tickets</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="event-status-banner">
            <div className={`status-badge status-${event.status}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke={event.status === 'draft' ? '#f59e0b' : event.status === 'cancelled' ? '#ef4444' : event.status === 'completed' ? '#3b82f6' : '#10b981'} fill="none">
                {event.status === 'published' && (
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                )}
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
              {event.status === 'draft' && 'Draft'}
              {event.status === 'cancelled' && 'Cancelled'}
              {event.status === 'completed' && 'Completed'}
            </div>
            {event.status === 'cancelled' && event.cancellationReason && (
              <p className="cancellation-reason">
                Reason: {event.cancellationReason}
              </p>
            )}
          </div>
        )}
        
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
              <button className="publish-event-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Publish Event
              </button>
            )}
            
            {event.status === 'published' && (
              <button className="cancel-event-btn">
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
      </div>
    </div>
  );
};

export default SinglePage;