import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };
  
  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="main-nav">
      <div className="nav-left">
        <div className="logo">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#5d35f0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
          </svg>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/market" className="nav-link">Market</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          {user && user.role === 'user' && (
            <Link to="/my-tickets" className="nav-link">My Tickets</Link>
          )}
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <Link to="/myEvent" className="nav-link">My Events</Link>
          )}
          {user && (
            <Link 
              to="/chat" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
              </div>
              <span>Chat</span>
            </Link>
          )}
        </div>
      </div>
      <div className="nav-right">
        {user && user.role === 'admin' && (
          <Link to="/admin/dashboard" className="admin-dashboard-link">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Admin</span>
          </Link>
        )}
        
        {user && (user.role === 'organizer' || user.role === 'admin') && (
          <Link to="/create-event" className="create-event-nav-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create Event</span>
          </Link>
        )}

        <button className="location-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Syd, Aus
        </button>
        <button className="lang-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
        </button>
        <button className="theme-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        <div className="user-profile" onClick={handleProfileClick}>
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <div className="avatar-container">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="user-avatar" 
                  />
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <div className="user-dropdown">
                <div className="dropdown-item dropdown-item-profile" onClick={() => navigate('/profile')}>
                  My Profile
                </div>
                {/* Add admin dashboard link in dropdown as well for easier access */}
                {user.role === 'admin' && (
                  <div className="dropdown-item dropdown-item-admin" onClick={() => navigate('/admin/dashboard')}>
                    Admin Dashboard
                  </div>
                )}
                <div className="dropdown-item dropdown-item-logout" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            </div>
          ) : (
            <button className="user-btn" onClick={() => navigate('/login')}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;