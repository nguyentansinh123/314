import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

// Create socket outside component to persist between renders
let socket = null;

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize socket connection - using useCallback to avoid recreation on every render
  const initializeSocket = useCallback(() => {
    if (!user || socket) return;
    
    try {
      console.log('Initializing socket connection...');
      
      // Close any existing connection first
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      
      // More resilient socket connection with better error handling
      socket = io('http://localhost:5000', {
        query: {
          userId: user._id
        },
        // Socket.IO v2 options
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        withCredentials: true
      });

      // Connection lifecycle events
      socket.on('connect_attempt', () => {
        console.log('Socket connection attempt...');
      });

      socket.on('connect', () => {
        console.log('Socket connected successfully:', socket.id);
        setSocketConnected(true);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setSocketConnected(false);
        
        // Check if we should fall back to REST API mode
        if (socket && socket.io && socket.io.reconnectionAttempts === socket.io.opts.reconnectionAttempts) {
          console.log('Max reconnection attempts reached, switching to REST API mode');
          // You could set a state flag here to indicate REST-only mode
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected, reason:', reason);
        setSocketConnected(false);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        setSocketConnected(true);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Socket reconnection attempt ${attemptNumber}...`);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Business logic events
      socket.on('getOnlineUsers', (userIds) => {
        console.log('Online users received:', userIds);
        setOnlineUsers(userIds);
      });

      socket.on('newMessage', (newMessage) => {
        console.log('New message received via socket:', newMessage);
        
        if (selectedUser && 
           (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
          setMessages(prev => [...prev, newMessage]);
        }
      });
    } catch (err) {
      console.error('Error initializing socket:', err);
      setSocketConnected(false);
    }
  }, [user, selectedUser]);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    initializeSocket();

    // Fetch all users
    fetchUsers();

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('Disconnecting socket...');
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, navigate, initializeSocket]);

  // Update socket event handlers when selected user changes
  useEffect(() => {
    // Re-register message handler with updated selectedUser closure
    if (socket) {
      socket.off('newMessage');
      socket.on('newMessage', (newMessage) => {
        console.log('New message received via socket:', newMessage);
        
        if (selectedUser && 
           (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
          setMessages(prev => [...prev, newMessage]);
        }
      });
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/messages/users', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const response = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!messageText.trim() && !image) || !selectedUser) return;
    
    // Define tempMessage outside try/catch so it's accessible in both blocks
    const tempMessage = {
      _id: Date.now().toString(), // temporary ID
      senderId: user._id,
      receiverId: selectedUser._id,
      text: messageText.trim(),
      image: imagePreview,
      createdAt: new Date().toISOString(),
      pending: true // flag to indicate this is not yet confirmed by server
    };
    
    // Store messageText and image before clearing them
    const textToSend = messageText.trim();
    const imageToSend = image;
    
    // Optimistically add to UI
    setMessages(prev => [...prev, tempMessage]);
    
    // Clear inputs immediately for better UX
    setMessageText('');
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    try {
      // Log what we're sending (for debugging) - but don't log the full image data
      console.log('Sending message:', { 
        to: selectedUser._id, 
        text: textToSend, 
        hasImage: !!imageToSend 
      });
      
      // Send with image or without, based on presence
      let requestData = { text: textToSend };
      if (imageToSend) {
        requestData.image = imageToSend;
      }
      
      // Send via API with timeout
      const response = await axios.post(
        `http://localhost:5000/api/messages/send/${selectedUser._id}`, 
        requestData,
        {
          withCredentials: true,
          timeout: 30000, // 30 second timeout for image uploads
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Replace the temp message with the confirmed one from server
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? response.data.message : msg
          )
        );
        
        // For extra reliability, also emit on client
        if (socket && socketConnected) {
          socket.emit('sendMessage', response.data.message);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Log more details about the error
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Server response error:', error.response.status, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
      }
      
      // Remove the pending message on error
      setMessages(prev => prev.filter((msg) => msg._id !== tempMessage._id));
      
      // Show a more specific error message if possible
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Failed to send message: ${error.response.data.error}`);
      } else {
        alert('Failed to send message. Please try again.');
      }
    }
  };

  // Update your handleImageChange function to compress images before sending:
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image too large. Please select an image smaller than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Compress image before setting it
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions (max 1200px wide)
        if (width > 1200) {
          height = Math.round(height * 1200 / width);
          width = 1200;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed image as base64
        const compressedImage = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
        
        setImagePreview(compressedImage);
        setImage(compressedImage);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Display socket status
  const connectionStatus = () => {
    if (!user) return null;
    
    return (
      <div className={`chat-connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
        {socketConnected ? 'Connected' : 'Connecting...'}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="chat-page">
      <Navbar />
      
      {connectionStatus()}
      
      <div className="chat-container">
        {/* Sidebar with users */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Messages</h2>
            <div className="online-count">
              {onlineUsers.length > 0 ? `${onlineUsers.length - 1} online` : 'No users online'}
            </div>
          </div>
          
          {loading ? (
            <div className="chat-loading">Loading users...</div>
          ) : (
            <div className="chat-users-list">
              {users.map(u => (
                <div 
                  key={u._id} 
                  className={`chat-user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(u)}
                >
                  <div className="chat-user-avatar">
                    <img src={u.profilePicture || '/avatar.png'} alt={u.name} />
                    {onlineUsers.includes(u._id) && (
                      <span className="online-indicator"></span>
                    )}
                  </div>
                  <div className="chat-user-info">
                    <h3>{u.name}</h3>
                    <p>{onlineUsers.includes(u._id) ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="chat-empty-state">No users found</div>
              )}
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="chat-main">
          {!selectedUser ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <h2>Select a conversation</h2>
              <p>Choose a user from the sidebar to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-user">
                  <div className="chat-user-avatar">
                    <img src={selectedUser.profilePicture || '/avatar.png'} alt={selectedUser.name} />
                    {onlineUsers.includes(selectedUser._id) && (
                      <span className="online-indicator"></span>
                    )}
                  </div>
                  <div className="chat-user-info">
                    <h3>{selectedUser.name}</h3>
                    <p>{onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <button 
                  className="chat-close-btn"
                  onClick={() => setSelectedUser(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="chat-loading">Loading messages...</div>
                ) : (
                  <>
                    {messages.length === 0 ? (
                      <div className="chat-empty-state">
                        <p>No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div 
                          key={message._id}
                          className={`
                            chat-message 
                            ${message.senderId === user._id ? 'sent' : 'received'}
                            ${message.pending ? 'pending' : ''}
                          `}
                        >
                          {message.image && (
                            <div className="chat-message-image">
                              <img src={message.image} alt="Attachment" />
                            </div>
                          )}
                          {message.text && (
                            <div className="chat-message-text">{message.text}</div>
                          )}
                          <div className="chat-message-time">
                            {message.pending ? 'Sending...' : formatMessageTime(message.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messageEndRef} />
                  </>
                )}
              </div>
              
              <form className="chat-input" onSubmit={handleSendMessage}>
                {imagePreview && (
                  <div className="chat-image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button" 
                      className="chat-remove-image" 
                      onClick={removeImage}
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                <div className="chat-input-container">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                  />
                  
                  <div className="chat-input-actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="chat-file-input"
                    />
                    
                    <button 
                      type="button" 
                      className="chat-attach-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📎
                    </button>
                    
                    <button 
                      type="submit" 
                      className="chat-send-btn"
                      disabled={!messageText.trim() && !image}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;