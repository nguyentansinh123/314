import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentDetails, orderDetails } = location.state || {};

  useEffect(() => {
    if (!paymentDetails || !orderDetails) {
      navigate('/');
    }
  }, [paymentDetails, orderDetails, navigate]);

  if (!paymentDetails || !orderDetails) {
    return null;
  }

  return (
    <div className="success-container">
      <Navbar />
      
      <div className="success-content">
        <div className="success-header">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" stroke="#4CAF50" fill="none" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1>Payment Successful!</h1>
          <p>Your ticket has been confirmed for {orderDetails.eventName}</p>
        </div>

        <div className="ticket-details">
          <div className="ticket-header">
            <h2>Ticket Details</h2>
            <div className="ticket-number">#{orderDetails.ticketNumber}</div>
          </div>
          
          <div className="ticket-info">
            <div className="info-item">
              <span className="label">Event</span>
              <span className="value">{orderDetails.eventName}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Ticket Type</span>
              <span className="value">{orderDetails.ticketType}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Quantity</span>
              <span className="value">{orderDetails.quantity}</span>
            </div>
            
            {orderDetails.extras && orderDetails.extras.length > 0 && (
              <div className="info-item">
                <span className="label">Extras</span>
                <span className="value">
                  <ul className="extras-list">
                    {orderDetails.extras.map((extra, index) => (
                      <li key={index}>{extra}</li>
                    ))}
                  </ul>
                </span>
              </div>
            )}
            
            <div className="info-item">
              <span className="label">Transaction ID</span>
              <span className="value">{paymentDetails.id}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Amount Paid</span>
              <span className="value">${orderDetails.total.toFixed(2)} {orderDetails.currency}</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="view-tickets-btn" onClick={() => navigate('/my-tickets')}>
            View My Tickets
          </button>
          <button className="back-to-events-btn" onClick={() => navigate('/')}>
            Back to Events
          </button>
        </div>
        
        <div className="success-note">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p>Thank you for using our platform!</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;