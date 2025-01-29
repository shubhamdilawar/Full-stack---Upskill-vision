import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import axios from '../utils/axios';
import BannerImage from '../assets/banner.png';
import CourseOverview from './CourseOverview';

const Dashboard = () => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [channel] = useState(new BroadcastChannel('auth'));
    
    

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'loginEvent' && event.newValue === 'loggedIn') {
                const token = localStorage.getItem('token');
                if (token) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("user_id");
                    navigate("/");
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const fetchUserData = async () => {
            try {
                const response = await axios.get('/auth/current_user');
                if (response.status === 200) {
                    setUserRole(response.data.role);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data");
                setLoading(false);
            }
        };

        fetchUserData();

        channel.onmessage = (event) => {
            if (event.data === 'logout') {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user_id");
                navigate("/");
            }
        };

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            channel.close();
        };
    }, [navigate, channel]);

    const handleLogout = () => {
        try {
            if (channel) {
                try {
                    channel.postMessage('logout');
                } catch (error) {
                    console.log('Channel already closed');
                }
                channel.close();
            }
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            localStorage.clear();
            navigate('/login');
        }
    };
    const handleViewDetails = (courseId) => {
        try {
            if (!courseId) {
                console.error('Course ID is missing');
                return;
            }
            // Add validation for courseId format
            if (typeof courseId !== 'string' || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
                console.error('Invalid course ID format:', courseId);
                return;
            }
            console.log('Navigating to course details:', courseId);
            navigate(`/participantdashboard/${courseId}/viewdetails`);
        } catch (error) {
            console.error('Error handling view details:', error);
        }
    };

    

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 style={{ display: 'flex', alignItems: 'center' }}>
                    Upskill Vision
                    {userRole && (
                        <span className="dashboard-tag">
                            {userRole} Dashboard
                        </span>
                    )}
                </h1>
                <div className="user-info">
                    <span>Welcome, {userRole}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            <div className="banner">
                <img src={BannerImage} alt="Banner" />
            </div>

            <div className="content">
                <CourseOverview onViewDetails={handleViewDetails} />
            </div>
            
            <div className="inspirational-quote">
                "The best way to predict the future is to create it." — Peter Drucker
            </div>

            <div className="dashboard-actions">
                <button 
                    className="progress-btn"
                    onClick={() => navigate('/progress')}
                >
                    View Learning Progress
                </button>
            </div>
        </div>
    );
};

export default Dashboard;