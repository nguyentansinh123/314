import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5055');

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('send_message', message);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h3>💬 Chat</h3>
      <div>
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Type a message..." 
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chat;
