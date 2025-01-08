import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import illustration from "../assets/login-illustration.png";
import axios from '../utils/axios';

const Login = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const channel = new BroadcastChannel('auth');

  // Clear any existing auth data on mount
  useEffect(() => {
    localStorage.clear();
    return () => channel.close();
  }, []);

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
    setLoading(true);
    setError('');

    try {
        console.log('Sending login request:', { email, password, role });
        const response = await axios.post('/auth/login', {
            email,
            password,
            role
        });

        console.log('Login response:', response.data);

        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('loginEvent', 'loggedIn');

            console.log('Login successful, redirecting...', response.data.role);

            // Redirect based on role
            switch (response.data.role) {
                case 'HR Admin':
                    console.log('Navigating to HR Admin Dashboard...');
                    navigate('/hr-admin-dashboard');
                    break;
                case 'Manager':
                    navigate('/manager-dashboard');
                    break;
                case 'Instructor':
                    navigate('/instructor-dashboard');
                    break;
                case 'Participant':
                    navigate('/dashboard');
                    break;
                default:
                    setError('Invalid user role');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.response?.status === 403) {
            // Account not approved
            setError(error.response.data.message || 'Your account is pending approval');
        } else {
            setError(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Failed to login. Please check your credentials.'
            );
        }
    } finally {
        setLoading(false);
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

          {error && <p className="error-message">{error}</p>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
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