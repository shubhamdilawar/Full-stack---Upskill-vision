import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css"; // Optional: Add styles for the dashboard

const Dashboard = () => {
  const navigate = useNavigate();

  // Handle logout (clears user data and redirects to login page)
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token if JWT is implemented
    navigate("/"); // Redirect to the login page
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to the Dashboard</h1>
      <p>Here’s where you can access your app features and data.</p>

      {/* Sample navigation options */}
      <div className="dashboard-actions">
        <button onClick={() => alert("Feature 1 Coming Soon!")}>
          Feature 1
        </button>
        <button onClick={() => alert("Feature 2 Coming Soon!")}>
          Feature 2
        </button>
      </div>

      {/* Logout button */}
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
