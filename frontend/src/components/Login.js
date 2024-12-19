import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import "../styles/Login.css"; 
import illustration from "../assets/login-illustration.png"; // Add illustration image

const Login = () => {
  const [role, setRole] = useState(""); // Manage role state
  const [email, setEmail] = useState(""); // Manage email state
  const [password, setPassword] = useState(""); // Manage password state
  const [errorMessage, setErrorMessage] = useState(""); // Manage error messages
  const navigate = useNavigate(); // Handle navigation between pages

  const handleRoleChange = (e) => {
    setRole(e.target.value); // Update role state when a user selects a role
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value); // Update email state
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Update password state
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setErrorMessage(""); // Clear previous error messages
    console.log("Login Submitted:", { role, email, password }); // Print data for testing

    // Prepare data for backend API
    const loginData = { email, password, role };

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData), // Sending the login data to the backend
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Login successful:", result);
        // Store token and role in localStorage
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        console.error("Login failed:", result.message);
        setErrorMessage(result.message); // Display error message
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {/* Left section with illustration and heading */}
      <div className="left-section">
        <h1 className="brand-title" style={{ color: "black" }}>Upskill Vision</h1>
        <img src={illustration} alt="Illustration" className="login-image" /> {/* Illustration image */}
      </div>

      {/* Right section with form and buttons */}
      <div className="right-section">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Role selection dropdown */}
          <label>Role</label>
          <select value={role} onChange={handleRoleChange} className="input-field dropdown" required>
            <option value="" disabled>Please Select</option>
            <option value="HR Admin">HR Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="Manager">Manager</option>
            <option value="Participant">Participant</option>
          </select>

          {/* Email input field */}
          <label>Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="input-field" 
            value={email} 
            onChange={handleEmailChange} 
            required 
          />

          {/* Password input field */}
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            className="input-field" 
            value={password} 
            onChange={handlePasswordChange} 
            required 
          />

          {/* Error Message */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Submit button */}
          <button type="submit" className="login-btn">Login</button>
        </form>

        {/* Forgot password link */}
        <p className="forgot-password">
          <span onClick={() => navigate("/forgot-password")}>Forgot Password?</span>
        </p>

        {/* Google login section */}
        <div className="google-login">
          <hr /> or <hr />
        </div>
        <button className="google-btn">
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
          Sign in with Google
        </button>

        <p className="create-account">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")} className="no-link">
            SignUp
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
