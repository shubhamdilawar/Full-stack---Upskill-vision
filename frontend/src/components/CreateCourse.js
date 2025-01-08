import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";
import '../styles/CreateCourse.css';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('All');
    const [courseTitle, setCourseTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructorEmail, setInstructorEmail] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [instructorData, setInstructorData] = useState({
        name: '',
        email: '',
        id: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/auth/current_user');
                if (response.data) {
                    setInstructorData({
                        name: response.data.name || '',
                        email: response.data.email || '',
                        id: response.data._id || ''
                    });
                    setInstructorEmail(response.data.email || '');
                    setUserRole(response.data.role || '');
                    setCurrentUserId(response.data._id || '');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Don't show error to user if it's just the current_user endpoint
                if (!error.response || error.response.status !== 404) {
                    setError('Failed to load user data');
                    setErrorMessage('Failed to load user data');
                }
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await axios.get(
                    `http://127.0.0.1:5000/courses/filter?status=${filter}&user_id=${currentUserId || 1}`,
                    { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
                );
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError('Failed to fetch courses');
                setErrorMessage('Failed to fetch courses');
            }
        };

        fetchUserData();
        fetchCourses();
    }, [filter, currentUserId]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!startDate || !endDate || endDate <= startDate) {
            setErrorMessage('Ensure valid start and end dates.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:5000/courses/create_course', {
                course_title: courseTitle,
                description: description,
                instructor_email: instructorEmail,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 201) {
                setSuccessMessage('Course created successfully!');
                setCourseTitle('');
                setDescription('');
                setInstructorEmail('');
                setStartDate(null);
                setEndDate(null);
                navigate(userRole === "Instructor" ? "/instructor-dashboard" : "/dashboard");
            } else {
                setErrorMessage(response.data.message || 'Failed to create course.');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error creating course.');
        }
    };

    const enrollInCourse = async (courseId) => {
        try {
            const response = await axios.post(
                `http://127.0.0.1:5000/courses/enroll/${courseId}`,
                { user_id: currentUserId },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            alert(response.data.message);
        } catch (error) {
            console.error("Error enrolling in course:", error);
        }
    };

    return (
        <div className="course-management-container">
            {/* Create Course Section */}
            <div className="create-course-form">
                <h2>Create New Course</h2>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleCreateCourse}>
                    {/* Course creation fields */}
                </form>
            </div>

            {/* Course Overview Section */}
            <div className="course-overview">
                <h2>Course Overview</h2>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="All">All Courses</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Completed">Completed</option>
                </select>
                <div>
                    {courses.map((course) => (
                        <div key={course.id}>
                            <h3>{course.title}</h3>
                            <p>Instructor: {course.instructor}</p>
                            <button onClick={() => enrollInCourse(course.id)}>Enroll</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;
