import React from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";
import bgImage from '../assets/signin-bg.jpg'; 
const SignUp = () => {
  return (
    <div className="signup-container">
      <div className="signup-left">
        <h2>Sign up</h2>
        <p>Sign up to enjoy the feature of Revolutie</p>

        <input type="text" placeholder="Your Name" />
        <input type="date" placeholder="Date of Birth" />
        <input type="email" placeholder="Email" />
        <div className="password-field">
          <input type="password" placeholder="Password" />
          <span className="eye-icon">👁️</span>
        </div>

        <button className="signup-btn">Sign up</button>

        <div className="divider">
          <hr />
          <span>or</span>
          <hr />
        </div>

        <button className="google-btn">Continue with Google <span className="g-icon">🟢</span></button>

        <p className="toggle-form">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
      <div className="signup-right">
        <img src={bgImage} alt="Background" />
      </div>
    </div>
  );
};

export default SignUp;

