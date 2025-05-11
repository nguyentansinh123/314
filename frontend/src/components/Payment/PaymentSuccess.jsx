import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const { paymentDetails, orderDetails } = location.state || {};
  
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <div className="success-container">
      <Navbar />
      
      <div className="success-content">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" width="96" height="96" stroke="#4CAF50" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        <div className="order-confirmation">
          <div className="order-confirmation-detail">
            <span>Order Number:</span>
            <span>{orderNumber}</span>
          </div>
          
          <div className="order-confirmation-detail">
            <span>Event:</span>
            <span>{orderDetails?.eventName || "Event name"}</span>
          </div>
          
          <div className="order-confirmation-detail">
            <span>Ticket Type:</span>
            <span>{orderDetails?.ticketType || "Standard"}</span>
          </div>
          
          <div className="order-confirmation-detail">
            <span>Amount Paid:</span>
            <span>${orderDetails?.total.toFixed(2) || "0.00"} {orderDetails?.currency || "USD"}</span>
          </div>
        </div>
        
        <p className="email-note">
          We've sent a confirmation email with the ticket details to your registered email address.
        </p>
        
        <div className="success-actions">
          <button 
            className="primary-button"
            onClick={() => navigate('/my-tickets')}
          >
            View My Tickets
          </button>
          
          <button 
            className="secondary-button"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;