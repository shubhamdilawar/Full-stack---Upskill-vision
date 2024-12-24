import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import axios from 'axios';
import BannerImage from '../assets/banner.png';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
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
    }, [navigate, channel]);
    const handleLogout = () => {
         localStorage.removeItem("token");
        localStorage.removeItem("role");
         localStorage.removeItem("user_id");
         localStorage.removeItem("loginEvent");
          channel.postMessage('logout');
        navigate("/");
    };
     const handleRemoveCourse = async (courseId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`http://127.0.0.1:5000/courses/remove_course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
             if(response.status === 200) {
                  setCourses(courses.filter(course => course.id !== courseId));
            }
        }
        catch(error) {
            console.error("Error removing user:", error);
        }
     };
    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 style={{ display: 'flex', alignItems: 'center' }}>
                    Upskill Vision
                     <span className="dashboard-tag">Instructor Dashboard</span>
                </h1>
                <div className="user-info">
                    <span>Welcome, Instructor</span>
                     <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
           <div className="banner">
                <img src={BannerImage} alt="Banner" />
            </div>

            <div className="content">
                <div className="dashboard-actions">
                    <button onClick={() => navigate("/create-course")}>
                        Create Your Course
                    </button>
                </div>
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
                                  <button className="remove-btn" onClick={() => handleRemoveCourse(course.id)}>x</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <p className="inspirational-quote">"The best way to predict the future is to create it." — Peter Drucker</p>
        </div>
    );
};

export default InstructorDashboard;