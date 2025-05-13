import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import Navbar from '../Navbar/Navbar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/me', {
          withCredentials: true
        });
        
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Please select a valid image file (JPG or PNG)');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.put(
        'http://localhost:5000/api/user/update-profile',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setSuccess('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendVerificationOtp = async () => {
    try {
      setVerifyLoading(true);
      setVerifyError('');
      setVerifySuccess('');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/send-verify-otp',
        { userId: user._id },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setOtpSent(true);
        setVerifySuccess('OTP sent successfully. Please check your email.');
      } else {
        setVerifyError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setVerifyError('An error occurred while sending OTP'+ error);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    if (!otp) {
      setVerifyError('Please enter OTP');
      return;
    }
    
    try {
      setVerifyLoading(true);
      setVerifyError('');
      setVerifySuccess('');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-account',
        { userId: user._id, otp },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setVerifySuccess('Account verified successfully');
        setOtpSent(false);
        setOtp('');
        
        const userResponse = await axios.get('http://localhost:5000/api/user/me', {
          withCredentials: true
        });
        
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }
      } else {
        setVerifyError(response.data.message || 'Verification failed');
      }
    } catch (error) {
      setVerifyError('An error occurred during verification'+ error);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      
      const response = await axios.put(
        'http://localhost:5000/api/user/change-password',
        { 
          currentPassword, 
          newPassword 
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setPasswordSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(response.data.message || 'Failed to change password');
      }
    } catch (error) {

      setPasswordError('An error occurred while changing password'+ error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }
    
    try {
      setResetLoading(true);
      setResetError('');
      setResetSuccess('');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/send-reset-otp',
        { email: resetEmail },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setResetOtpSent(true);
        setResetSuccess('Verification code sent to your email');
      } else {
        setResetError(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
        console.log(error)
      setResetError('An error occurred while sending the verification code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetOtp || !resetNewPassword) {
      setResetError('All fields are required');
      return;
    }
    
    if (resetNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setResetLoading(true);
      setResetError('');
      setResetSuccess('');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/reset-password',
        { 
          email: resetEmail,
          otp: resetOtp,
          newPassword: resetNewPassword 
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setResetSuccess('Password reset successfully');
        setResetOtpSent(false);
        setResetEmail('');
        setResetOtp('');
        setResetNewPassword('');
        setShowResetFlow(false); 
      } else {
        setResetError(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      console.log(error)
      setResetError('An error occurred during password reset');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-wrapper">
          <div className="profile-container loading">
            <div className="loader"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="profile-wrapper">
          <div className="profile-container not-logged-in">
            <div className="not-logged-icon">
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="#666" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m0-6v.01M18 6a4 4 0 00-4-4H6a4 4 0 00-4 4v12a4 4 0 004 4h12a4 4 0 004-4V10c0-2.21-1.79-4-4-4z"></path>
              </svg>
            </div>
            <h2>Authentication Required</h2>
            <p>Please log in to view your profile</p>
            <button className="login-btn" onClick={() => navigate('/login')}>Log In</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-wrapper">
        <div className="profile-page">
          <div className="profile-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-user-info">
                <div className="sidebar-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div className="sidebar-user-details">
                  <h3>{user.name}</h3>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <ul>
                <li className={activeTab === 'personal' ? 'active' : ''}>
                  <button onClick={() => setActiveTab('personal')}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Personal Information
                  </button>
                </li>
                <li className={activeTab === 'security' ? 'active' : ''}>
                  <button onClick={() => setActiveTab('security')}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0110 0v4"></path>
                    </svg>
                    Security
                  </button>
                </li>
                <li className={activeTab === 'verification' ? 'active' : ''}>
                  <button onClick={() => setActiveTab('verification')}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Verification
                    {!user.isAccountVerified && (
                      <span className="verification-badge">!</span>
                    )}
                  </button>
                </li>
                <li className={activeTab === 'history' ? 'active' : ''}>
                  <button onClick={() => setActiveTab('history')}>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Event History
                  </button>
                </li>
              </ul>
            </nav>

            <div className="sidebar-footer">
              <Link to="/" className="back-to-home">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-header">
              <h1>
                {activeTab === 'personal' && 'Personal Information'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'verification' && 'Verification'}
                {activeTab === 'history' && 'Event History'}
              </h1>
            </div>

            {activeTab === 'personal' && (
              <div className="profile-content">
                <div className="profile-card">
                  <div className="profile-banner"></div>
                  <div className="profile-card-content">
                    <div className="profile-image-section">
                      <div className="profile-image-container" onClick={handleImageClick}>
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name} 
                            className="profile-image" 
                          />
                        ) : (
                          <div className="profile-image-placeholder">
                            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" fill="none">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                        )}
                        <div className="image-overlay">
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="#fff" fill="none">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                          <span>Update</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/jpeg, image/png"
                        style={{ display: 'none' }}
                      />
                      {uploading && <p className="upload-status">Uploading...</p>}
                      {error && <p className="error-message">{error}</p>}
                      {success && <p className="success-message">{success}</p>}
                      
                      <div className="profile-name">
                        <h2>
                          {user.name}
                          {user.isAccountVerified && (
                            <span className="verified-badge" title="Account Verified">
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#4caf50" fill="#4caf50">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            </span>
                          )}
                        </h2>
                        <span className={`role-badge role-${user.role}`}>{user.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="profile-details-card">
                  <h2>Account Information</h2>
                  
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="#5d35f0" fill="none">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <label>Full Name</label>
                        <div className="detail-value">{user.name}</div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="#5d35f0" fill="none">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <label>Email Address</label>
                        <div className="detail-value">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="#5d35f0" fill="none">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <label>Member Since</label>
                        <div className="detail-value">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="#5d35f0" fill="none">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <label>Account Status</label>
                        <div className="detail-value">
                          <span className="status-badge active">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="profile-content">
                <div className="profile-section">
                  <h2>Password Management</h2>
                  <p className="section-description">Manage your account password</p>
                  
                  <div className="security-tabs">
                    <button 
                      className={`security-tab-btn ${!showResetFlow ? 'active' : ''}`}
                      onClick={() => setShowResetFlow(false)}
                    >
                      Change Password
                    </button>
                    <button 
                      className={`security-tab-btn ${showResetFlow ? 'active' : ''}`}
                      onClick={() => setShowResetFlow(true)}
                    >
                      Reset Password
                    </button>
                  </div>
                  
                  {!showResetFlow ? (
                    <>
                      {passwordError && <p className="error-message">{passwordError}</p>}
                      {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
                      
                      <form onSubmit={handlePasswordChange} className="password-change-form">
                        <div className="form-group">
                          <label htmlFor="currentPassword">Current Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type="password"
                              id="currentPassword"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="newPassword">New Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="newPassword"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                            <button 
                              type="button"
                              className="toggle-password"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="confirmPassword">Confirm Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="confirmPassword"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <button 
                          type="submit" 
                          className="change-password-btn"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="reset-password-section">
                      {!resetOtpSent ? (
                        <>
                          {resetError && <p className="error-message">{resetError}</p>}
                          {resetSuccess && <p className="success-message">{resetSuccess}</p>}
                          
                          <p className="flow-description">
                            We'll send a verification code to your email address to reset your password.
                          </p>
                          
                          <form onSubmit={handleSendResetOtp} className="reset-form">
                            <div className="form-group">
                              <label htmlFor="resetEmail">Confirm Your Email</label>
                              <input
                                type="email"
                                id="resetEmail"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                required
                              />
                            </div>
                            
                            <button 
                              type="submit" 
                              className="send-otp-btn"
                              disabled={resetLoading}
                            >
                              {resetLoading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          {resetError && <p className="error-message">{resetError}</p>}
                          {resetSuccess && <p className="success-message">{resetSuccess}</p>}
                          
                          <form onSubmit={handleResetPassword} className="reset-form">
                            <div className="form-group">
                              <label htmlFor="resetOtp">Verification Code</label>
                              <input
                                type="text"
                                id="resetOtp"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value)}
                                placeholder="6-digit code"
                                maxLength="6"
                                required
                              />
                            </div>
                            
                            <div className="form-group">
                              <label htmlFor="resetNewPassword">New Password</label>
                              <div className="password-input-wrapper">
                                <input
                                  type={showResetPassword ? "text" : "password"}
                                  id="resetNewPassword"
                                  value={resetNewPassword}
                                  onChange={(e) => setResetNewPassword(e.target.value)}
                                  required
                                />
                                <button 
                                  type="button"
                                  className="toggle-password"
                                  onClick={() => setShowResetPassword(!showResetPassword)}
                                >
                                  {showResetPassword ? (
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                      <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                  ) : (
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <div className="form-actions">
                              <button 
                                type="submit" 
                                className="change-password-btn"
                                disabled={resetLoading}
                              >
                                {resetLoading ? 'Resetting...' : 'Reset Password'}
                              </button>
                              <button 
                                type="button"
                                className="resend-btn"
                                onClick={handleSendResetOtp}
                                disabled={resetLoading}
                              >
                                Resend Code
                              </button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="profile-content">
                <div className="profile-section">
                  <h2>Account Verification</h2>
                  
                  <div className="verification-status">
                    <div className={`status-card ${user.isAccountVerified ? 'verified' : 'unverified'}`}>
                      <div className="status-icon">
                        {user.isAccountVerified ? (
                          <svg viewBox="0 0 24 24" width="32" height="32" stroke="#4caf50" fill="none">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="32" height="32" stroke="#f44336" fill="none">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        )}
                      </div>
                      <div className="status-details">
                        <h3>{user.isAccountVerified ? 'Account Verified' : 'Account Not Verified'}</h3>
                        <p>
                          {user.isAccountVerified 
                            ? 'Your account has been successfully verified.' 
                            : 'Please verify your account to access all features.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!user.isAccountVerified && (
                    <div className="verification-actions">
                      {verifyError && <p className="error-message">{verifyError}</p>}
                      {verifySuccess && <p className="success-message">{verifySuccess}</p>}
                      
                      {!otpSent ? (
                        <button 
                          className="send-otp-btn"
                          onClick={handleSendVerificationOtp}
                          disabled={verifyLoading}
                        >
                          {verifyLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                      ) : (
                        <form onSubmit={handleVerifyAccount} className="verify-form">
                          <div className="form-group">
                            <label htmlFor="otp">Enter Verification Code</label>
                            <input
                              type="text"
                              id="otp"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="6-digit code"
                              maxLength="6"
                              required
                            />
                          </div>
                          <div className="form-actions">
                            <button 
                              type="submit" 
                              className="verify-btn"
                              disabled={verifyLoading}
                            >
                              {verifyLoading ? 'Verifying...' : 'Verify Account'}
                            </button>
                            <button 
                              type="button"
                              className="resend-btn"
                              onClick={handleSendVerificationOtp}
                              disabled={verifyLoading}
                            >
                              Resend Code
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="profile-content">
                <div className="profile-section">
                  <h2>Your Event History</h2>
                  <p className="section-description">View events you've attended or registered for.</p>
                  
                  <div className="no-events-message">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="#999" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 010 7.75"></path>
                    </svg>
                    <p>You haven't attended any events yet.</p>
                    <Link to="/" className="browse-events-btn">Browse Events</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;