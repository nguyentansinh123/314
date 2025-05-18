import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import './MyEvent.css';

const MyEvent = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [attendees, setAttendees] = useState({});
  const [loadingAttendees, setLoadingAttendees] = useState({});

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('http://localhost:5000/api/event/my-events', {
          withCredentials: true
        });
        
        if (response.data.success) {
          setMyEvents(response.data.data);
        } else {
          setError('Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching my events:', err);
        setError(err.response?.data?.error || 'An error occurred while fetching events');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchAttendees = async (eventId) => {
    try {
      setLoadingAttendees(prev => ({ ...prev, [eventId]: true }));
      
      const response = await axios.get(`http://localhost:5000/api/registration/my-event-attendees/${eventId}`, {
        withCredentials: true 
      });
      
      if (response.data.success) {
        setAttendees(prev => ({ 
          ...prev, 
          [eventId]: response.data.attendees 
        }));
      } else {
        setError('Failed to fetch attendees');
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setError(err.response?.data?.error || 'An error occurred while fetching attendees');
    } finally {
      setLoadingAttendees(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const toggleEventDetails = (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
      if (!attendees[eventId]) {
        fetchAttendees(eventId);
      }
    }
  };

  // Main render content
  const renderContent = () => {
    // Show a login message if user is not authenticated
    if (!user) {
      return (
        <div className="myEvents-page-content">
          <div className="myEvents-auth-message">
            <div className="myEvents-auth-card">
              <h2>Please log in to view your events</h2>
              <Link to="/login" className="myEvents-btn myEvents-btn-primary">Log In</Link>
            </div>
          </div>
        </div>
      );
    }

    // Hide this page from regular users
    if (user && user.role === 'user') {
      return (
        <div className="myEvents-page-content">
          <div className="myEvents-auth-message">
            <div className="myEvents-auth-card">
              <h2>This page is only accessible to organizers and admins</h2>
              <Link to="/" className="myEvents-btn myEvents-btn-secondary">Return to Home</Link>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="myEvents-page-content">
          <div className="myEvents-loader-container">
            <div className="myEvents-loader"></div>
            <p>Loading your events...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="myEvents-page-content">
          <div className="myEvents-error-container">
            <div className="myEvents-error-icon">!</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="myEvents-btn myEvents-btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (myEvents.length === 0) {
      return (
        <div className="myEvents-page-content">
          <div className="myEvents-empty-state">
            <div className="myEvents-empty-icon">
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="#5d35f0" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h2>You haven't created any events yet</h2>
            <p>Get started by creating your first event</p>
            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <Link to="/create-event" className="myEvents-btn myEvents-btn-primary">Create Your First Event</Link>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="myEvents-page-content">
        <div className="myEvents-dashboard-header">
          <h1>My Events</h1>
          <Link to="/create-event" className="myEvents-btn myEvents-btn-primary">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Event
          </Link>
        </div>
        
        <div className="myEvents-stats">
          <div className="myEvents-stat-card">
            <div className="myEvents-stat-value">{myEvents.length}</div>
            <div className="myEvents-stat-label">Total Events</div>
          </div>
          <div className="myEvents-stat-card">
            <div className="myEvents-stat-value">
              {myEvents.filter(event => event.status === 'published').length}
            </div>
            <div className="myEvents-stat-label">Published</div>
          </div>
          <div className="myEvents-stat-card">
            <div className="myEvents-stat-value">
              {myEvents.filter(event => event.status === 'draft').length}
            </div>
            <div className="myEvents-stat-label">Drafts</div>
          </div>
          <div className="myEvents-stat-card">
            <div className="myEvents-stat-value">
              {myEvents.reduce((total, event) => total + event.registrationCount, 0)}
            </div>
            <div className="myEvents-stat-label">Total Registrations</div>
          </div>
        </div>
        
        <div className="myEvents-list">
          {myEvents.map(event => (
            <div key={event._id} className="myEvents-event-card">
              <div className="myEvents-event-header">
                <img 
                  src={event.images.find(img => img.isFeatured)?.url || 'https://via.placeholder.com/150'} 
                  alt={event.title} 
                  className="myEvents-event-image"
                />
                <div className="myEvents-event-info">
                  <div className="myEvents-event-title-row">
                    <h2>{event.title}</h2>
                    <span className={`myEvents-status-badge myEvents-status-${event.status}`}>{event.status}</span>
                  </div>
                  
                  <div className="myEvents-event-meta">
                    <div className="myEvents-meta-item">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="myEvents-meta-item">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{event.location.venue}, {event.location.address.city}</span>
                    </div>
                    <div className="myEvents-meta-item">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 010 7.75"></path>
                      </svg>
                      <span>{event.registrationCount} Attendees</span>
                    </div>
                  </div>
                  
                  <div className="myEvents-event-actions">
                    <Link to={`/event/${event._id}`} className="myEvents-btn myEvents-btn-outline">
                      View Event
                    </Link>
                    <Link to={`/edit-event/${event._id}`} className="myEvents-btn myEvents-btn-outline">
                      Edit Event
                    </Link>
                    <button 
                      className={`myEvents-btn ${expandedEventId === event._id ? 'myEvents-btn-secondary' : 'myEvents-btn-primary'}`}
                      onClick={() => toggleEventDetails(event._id)}
                    >
                      {expandedEventId === event._id ? 'Hide Attendees' : 'View Attendees'}
                    </button>
                  </div>
                </div>
              </div>
              
              {expandedEventId === event._id && (
                <div className="myEvents-attendees-section">
                  <h3>Event Attendees</h3>
                  {loadingAttendees[event._id] ? (
                    <div className="myEvents-attendees-loading">
                      <div className="myEvents-loader small"></div>
                      <p>Loading attendee information...</p>
                    </div>
                  ) : attendees[event._id]?.length > 0 ? (
                    <div className="myEvents-table-responsive">
                      <table className="myEvents-attendees-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Ticket Type</th>
                            <th>Quantity</th>
                            <th>Ticket Number</th>
                            <th>Payment Status</th>
                            <th>Registration Date</th>
                            <th>VIP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendees[event._id].map(attendee => (
                            <tr key={attendee.registrationId}>
                              <td>{attendee.user.name}</td>
                              <td>{attendee.user.email}</td>
                              <td>{attendee.ticketType}</td>
                              <td>{attendee.quantity}</td>
                              <td>{attendee.ticketNumber || 'Not assigned'}</td>
                              <td>
                                <span className={`myEvents-payment-badge myEvents-payment-${attendee.paymentStatus}`}>
                                  {attendee.paymentStatus}
                                </span>
                              </td>
                              <td>{new Date(attendee.registeredAt).toLocaleDateString()}</td>
                              <td>{attendee.isVIP ? 
                                <span className="myEvents-vip-badge">VIP</span> : 
                                <span className="myEvents-standard-badge">Standard</span>
                              }</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="myEvents-empty-attendees">
                      <svg viewBox="0 0 24 24" width="48" height="48" stroke="#999" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 010 7.75"></path>
                      </svg>
                      <p>No one has registered for this event yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="myEvents-app-container">
      <Navbar />
      <div className="myEvents-page">
        {renderContent()}
      </div>
    </div>
  );
};

export default MyEvent;