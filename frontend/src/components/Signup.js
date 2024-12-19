import React, { useState } from "react";
import "../styles/Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [firstName, setFirstName] = useState(""); // First name state
  const [lastName, setLastName] = useState("");   // Last name state
  const [email, setEmail] = useState("");         // Email state
  const [password, setPassword] = useState("");   // Password state
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password state
  const [role, setRole] = useState("");           // Role state
  const navigate = useNavigate();

  // Handle form field changes
  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
  const handleRoleChange = (e) => setRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Prepare the data to send to the backend
    const signupData = {
      firstName,
      lastName,
      email,
      password,
      role,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData), // Send data to the backend
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Signup successful:", result);
        // Navigate to login page after successful signup
        navigate("/");
      } else {
        console.error("Signup failed:", result.message);
        // Show an error if signup fails
        alert("Signup failed. " + result.message);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup.");
    }
  };

  return (
    <div className="signup-container">
      <div className="left-section">
      <h1 style={{ color: "black" }}>Upskill Vision</h1>

      </div>
      <div className="right-section">
        <h1>Create Account</h1>
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

          <div className="name-fields">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={handleFirstNameChange}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={handleLastNameChange}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />

          <button type="submit" className="signup-btn">Create Account</button>
        </form>
        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/")} className="link">Login</span>
        </p>
        <div className="google-login">
          <hr /> or <hr />
        </div>
        <button className="google-btn">
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
          Sign up with Google
        </button>
      </div>
    </div>
  );
};

export default Signup;
