import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../utils/axios';
import "../styles/Signup.css";

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleFirstNameChange = (e) => setFirstName(e.target.value);
    const handleLastNameChange = (e) => setLastName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
    const handleRoleChange = (e) => setRole(e.target.value);

    // Add email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Add password strength validation
    const isStrongPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Email validation
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Password strength validation
        if (!isStrongPassword(password)) {
            setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            setLoading(false);
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // First check if email is available
            console.log('Checking email availability for:', email);
            const checkEmailResponse = await axios.post('/auth/check-email', { 
                email 
            });

            if (!checkEmailResponse.data.available) {
                setError('Email is already registered');
                setLoading(false);
                return;
            }

            // Proceed with signup
            const signupResponse = await axios.post('/auth/signup', {
                firstName,
                lastName,
                email,
                password,
                role
            });

            if (signupResponse.status === 201) {
                setSuccess('Signup successful! Waiting for admin approval.');
                setError('');
                
                // Clear form
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRole('');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError(error.response?.data?.message || 'An error occurred during signup. Please try again.');
        } finally {
            setLoading(false);
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
                    <label>Role</label>
                    <select 
                        value={role} 
                        onChange={handleRoleChange} 
                        className="input-field dropdown" 
                        required
                    >
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

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button 
                        type="submit" 
                        className="signup-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/")} className="link">
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Signup;