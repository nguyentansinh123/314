import React from "react";
import "./Home.css";
import EventPlaceholder from '../assets/Eventplaceholder.png';  

const events = Array(6).fill({
  title: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
  date: "Fri, Dec 15, 8:30 AM",
  price: "$399",
  type: "Development",
  author: "Author | Organise",
  image: EventPlaceholder,  
});

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🌟</div>
        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Market</li>
          <li>Services</li>
          <li>Blog</li>
        </ul>
        <div className="nav-icons">
          <span>📍 Syd, Aus</span>
          <span>🌐</span>
          <span>🔔</span>
          <span>👤</span>
        </div>
      </nav>

      {/* Hero Text */}
      <section className="hero-text">
        <h2>Trust By</h2>
        <h1>Thousands Of Events</h1>
      </section>

      {/* Filters */}
      <div className="filters">
        <input type="text" placeholder="Search Some Thing" />
        <select>
          <option>Type Of Event</option>
        </select>
        <div className="filter-options">
          <span>Any price ▼</span>
          <span>Other filters (1) ▼</span>
          <span>Sort ▼</span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="event-grid">
        {events.map((event, index) => (
          <div key={index} className="event-card">
            <img src={event.image} alt="event" />
            <div className="card-details">
              <div className="price-type">
                <span className="price-tag">{event.price}</span>
                <span className="event-type">{event.type}</span>
              </div>
              <p className="event-date">{event.date}</p>
              <p className="event-title">{event.title}</p>
              <p className="event-author">{event.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
