import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Navbar from '../Navbar/Navbar';
import '../CreateEvent/CreateEvent.css'; 
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [originalImages, setOriginalImages] = useState([]);

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: 'conference', 
    location: {
      venue: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    refundPolicy: 'no_refunds',
    status: 'draft'
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [ticketTypes, setTicketTypes] = useState([{
    name: 'General Admission',
    description: 'Standard ticket with access to all basic event features',
    price: 0,
    quantity: 100,
    benefits: [],
    isVIP: false
  }]);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [socialLinks, setSocialLinks] = useState({
    facebookEvent: '',
    twitterHashtag: '',
    instagramHandle: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' && user.role !== 'organizer') {
      navigate('/');
      setError('Only organizers and admins can edit events');
      return;
    }

    fetchEventData();
  }, [user, navigate, id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/event/${id}`, {
        withCredentials: true
      });

      if (response.data.success) {
        const event = response.data.data;
        
        if (user.role !== 'admin' && event.organizer._id !== user._id) {
          navigate('/');
          setError('You are not authorized to edit this event');
          return;
        }

        setEventData({
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          refundPolicy: event.refundPolicy || 'no_refunds',
          status: event.status || 'draft'
        });

        if (event.startDate) {
          const startDateTime = new Date(event.startDate);
          setStartDate(startDateTime);
          setStartTime(formatTime(startDateTime));
        }

        if (event.endDate) {
          const endDateTime = new Date(event.endDate);
          setEndDate(endDateTime);
          setEndTime(formatTime(endDateTime));
        }

        if (event.ticketTypes && event.ticketTypes.length > 0) {
          setTicketTypes(event.ticketTypes);
        }

        if (event.tags && event.tags.length > 0) {
          setTags(event.tags);
        }

        if (event.socialLinks) {
          setSocialLinks({
            facebookEvent: event.socialLinks.facebookEvent || '',
            twitterHashtag: event.socialLinks.twitterHashtag || '',
            instagramHandle: event.socialLinks.instagramHandle || ''
          });
        }

        if (event.images && event.images.length > 0) {
          setOriginalImages(event.images);
          setImagePreview(event.images.map(img => img.url));
        }
      } else {
        setError('Failed to load event data');
      }
    } catch (error) {
      console.error('Error loading event data:', error);
      setError('An error occurred while loading the event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEventData({
        ...eventData,
        [parent]: {
          ...eventData[parent],
          [child]: value
        }
      });
    } else {
      setEventData({
        ...eventData,
        [name]: value
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      location: {
        ...eventData.location,
        address: {
          ...eventData.location.address,
          [name]: value
        }
      }
    });
  };

  const handleSocialLinksChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks({
      ...socialLinks,
      [name]: value
    });
  };

  const handleTicketChange = (index, field, value) => {
    const updatedTickets = [...ticketTypes];
    updatedTickets[index][field] = value;
    setTicketTypes(updatedTickets);
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: `Ticket Type ${ticketTypes.length + 1}`,
        description: '',
        price: 0,
        quantity: 50,
        benefits: [],
        isVIP: false
      }
    ]);
  };

  const removeTicketType = (index) => {
    if (ticketTypes.length === 1) {
      return; 
    }
    
    const ticket = ticketTypes[index];
    if (ticket._id && ticket.sold && ticket.sold > 0) {
      setError(`Cannot remove "${ticket.name}" - tickets have already been sold.`);
      return;
    }
    
    const updatedTickets = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(updatedTickets);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles([...imageFiles, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    if (index < originalImages.length) {
      const imageToDelete = originalImages[index]._id;
      setImagesToDelete(prev => [...prev, imageToDelete]);
      
      const updatedOriginalImages = [...originalImages];
      updatedOriginalImages.splice(index, 1);
      setOriginalImages(updatedOriginalImages);
    }
    
    if (index >= originalImages.length) {
      const fileIndex = index - originalImages.length;
      const updatedFiles = [...imageFiles];
      URL.revokeObjectURL(imagePreview[index]);
      updatedFiles.splice(fileIndex, 1);
      setImageFiles(updatedFiles);
    }
    
    const updatedPreviews = [...imagePreview];
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      setImageFiles([...imageFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...newPreviews]);
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (!eventData.title || !eventData.description || !startDate || !endDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    if (!eventData.location.venue || !eventData.location.address.city || !eventData.location.address.country) {
      setError('Please provide venue, city and country');
      setLoading(false);
      return;
    }
    
    if (ticketTypes.some(ticket => !ticket.name || ticket.price < 0 || ticket.quantity < 1)) {
      setError('Please check your ticket information');
      setLoading(false);
      return;
    }
    
    const formatDateTime = (date, time) => {
      if (!date) return null;
      
      const [hours, minutes] = time ? time.split(':') : [0, 0];
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours || 0, 10));
      newDate.setMinutes(parseInt(minutes || 0, 10));
      
      return newDate.toISOString();
    };
    
    const formattedStartDate = formatDateTime(startDate, startTime);
    const formattedEndDate = formatDateTime(endDate, endTime);
    
    const formData = new FormData();
    
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('category', eventData.category);
    formData.append('startDate', formattedStartDate);
    formData.append('endDate', formattedEndDate);
    formData.append('status', eventData.status);
    formData.append('refundPolicy', eventData.refundPolicy);
    formData.append('userId', user._id);
    formData.append('location', JSON.stringify(eventData.location));
    formData.append('ticketTypes', JSON.stringify(ticketTypes));
    
    if (imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    
    if (socialLinks.facebookEvent || socialLinks.twitterHashtag || socialLinks.instagramHandle) {
      formData.append('socialLinks', JSON.stringify(socialLinks));
    }
    
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
    }
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/event/updateEvent/${id}`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Event updated successfully!');
        setTimeout(() => {
          navigate('/event/' + id);
        }, 1500);
      } else {
        setError(response.data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      if (error.response) {
        console.error('Server error details:', error.response.data);
        setError(error.response.data.error || 'Server error: ' + error.response.status);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFieldReadOnly = (field) => {
    if (eventData.status === 'published') {
      const restrictedFields = ['startDate', 'location', 'venue'];
      return restrictedFields.includes(field);
    }
    return false;
  };

  if (loading && !eventData.title) {
    return (
      <div className="create-event-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-container">
      <Navbar />
      
      <div className="create-event-content">
        <h1>Edit Event</h1>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {eventData.status === 'published' && (
          <div className="info-message">
            Note: Some fields cannot be changed after an event is published.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="event-form">
          {/* Basic Information Section */}
          <section className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="title">Event Name*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Enter event name"
                    value={eventData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description*</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your event"
                    value={eventData.description}
                    onChange={handleInputChange}
                    rows="5"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={eventData.category}
                    onChange={handleInputChange}
                  >
                    <option value="conference">Conference</option>
                    <option value="music_concert">Music Concert</option>
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input-container">
                    <div className="tags-list">
                      {tags.map((tag, index) => (
                        <div key={index} className="tag-item">
                          <span>{tag}</span>
                          <button type="button" onClick={() => removeTag(index)}>×</button>
                        </div>
                      ))}
                    </div>
                    <div className="tag-input-wrapper">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add tags and press Enter"
                      />
                      <button type="button" onClick={addTag}>Add</button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Images</label>
                  <div 
                    className="file-upload-area"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {imagePreview.length > 0 ? (
                      <div className="image-previews">
                        {imagePreview.map((src, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={src} alt={`Preview ${index + 1}`} />
                            <button 
                              type="button" 
                              className="remove-image" 
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {imagePreview.length < 5 && (
                          <div className="add-more-images">
                            <label htmlFor="moreImages">
                              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#666" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                              <span>Add More</span>
                            </label>
                            <input
                              id="moreImages"
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              multiple
                              style={{display: 'none'}}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="32" height="32" stroke="#ccc" fill="none">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p>Click or drag files to upload (max 5 images)</p>
                        <span>Supported formats: JPG, PNG</span>
                        <input
                          type="file"
                          id="imageFile"
                          name="imageFile"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="file-input"
                          multiple
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Date & Time Section */}
          <section className="form-section">
            <h2>Date & Time</h2>
            
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date*</label>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select start date"
                      className="date-input"
                      required
                      minDate={new Date()}
                      wrapperClassName="date-picker-wrapper"
                      disabled={isFieldReadOnly('startDate')}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="startTime">Start Time*</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    disabled={isFieldReadOnly('startDate')}
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="endDate">End Date*</label>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select end date"
                      className="date-input"
                      required
                      minDate={startDate || new Date()}
                      wrapperClassName="date-picker-wrapper"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="endTime">End Time*</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Location Section */}
          <section className="form-section">
            <h2>Location</h2>
            
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="venue">Venue*</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    placeholder="Venue name"
                    value={eventData.location.venue}
                    onChange={(e) => setEventData({
                      ...eventData,
                      location: {
                        ...eventData.location,
                        venue: e.target.value
                      }
                    })}
                    required
                    disabled={isFieldReadOnly('venue')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    placeholder="Street address"
                    value={eventData.location.address.street}
                    onChange={handleAddressChange}
                    disabled={isFieldReadOnly('location')}
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="city">City*</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="City"
                      value={eventData.location.address.city}
                      onChange={handleAddressChange}
                      required
                      disabled={isFieldReadOnly('location')}
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="State/Province"
                      value={eventData.location.address.state}
                      onChange={handleAddressChange}
                      disabled={isFieldReadOnly('location')}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="zipCode">Zip/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      placeholder="Zip/Postal Code"
                      value={eventData.location.address.zipCode}
                      onChange={handleAddressChange}
                      disabled={isFieldReadOnly('location')}
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="country">Country*</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      placeholder="Country"
                      value={eventData.location.address.country}
                      onChange={handleAddressChange}
                      required
                      disabled={isFieldReadOnly('location')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Tickets Section */}
          <section className="form-section">
            <h2>Tickets</h2>
            
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="ticket-item">
                <div className="ticket-header">
                  <h3>Ticket Type {index + 1}</h3>
                  <button 
                    type="button" 
                    className="remove-ticket"
                    onClick={() => removeTicketType(index)}
                    disabled={ticket._id && ticket.sold && ticket.sold > 0}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="form-grid">
                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor={`ticketName-${index}`}>Name*</label>
                      <input
                        type="text"
                        id={`ticketName-${index}`}
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        required
                        disabled={eventData.status === 'published' && ticket._id}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`ticketDesc-${index}`}>Description</label>
                      <textarea
                        id={`ticketDesc-${index}`}
                        value={ticket.description || ''}
                        onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                        rows="2"
                      />
                    </div>
                  </div>
                  
                  <div className="form-column">
                    <div className="form-row">
                      <div className="form-group half">
                        <label htmlFor={`ticketPrice-${index}`}>Price*</label>
                        <div className="price-input">
                          <span className="currency">$</span>
                          <input
                            type="number"
                            id={`ticketPrice-${index}`}
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(index, 'price', Number(e.target.value))}
                            min="0"
                            step="0.01"
                            required
                            disabled={eventData.status === 'published' && ticket._id}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group half">
                        <label htmlFor={`ticketQuantity-${index}`}>
                          Quantity* {ticket.sold > 0 && `(${ticket.sold} sold)`}
                        </label>
                        <input
                          type="number"
                          id={`ticketQuantity-${index}`}
                          value={ticket.quantity}
                          onChange={(e) => handleTicketChange(index, 'quantity', Number(e.target.value))}
                          min={ticket.sold || 1}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id={`ticketVIP-${index}`}
                          checked={ticket.isVIP || false}
                          onChange={(e) => handleTicketChange(index, 'isVIP', e.target.checked)}
                        />
                        <label htmlFor={`ticketVIP-${index}`}>VIP Ticket</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-ticket-btn"
              onClick={addTicketType}
              disabled={eventData.status === 'completed'}
            >
              Add Another Ticket Type
            </button>
          </section>
          
          {/* Additional Settings */}
          <section className="form-section">
            <h2>Additional Settings</h2>
            
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="refundPolicy">Refund Policy</label>
                  <select
                    id="refundPolicy"
                    name="refundPolicy"
                    value={eventData.refundPolicy}
                    onChange={handleInputChange}
                  >
                    <option value="no_refunds">No Refunds</option>
                    <option value="full_refund_before_event">Full Refund Before Event</option>
                    <option value="partial_refund_before_event">Partial Refund Before Event</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Event Status</label>
                  <select
                    id="status"
                    name="status"
                    value={eventData.status}
                    onChange={handleInputChange}
                    disabled={eventData.status === 'completed' || eventData.status === 'cancelled'}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    {eventData.status === 'cancelled' && <option value="cancelled">Cancelled</option>}
                    {eventData.status === 'completed' && <option value="completed">Completed</option>}
                  </select>
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="facebookEvent">Facebook Event URL</label>
                  <input
                    type="text"
                    id="facebookEvent"
                    name="facebookEvent"
                    placeholder="Facebook event URL"
                    value={socialLinks.facebookEvent}
                    onChange={handleSocialLinksChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="twitterHashtag">Twitter Hashtag</label>
                    <input
                      type="text"
                      id="twitterHashtag"
                      name="twitterHashtag"
                      placeholder="#YourEventHashtag"
                      value={socialLinks.twitterHashtag}
                      onChange={handleSocialLinksChange}
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="instagramHandle">Instagram Handle</label>
                    <input
                      type="text"
                      id="instagramHandle"
                      name="instagramHandle"
                      placeholder="@yourevent"
                      value={socialLinks.instagramHandle}
                      onChange={handleSocialLinksChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(`/event/${id}`)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;