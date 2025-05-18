import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import './MyTickets.css';

const MyTickets = () => {
  const { user } = useAuth();
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('http://localhost:5000/api/registration/my-tickets', {
          withCredentials: true
        });
        
        if (response.data.success) {
          setMyTickets(response.data.registrations);
        } else {
          setError('Failed to fetch tickets');
        }
      } catch (err) {
        console.error('Error fetching my tickets:', err);
        setError(err.response?.data?.error || 'An error occurred while fetching tickets');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const handleUnattend = async (registrationId) => {
    try {
      setCancelling(registrationId);
      
      const response = await axios.delete(`http://localhost:5000/api/registration/unattend/${registrationId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Remove the cancelled ticket from the list
        setMyTickets(prev => prev.filter(ticket => ticket.registrationId !== registrationId));
      } else {
        setError('Failed to cancel registration');
      }
    } catch (err) {
      console.error('Error cancelling registration:', err);
      setError(err.response?.data?.error || 'An error occurred while cancelling registration');
    } finally {
      setCancelling(null);
    }
  };

  if (!user) {
    return (
      <div className="myTickets-app-container">
        <Navbar />
        <div className="myTickets-page">
          <div className="myTickets-page-content">
            <div className="myTickets-auth-message">
              <div className="myTickets-auth-card">
                <h2>Please log in to view your tickets</h2>
                <Link to="/login" className="myTickets-btn myTickets-btn-primary">Log In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="myTickets-app-container">
      <Navbar />
      <div className="myTickets-page">
        <div className="myTickets-page-content">
          <div className="myTickets-dashboard-header">
            <h1>My Tickets</h1>
          </div>
          
          {loading ? (
            <div className="myTickets-loader-container">
              <div className="myTickets-loader"></div>
              <p>Loading your tickets...</p>
            </div>
          ) : error ? (
            <div className="myTickets-error-container">
              <div className="myTickets-error-icon">!</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="myTickets-btn myTickets-btn-secondary">
                Try Again
              </button>
            </div>
          ) : myTickets.length === 0 ? (
            <div className="myTickets-empty-state">
              <div className="myTickets-empty-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" stroke="#5d35f0" fill="none">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </div>
              <h2>You haven't registered for any events yet</h2>
              <p>Browse events and register to see your tickets here</p>
              <Link to="/" className="myTickets-btn myTickets-btn-primary">Browse Events</Link>
            </div>
          ) : (
            <div className="myTickets-list">
              {myTickets.map(ticket => (
                <div key={ticket.registrationId} className="myTickets-ticket-card">
                  <div className="myTickets-ticket-header">
                    <img 
                      src={ticket.event.featuredImage || 'https://via.placeholder.com/150'} 
                      alt={ticket.event.title} 
                      className="myTickets-event-image"
                    />
                    <div className="myTickets-event-info">
                      <div className="myTickets-event-title-row">
                        <h2>{ticket.event.title}</h2>
                        <span className={`myTickets-status-badge myTickets-payment-${ticket.paymentStatus}`}>
                          {ticket.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="myTickets-event-meta">
                        <div className="myTickets-meta-item">
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>
                            {new Date(ticket.event.startDate).toLocaleDateString()} - {new Date(ticket.event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="myTickets-meta-item">
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{ticket.event.venue}, {ticket.event.city}</span>
                        </div>
                      </div>
                      
                      <div className="myTickets-ticket-details">
                        <div className="myTickets-ticket-detail">
                          <span className="myTickets-detail-label">Ticket Type:</span>
                          <span className="myTickets-detail-value">
                            {ticket.ticketType} {ticket.isVIP && <span className="myTickets-vip-badge">VIP</span>}
                          </span>
                        </div>
                        <div className="myTickets-ticket-detail">
                          <span className="myTickets-detail-label">Quantity:</span>
                          <span className="myTickets-detail-value">{ticket.quantity}</span>
                        </div>
                        <div className="myTickets-ticket-detail">
                          <span className="myTickets-detail-label">Ticket Number:</span>
                          <span className="myTickets-detail-value myTickets-ticket-number">{ticket.ticketNumber || 'Not assigned yet'}</span>
                        </div>
                        <div className="myTickets-ticket-detail">
                          <span className="myTickets-detail-label">Purchase Date:</span>
                          <span className="myTickets-detail-value">{new Date(ticket.registeredAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="myTickets-ticket-actions">
                        <Link to={`/event/${ticket.event._id}`} className="myTickets-btn myTickets-btn-outline">
                          View Event
                        </Link>
                        {ticket.paymentStatus !== 'cancelled' && (
                          <button 
                            className="myTickets-btn myTickets-btn-danger"
                            onClick={() => handleUnattend(ticket.registrationId)}
                            disabled={cancelling === ticket.registrationId}
                          >
                            {cancelling === ticket.registrationId ? 'Cancelling...' : 'Cancel Registration'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;