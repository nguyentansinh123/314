import React from 'react';
import './SignIn.css';
import bgImage from '../assets/signin-bg.jpg'; 
import { Link } from "react-router-dom";

function SignIn() {
  return (
    <div className="signin-container">
      <div className="signin-left">
        <h2>Sign in</h2>
        <p>Please login to continue to your account.</p>

        <label>Email</label>
        <input type="email" placeholder="Email" />

        <label>Password</label>
        <div className="password-wrapper">
          <input type="password" placeholder="Password" />
          <span className="eye-icon">👁️</span>
        </div>

        <div className="checkbox-row">
          <input type="checkbox" id="keep" />
          <label htmlFor="keep">Keep me logged in</label>
        </div>

        <button className="signin-btn">Sign in</button>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="google-btn">Sign in with Google <span className="google-logo">🔍</span></button>

        <p className="register-text">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </div>

      <div className="signin-right">
        <img src={bgImage} alt="Background" />
      </div>
    </div>
  );
}

export default SignIn;
