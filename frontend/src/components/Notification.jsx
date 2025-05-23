import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5055'); 

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('receive_notification', (data) => {
      setNotifications((prev) => [...prev, data.message]);
    });

    return () => {
      socket.off('receive_notification');
    };
  }, []);

  const sendTestNotification = () => {
    socket.emit('send_notification', {
      message: '🔔 Test notification from frontend!',
    });
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '2rem' }}>
      <h3>🔔 Notifications</h3>
      <button onClick={sendTestNotification}>Send Test Notification</button>
      <ul>
        {notifications.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;

