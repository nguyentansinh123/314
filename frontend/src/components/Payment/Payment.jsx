import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Navbar from '../Navbar/Navbar';
import './Payment.css';

const Payment = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const mockOrder = location.state?.orderDetails || {
      eventName: "The Even Full Name",
      ticketType: "VIP Ticket",
      price: 349.00,
      quantity: 1,
      extras: ["Reserved Seating", "Free Food: Popcorn"],
      total: 349.00,
      currency: "USD"
    };
    
    setOrderDetails(mockOrder);
  }, [location]);

  const handlePaymentSuccess = (details) => {
    setIsProcessing(true);
    
    console.log("Payment completed successfully", details);
    
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        navigate('/payment-success', { 
          state: { 
            paymentDetails: details,
            orderDetails: orderDetails
          } 
        });
      }, 3000);
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
  };

  if (!orderDetails) {
    return <div className="payment-loading">Loading order details...</div>;
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
              {orderDetails.extras && orderDetails.extras.map((extra, index) => (
                <div className="order-item" key={index}>
                  <span>Extra:</span>
                  <span>{extra}</span>
                </div>
              ))}
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
                    "client-id": "YOUR_PAYPAL_CLIENT_ID", 
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
    </div>
  );
};

export default Payment;