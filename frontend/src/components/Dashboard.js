import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import axios from 'axios';
import BannerImage from '../assets/banner.png';

const Dashboard = () => {
    const [userRole, setUserRole] = useState(null);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
        const channel = new BroadcastChannel('auth');


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
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get("http://127.0.0.1:5000/auth/current_user", {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.status === 200) {
                        setUserRole(response.data.role);
                    } else {
                        console.error("Failed to fetch user data:", response);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
         const fetchCourses = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get("http://127.0.0.1:5000/courses/courses", {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                     if (response.status === 200) {
                        setCourses(response.data.courses);
                     } else {
                        console.error("Failed to fetch courses:", response);
                    }
                } catch (error) {
                    console.error("Error fetching courses:", error);
                }
            }
         };
        fetchUserData();
        fetchCourses();
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
    }, [navigate,channel]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
         localStorage.removeItem("user_id");
        localStorage.removeItem("loginEvent");
        channel.postMessage('logout');
        navigate("/");
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
                    <span>Welcome, Participant</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            {/* Added Banner Image */}
             <div className="banner">
                <img src={BannerImage} alt="Banner" />
            </div>

            <div className="content">
                <input type="text" placeholder="Search..." className="search-bar" />

                <div>
                <h3>Available Courses</h3>
                <ul className="course-list">
                    {courses.map(course => (
                        <li key={course.id} className="course-item">
                            <h4>{course.course_title}</h4>
                            <p>Instructor: {course.instructor_name}</p>
                            <p>{course.description}</p>
                            <p>Start Date: {course.start_date}</p>
                             <p>End Date: {course.end_date}</p>
                        </li>
                    ))}
                </ul>
                </div>

                <div>
                    <h3>Announcements</h3>
                    <p>No new announcements.</p>
                </div>
            </div>
            <p className="inspirational-quote">"The best way to predict the future is to create it." — Peter Drucker</p>
        </div>
    );
};

export default Dashboard;