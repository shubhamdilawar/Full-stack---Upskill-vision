import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

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
      const response = await fetch("http://127.0.0.1:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Show success message
        setStage(2); // Move to OTP stage
      } else {
        alert(result.message); // Show error (e.g., Email not registered)
      }
    } catch (error) {
      console.error("Error during email submission:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Handle OTP Verification (Stage 2)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Show success message
        setStage(3); // Move to Reset Password stage
      } else {
        alert(result.message); // Show error (e.g., Invalid OTP)
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Handle Password Reset (Stage 3)
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Show success message
        navigate("/"); // Redirect to login page
      } else {
        alert(result.message); // Show error
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      alert("An error occurred. Please try again.");
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
