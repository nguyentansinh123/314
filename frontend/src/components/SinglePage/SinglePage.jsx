import React, { useState } from 'react';
import './SinglePage.css';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

const SinglePage = () => {
  const [selectedTicket, setSelectedTicket] = useState('Standard Ticket');
  const [showTicketDropdown, setShowTicketDropdown] = useState(false);
  const navigate = useNavigate();
  
  const event = {
    id: 1,
    title: "The Even Full Name",
    date: "Fri, Dec 15, 9:30 AM",
    price: "$199",
    vipPrice: "$349",
    category: "Development",
    author: "Author",
    organizer: "Organizer",
    location: "Online",
    image: "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  };

  const toggleTicketDropdown = () => {
    setShowTicketDropdown(!showTicketDropdown);
  };

  const selectTicket = (ticketType) => {
    setSelectedTicket(ticketType);
    setShowTicketDropdown(false);
  };

  const getCurrentPrice = () => {
    return selectedTicket === 'VIP Ticket' ? event.vipPrice : event.price;
  };

  return (
    <div className="single-page-container">
      <Navbar />
      
      <div className="event-banner">
        <img 
          src={event.image} 
          alt={event.title}
          className="event-banner-img"
        />
      </div>
      
      <div className="event-details-card">
        <div className="event-header">
          <h1 className="event-title">{event.title}</h1>
          <div className="event-meta">
            <span className="event-price-tag">{getCurrentPrice()}</span>
            <span className="event-category-tag">{event.category}</span>
            <span className="event-author">By: {event.author} | {event.organizer}</span>
          </div>
          
          <div className="ticket-type-dropdown">
            <button 
              className="ticket-dropdown-btn"
              onClick={toggleTicketDropdown}
              aria-expanded={showTicketDropdown}
              aria-haspopup="true"
            >
              {selectedTicket}
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            {showTicketDropdown && (
              <div className="ticket-dropdown-menu">
                <button 
                  className={`ticket-option ${selectedTicket === 'Standard Ticket' ? 'selected' : ''}`}
                  onClick={() => selectTicket('Standard Ticket')}
                >
                  Standard Ticket
                </button>
                <button 
                  className={`ticket-option ${selectedTicket === 'VIP Ticket' ? 'selected' : ''}`}
                  onClick={() => selectTicket('VIP Ticket')}
                >
                  VIP Ticket
                </button>
              </div>
            )}
          </div>
          
          <div className="event-time-location">
            <div className="event-time">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ff6b35" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{event.date}</span>
            </div>
            <div className="event-location">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ff6b35" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>
        </div>
        
        <div className="event-content">
          <h2>Content</h2>
          <p>{event.description}</p>
        </div>
        
        <div className="event-actions">
          <button 
            className="buy-btn" 
            onClick={() => navigate('/payment', { 
              state: { 
                orderDetails: {
                  eventName: event.title,
                  ticketType: selectedTicket,
                  price: selectedTicket === 'VIP Ticket' ? 
                    parseFloat(event.vipPrice.replace('$', '')) : 
                    parseFloat(event.price.replace('$', '')),
                  quantity: 1,
                  extras: selectedTicket === 'VIP Ticket' ? ['Reserved Seating', 'Free Food'] : [],
                  total: selectedTicket === 'VIP Ticket' ? 
                    parseFloat(event.vipPrice.replace('$', '')) : 
                    parseFloat(event.price.replace('$', '')),
                  currency: "USD"
                }
              }
            })}
          >
            Buy
          </button>
        </div>
      </div>
      
      {selectedTicket === 'VIP Ticket' && (
        <div className="seat-selection-container">
          <h3>Select Seat(s)</h3>
          <div className="seating-chart">
            <div className="screen">Screen</div>
            <div className="seats">
              <div className="seat-map">
                <div className="seat available"></div>
                <div className="seat reserved"></div>
                <div className="seat selected"></div>
                <div className="seat available"></div>
              </div>
              <div className="seat-map">
                <div className="seat available"></div>
                <div className="seat available"></div>
                <div className="seat available"></div>
                <div className="seat reserved"></div>
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
          </div>
          
          <div className="vip-food-options">
            <h3>Choose Your Free Food</h3>
            <div className="food-dropdown">
              <select className="food-select">
                <option>Choose Your Free Food</option>
                <option>Pizza</option>
                <option>Popcorn</option>
                <option>Nachos</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePage;