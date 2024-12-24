import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import illustration from "../assets/login-illustration.png";
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const channel = new BroadcastChannel('auth');


    useEffect(() => {
      const token = localStorage.getItem('token');
       if(token) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
           localStorage.removeItem("user_id");
        localStorage.setItem('loginEvent', 'loggedIn');
          channel.postMessage('logout');
          navigate("/");
        }
    }, [navigate, channel]);

    const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };


   const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
     localStorage.removeItem("user_id");

    const loginData = { email, password, role };

    try {
        const response = await axios.post("http://127.0.0.1:5000/auth/login", loginData);

      if (response.status === 200) {
        if (response.data.message === "Login successful!") {
            console.log("Login successful:", response.data);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("user_id", response.data.user_id);
                // Notify other tabs of login
                localStorage.setItem('loginEvent', 'loggedIn');
                channel.postMessage('logout');
                // Redirect based on the role received from the backend
                if (response.data.role === "HR Admin") {
                    navigate("/hr-admin-dashboard");
                } else if (response.data.role === "Instructor") {
                   navigate("/instructor-dashboard");
               } else if (response.data.role === "Manager") {
                    navigate("/manager-dashboard");
               } else if (response.data.role === "Participant") {
                     navigate("/dashboard");
               }
           } else if (response.data.message === "Admin approval required") {
                setErrorMessage("Admin approval required. Please wait for confirmation.");
          } else {
                setErrorMessage(response.data.message);
         }
      } else if (response.status === 403) {
            setErrorMessage("Admin approval required. Please wait for confirmation.");
       } else {
            setErrorMessage("An error occurred during login. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        if (error.response && error.response.status === 403) {
            setErrorMessage("Admin approval required. Please wait for confirmation.");
        } else if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
       } else {
            setErrorMessage("An error occurred during login. Please try again.");
       }
     }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <h1 className="brand-title" style={{ color: "black" }}>Upskill Vision</h1>
        <img src={illustration} alt="Illustration" className="login-image" />
      </div>

      <div className="right-section">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Role</label>
          <select value={role} onChange={handleRoleChange} className="input-field dropdown" required>
            <option value="" disabled>
              Please Select
            </option>
            <option value="HR Admin">HR Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="Manager">Manager</option>
            <option value="Participant">Participant</option>
          </select>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="input-field"
            value={email}
            onChange={handleEmailChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="input-field"
            value={password}
            onChange={handlePasswordChange}
            required
          />

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="forgot-password">
          <span onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </span>
        </p>

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