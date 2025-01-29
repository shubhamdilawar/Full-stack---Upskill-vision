import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";
import axios from '../utils/axios';

const ForgotPassword = () => {
  const [stage, setStage] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Reset Password
  const [email, setEmail] = useState(""); // Email state
  const [otp, setOtp] = useState(""); // OTP state
  const [newPassword, setNewPassword] = useState(""); // New password state
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password state
  const navigate = useNavigate();

  // Handle Email Submission (Stage 1)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/forgot-password', { email });

      if (response.status === 200) {
        alert(response.data.message);
        setStage(2);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error during email submission:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  // Handle OTP Verification (Stage 2)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/verify-otp', { email, otp });

      if (response.status === 200) {
        alert(response.data.message);
        setStage(3);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      alert(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  // Handle Password Reset (Stage 3)
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword
      });

      if (response.status === 200) {
        alert(response.data.message);
        navigate("/login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      alert(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>

      {stage === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <label>Enter your email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {stage === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <label>Enter OTP</label>
          <input
            type="text"
            placeholder="Enter the OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {stage === 3 && (
        <form onSubmit={handlePasswordReset}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}

      <p>
        <span onClick={() => navigate("/")} className="link">
          Back to Sign In
        </span>
      </p>
    </div>
  );
};

export default ForgotPassword;
