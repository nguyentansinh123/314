import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import Navbar from "../Navbar/Navbar";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("");
  const [priceFilter, setPriceFilter] = useState("Any price");
  const [sortBy, setSortBy] = useState("date");
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const priceOptions = [
    { label: "Any price", value: "any" },
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
    { label: "Under $50", value: "under_50" },
    { label: "$50 - $100", value: "50_100" },
    { label: "$100 - $250", value: "100_250" },
    { label: "$250+", value: "250_plus" },
  ];

  const sortOptions = [
    { label: "Date (Soonest)", value: "date" },
    { label: "Price (Low to High)", value: "price_asc" },
    { label: "Price (High to Low)", value: "price_desc" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Popularity", value: "popularity" },
  ];

  const categories = [
    { label: "Type Of Event", value: "" },
    { label: "Conference", value: "conference" },
    { label: "Music Concert", value: "music_concert" },
    { label: "Networking", value: "networking" },
    { label: "Workshop", value: "workshop" },
    { label: "Exhibition", value: "exhibition" },
    { label: "Sports", value: "sports" },
    { label: "Other", value: "other" },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const url = "http://localhost:5000/api/event/public";
      const response = await axios.get(url);

      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        setError("Failed to fetch events");
        loadPlaceholderEvents();
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      loadPlaceholderEvents();
    } finally {
      setLoading(false);
    }
  };

  const loadPlaceholderEvents = () => {
    const placeholderEvents = [
      {
        _id: "1",
        title: "Web Development Conference 2023",
        startDate: new Date("2023-12-15T09:30:00"),
        ticketTypes: [{ price: 199 }],
        category: "conference",
        organizer: { name: "Tech Conferences Inc." },
        location: { venue: "Convention Center" },
        images: [
          {
            url: "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
            isFeatured: true,
          },
        ],
        views: 245,
      },
      {
        _id: "2",
        title: "Digital Marketing Summit",
        startDate: new Date("2023-12-20T10:00:00"),
        ticketTypes: [{ price: 149 }],
        category: "networking",
        organizer: { name: "Marketing Pros" },
        location: { venue: "Grand Hotel" },
        images: [
          {
            url: "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
            isFeatured: true,
          },
        ],
        views: 187,
      },
      {
        _id: "3",
        title: "Tech Festival 2023",
        startDate: new Date("2023-12-25T11:00:00"),
        ticketTypes: [{ price: 399 }],
        category: "exhibition",
        organizer: { name: "Tech Events Co." },
        location: { venue: "Tech Park" },
        images: [
          {
            url: "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
            isFeatured: true,
          },
        ],
        views: 312,
      }
    ];
    
    setEvents(placeholderEvents);
  };

  const filteredEvents = events.filter((event) => {
    const searchMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = !eventType || event.category === eventType;
    let priceMatch = true;
    if (priceFilter !== "Any price") {
      const lowestPrice = Math.min(...event.ticketTypes.map(t => t.price));
      if (priceFilter === "Free") {
        priceMatch = lowestPrice === 0;
      } else if (priceFilter === "Paid") {
        priceMatch = lowestPrice > 0;
      } else if (priceFilter === "Under $50") {
        priceMatch = lowestPrice < 50;
      } else if (priceFilter === "$50 - $100") {
        priceMatch = lowestPrice >= 50 && lowestPrice <= 100;
      } else if (priceFilter === "$100 - $250") {
        priceMatch = lowestPrice > 100 && lowestPrice <= 250;
      } else if (priceFilter === "$250+") {
        priceMatch = lowestPrice > 250;
      }
    }
    
    return searchMatch && categoryMatch && priceMatch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.startDate) - new Date(b.startDate);
      case "price_asc":
        return Math.min(...a.ticketTypes.map(t => t.price)) - Math.min(...b.ticketTypes.map(t => t.price));
      case "price_desc":
        return Math.min(...b.ticketTypes.map(t => t.price)) - Math.min(...a.ticketTypes.map(t => t.price));
      case "name_asc":
        return a.title.localeCompare(b.title);
      case "popularity":
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const formatEventDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const getEventPrice = (event) => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return "Free";
    
    const prices = event.ticketTypes.map(ticket => ticket.price);
    const minPrice = Math.min(...prices);
    
    if (minPrice === 0) return "Free";
    return `$${minPrice}`;
  };

  const getCategoryDisplayName = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const togglePriceDropdown = () => {
    setShowPriceDropdown(!showPriceDropdown);
    setShowFilterDropdown(false);
    setShowSortDropdown(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
    setShowPriceDropdown(false);
    setShowSortDropdown(false);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
    setShowPriceDropdown(false);
    setShowFilterDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowPriceDropdown(false);
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteEvent = (eventId) => {
    setDeletingEventId(eventId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!deletingEventId) return;
    
    try {
      setLoading(true);
      setDeleteError('');
      
      const response = await axios.delete(
        `http://localhost:5000/api/event/deleteEvent/${deletingEventId}`,
        {
          withCredentials: true,
          data: { userId: user._id }
        }
      );
      
      if (response.data.success) {
        setEvents(events.filter(event => event._id !== deletingEventId));
        setDeleteModalOpen(false);
      } else {
        setDeleteError(response.data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeleteError(error.response?.data?.error || 'An error occurred while deleting the event');
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteEvent = () => {
    setDeleteModalOpen(false);
    setDeletingEventId(null);
    setDeleteError('');
  };

  return (
    <div className="home-container">
      <Navbar />

      <section className="hero-section">
        <h1>
          Trust By <br />
          Thousands Of Events
        </h1>

        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                fill="none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <div className="event-type-select">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              aria-label="Event type"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <button className="dropdown-btn" onClick={togglePriceDropdown}>
              {priceFilter}
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                stroke="currentColor"
                fill="none"
              >
                <polyline points={showPriceDropdown ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>
            
            {showPriceDropdown && (
              <div className="dropdown-menu">
                {priceOptions.map((option) => (
                  <div 
                    key={option.value} 
                    className={`dropdown-item ${priceFilter === option.label ? 'active' : ''}`}
                    onClick={() => {
                      setPriceFilter(option.label);
                      setShowPriceDropdown(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <button className="dropdown-btn" onClick={toggleFilterDropdown}>
              Other filters ({eventType || searchTerm || priceFilter !== "Any price" ? '1' : '0'})
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                stroke="currentColor"
                fill="none"
              >
                <polyline points={showFilterDropdown ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>
            
            {showFilterDropdown && (
              <div className="dropdown-menu filter-dropdown">
                <div className="filter-section">
                  <h4>Filters Applied</h4>
                  <div className="filter-tags">
                    {eventType && (
                      <div className="filter-tag">
                        <span>{getCategoryDisplayName(eventType)}</span>
                        <button onClick={() => setEventType("")}>×</button>
                      </div>
                    )}
                    {searchTerm && (
                      <div className="filter-tag">
                        <span>Search: {searchTerm}</span>
                        <button onClick={() => setSearchTerm("")}>×</button>
                      </div>
                    )}
                    {priceFilter !== "Any price" && (
                      <div className="filter-tag">
                        <span>{priceFilter}</span>
                        <button onClick={() => setPriceFilter("Any price")}>×</button>
                      </div>
                    )}
                    {(eventType || searchTerm || priceFilter !== "Any price") && (
                      <button 
                        className="clear-all-btn"
                        onClick={() => {
                          setEventType("");
                          setSearchTerm("");
                          setPriceFilter("Any price");
                          setShowFilterDropdown(false);
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <button className="dropdown-btn" onClick={toggleSortDropdown}>
              Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                stroke="currentColor"
                fill="none"
              >
                <polyline points={showSortDropdown ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>
            
            {showSortDropdown && (
              <div className="dropdown-menu">
                {sortOptions.map((option) => (
                  <div 
                    key={option.value} 
                    className={`dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="home-actions">
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <Link to="/create-event" className="create-event-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create New Event
            </Link>
          )}
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <>
          <div className="results-summary">
            Showing {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>

          {sortedEvents.length === 0 ? (
            <div className="no-events">
              <h2>No events found</h2>
              <p>Try adjusting your search or filters to find events</p>
            </div>
          ) : (
            <section className="events-grid">
              {sortedEvents.map((event) => (
                <div className="event-card-container" key={event._id}>
                  <Link 
                    to={`/event/${event._id}`} 
                    className="event-card" 
                  >
                    <div className="event-image">
                      <img
                        src={
                          (event.images && event.images.length > 0) 
                            ? event.images.find(img => img.isFeatured)?.url || event.images[0].url
                            : "https://via.placeholder.com/300x170?text=EVENT"
                        }
                        alt={event.title}
                      />
                      <button className="save-btn">
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          stroke="currentColor"
                          fill="none"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="event-details">
                      <div className="event-price-category">
                        <span className="event-price">{getEventPrice(event)}</span>
                        <span className="event-category">{getCategoryDisplayName(event.category)}</span>
                      </div>
                      <div className="event-date">{formatEventDate(event.startDate)}</div>
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-location">{event.location.venue}</div>
                      <div className="event-organizer">
                        {event.organizer?.name || 'Organizer'}
                      </div>
                    </div>
                  </Link>
                  
                  {/* Owner actions - only shown if user created this event */}
                  {user && (user._id === event.organizer?._id || user.role === 'admin') && (
                    <div className="event-actions">
                      <Link to={`/edit-event/${event._id}`} className="event-action-btn edit-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteEvent(event._id);
                        }} 
                        className="event-action-btn delete-btn"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  {event.status && event.status !== 'published' && (
                    <div className={`event-status ${event.status}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Delete Event</h2>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            
            {deleteError && <div className="error-message">{deleteError}</div>}
            
            <div className="modal-actions">
              <button 
                onClick={cancelDeleteEvent} 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteEvent} 
                className="delete-confirm-btn"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
