import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import axios from '../utils/axios';
import BannerImage from '../assets/banner.png';
import CourseOverview from './CourseOverview';

const Dashboard = () => {
    const [userRole, setUserRole] = useState(null);
<<<<<<< HEAD
=======
    const [courses, setCourses] = useState([]);
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [channel] = useState(new BroadcastChannel('auth'));
<<<<<<< HEAD
    
    
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

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
<<<<<<< HEAD
=======
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await axios.get('/courses/courses');
                if (response.data && Array.isArray(response.data.courses)) {
                    setCourses(response.data.courses);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError('Error fetching courses');
                setCourses([]);
                setLoading(false);
                if (error.response?.status === 401) {
                    navigate('/login');
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data");
                setLoading(false);
            }
        };

        fetchUserData();
<<<<<<< HEAD
=======
        fetchCourses();
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8

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
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user_id");
            localStorage.removeItem("loginEvent");
            
            if (channel) {
                channel.postMessage('logout');
                channel.close();
            }
            
            navigate("/");
        } catch (error) {
            console.error('Error during logout:', error);
            navigate("/");
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

    

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

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
<<<<<<< HEAD
                <CourseOverview onViewDetails={handleViewDetails} />
=======
                <CourseOverview />
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
            </div>
            
            <div className="inspirational-quote">
                "The best way to predict the future is to create it." — Peter Drucker
            </div>
        </div>
    );
};

export default Dashboard;