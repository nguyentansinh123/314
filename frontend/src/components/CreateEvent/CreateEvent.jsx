import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Navbar from '../Navbar/Navbar';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    time: '',
    price: '',
    description: '',
    eventManager: '',
    teamPlanner: '',
    location: '',
    totalPeople: '',
    category: 'Development'
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      console.log("Selected date formatted:", formattedDate);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formattedDate = selectedDate ? 
      `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';
    
    const eventDataToSubmit = {
      ...eventData,
      date: formattedDate,
      image: imageFile
    };
    
    console.log("Event data to submit:", eventDataToSubmit);

    alert("Event created successfully!");
    navigate('/');
  };

  return (
    <div className="create-event-container">
      <Navbar />
      
      <div className="create-event-content">
        <h1>Create A Event</h1>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-grid">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="title">Event Name</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Register For Event Name"
                  value={eventData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Event Price</label>
                <div className="price-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    placeholder="0"
                    value={eventData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Type text"
                  value={eventData.description}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventManager">Event Manager</label>
                <input
                  type="text"
                  id="eventManager"
                  name="eventManager"
                  placeholder="Register For Event Name"
                  value={eventData.eventManager}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="teamPlanner">Team Planner</label>
                <input
                  type="text"
                  id="teamPlanner"
                  name="teamPlanner"
                  placeholder="Team Planner"
                  value={eventData.teamPlanner}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date">On Date</label>
                <div className="date-picker-container">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select Date"
                    className="date-input"
                    required
                    wrapperClassName="date-picker-wrapper"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>File Upload</label>
                <div 
                  className="file-upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" onClick={() => {setImageFile(null); setImagePreview(null);}}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="32" height="32" stroke="#ccc" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p>Click or drag file to this area to upload</p>
                      <span>Formats accepted are .png .jpg .jpeg</span>
                    </>
                  )}
                  <input
                    type="file"
                    id="imageFile"
                    name="imageFile"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="totalPeople">Total People</label>
                <input
                  type="number"
                  id="totalPeople"
                  name="totalPeople"
                  placeholder="Total People For The Event"
                  value={eventData.totalPeople}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={eventData.category}
                  onChange={handleInputChange}
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;