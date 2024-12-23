import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Signup.css";

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleFirstNameChange = (e) => setFirstName(e.target.value);
    const handleLastNameChange = (e) => setLastName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
    const handleRoleChange = (e) => setRole(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const signupData = {
            firstName,
            lastName,
            email,
            password,
            role,
        };

        try {
            const response = await axios.post("http://127.0.0.1:5000/auth/signup", signupData);

            if (response.status === 201) {
                console.log("Signup successful:", response.data);
                navigate("/");
            } else {
                console.error("Signup failed:", response.data.message);
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error("Error during signup:", error);
            setErrorMessage("An error occurred during signup. Please try again.");
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
                    <select value={role} onChange={handleRoleChange} className="input-field dropdown" required>
                        <option value="" disabled>
                            Please Select
                        </option>
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

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <button type="submit" className="signup-btn">
                        Create Account
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