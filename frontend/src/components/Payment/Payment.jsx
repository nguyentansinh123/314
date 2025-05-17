import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import './Payment.css';

const Payment = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.orderDetails) {
      navigate('/');
      return;
    }
    
    setOrderDetails(location.state.orderDetails);
  }, [location, navigate]);

  const handlePaymentSuccess = async (details) => {
    try {
      setIsProcessing(true);
      console.log("Payment completed successfully", details);
      
      // Show stylish alert message
      setAlertMessage(`Payment successful! Transaction ID: ${details.id}`);
      setShowAlert(true);
      
      // Update registration status in backend
      const response = await axios.post(
        'http://localhost:5000/api/registration/confirm-payment',
        {
          registrationId: orderDetails.registrationId,
          paymentDetails: {
            transactionId: details.id,
            paymentMethod: 'PayPal',
            amount: orderDetails.total,
            status: 'completed'
          }
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setPaymentSuccess(true);
        
        // Redirect to success page after delay
        setTimeout(() => {
          navigate('/payment-success', { 
            state: { 
              paymentDetails: details,
              orderDetails: orderDetails
            } 
          });
        }, 3000);
      } else {
        setError('Payment confirmation failed. Please contact support.');
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      setError('An error occurred while confirming your payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    setError('Payment processing failed. Please try again or use a different payment method.');
  };

  if (!orderDetails) {
    return (
      <div className="payment-container">
        <Navbar />
        <div className="payment-loading">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <Navbar />
      
      <div className="payment-content">
        <div className="payment-header">
          <h1>Complete Your Payment</h1>
          <p>Please review your order and complete the payment</p>
        </div>

        <div className="payment-details-grid">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-details">
              <div className="order-item">
                <span>Event:</span>
                <span>{orderDetails.eventName}</span>
              </div>
              <div className="order-item">
                <span>Ticket Type:</span>
                <span>{orderDetails.ticketType}</span>
              </div>
              <div className="order-item">
                <span>Quantity:</span>
                <span>{orderDetails.quantity}</span>
              </div>
              <div className="order-item">
                <span>Price per Ticket:</span>
                <span>${orderDetails.price.toFixed(2)}</span>
              </div>
              {orderDetails.extras && orderDetails.extras.length > 0 && orderDetails.extras.map((extra, index) => (
                <div className="order-item" key={index}>
                  <span>Extra:</span>
                  <span>{extra}</span>
                </div>
              ))}
              <div className="order-item">
                <span>Service Fee:</span>
                <span>${(orderDetails.price * orderDetails.quantity * 0.05).toFixed(2)}</span>
              </div>
              <div className="order-item total">
                <span>Total:</span>
                <span>${orderDetails.total.toFixed(2)} {orderDetails.currency}</span>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h2>Payment Method</h2>
            
            {paymentSuccess ? (
              <div className="payment-success">
                <svg viewBox="0 0 24 24" width="64" height="64" stroke="#4CAF50" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3>Payment Successful!</h3>
                <p>Redirecting to confirmation page...</p>
              </div>
            ) : (
              <>
                <div className="paypal-container">
                  <PayPalScriptProvider options={{ 
                    "client-id": "AZ5blecf5WPArBg4x5-mZvKNHh4Pl1rAolC_CrFHoFmt5UrWxo621llXJfh9nYrCRqYgQilA-Cfyits2", 
                    currency: orderDetails.currency
                  }}>
                    <PayPalButtons
                      style={{
                        color: "blue",
                        layout: "vertical",
                        shape: "rect",
                      }}
                      disabled={isProcessing}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              description: `Ticket for ${orderDetails.eventName}`,
                              amount: {
                                currency_code: orderDetails.currency,
                                value: orderDetails.total.toFixed(2),
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(handlePaymentSuccess);
                      }}
                      onError={handlePaymentError}
                    />
                  </PayPalScriptProvider>
                </div>
                
                {error && (
                  <div className="payment-error">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="payment-note">
                  <p>By completing this payment, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
                
                <div className="alternative-payment">
                  <button className="back-button" onClick={() => navigate(-1)}>
                    Back to Event Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="custom-alert-overlay">
          <div className="custom-alert">
            <div className="alert-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="#4CAF50" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="alert-content">
              <h3>Success!</h3>
              <p>{alertMessage}</p>
            </div>
            <button 
              className="alert-close-btn"
              onClick={() => setShowAlert(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;