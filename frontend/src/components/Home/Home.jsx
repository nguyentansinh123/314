import React, { useState } from "react";
import "./Home.css";
import Navbar from "../Navbar/Navbar";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [eventType, setEventType] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [priceFilter, setPriceFilter] = useState("Any price");
  // eslint-disable-next-line no-unused-vars
  const [sortBy, setSortBy] = useState("");

  const events = [
    {
      id: 1,
      title:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
      date: "Fri, Dec 15, 9:30 AM",
      price: "$199",
      category: "Development",
      author: "Author",
      organizer: "Organizer",
      image:
        "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    },
    {
      id: 2,
      title:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
      date: "Fri, Dec 15, 9:30 AM",
      price: "$199",
      category: "Development",
      author: "Author",
      organizer: "Organizer",
      image:
        "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    },
    {
      id: 3,
      title:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
      date: "Fri, Dec 15, 9:30 AM",
      price: "$399",
      category: "Development",
      author: "Author",
      organizer: "Organizer",
      image:
        "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    },
    {
      id: 4,
      title:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
      date: "Fri, Dec 15, 9:30 AM",
      price: "$199",
      category: "Development",
      author: "Author",
      organizer: "Organizer",
      image:
        "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    },
    {
      id: 5,
      title:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
      date: "Fri, Dec 15, 9:30 AM",
      price: "$499",
      category: "Development",
      author: "Author",
      organizer: "Organizer",
      image:
        "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    },
    {
      id: 6,
      title:
        "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum",
      date: "Fri, Dec 15, 9:30 AM",
      price: "$399",
      category: "Development",
      author: "Author",
      organizer: "Organizer",
      image:
        "https://imgs.search.brave.com/047STiN-U7j9FUfVfYxHWb-dRpAW3rakMsdHXk8rUTM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG5i/bG9nLndlYmt1bC5j/b20vYmxvZy93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNC8wMi9u/ZXh0LWpzLWltYWdl/LWNvbXBvbmVudC5w/bmc",
    },
  ];

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
              placeholder="Search Some Thing"
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
              <option value="">Type Of Event</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <button className="dropdown-btn">
            {priceFilter}
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              stroke="currentColor"
              fill="none"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <button className="dropdown-btn">
            Other filters (1)
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              stroke="currentColor"
              fill="none"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <button className="dropdown-btn">
            Sort
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              stroke="currentColor"
              fill="none"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </section>

      <section className="events-grid">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <div className="event-image">
              <img
                src={
                  event.image || "https://via.placeholder.com/300x170?text=NEXT"
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
                <span className="event-price">{event.price}</span>
                <span className="event-category">{event.category}</span>
              </div>
              <div className="event-date">{event.date}</div>
              <h3 className="event-title">{event.title}</h3>
              <div className="event-organizer">
                {event.author} | {event.organizer}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
