import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";
import '../styles/CreateCourse.css';

const CreateCourse = () => {
    const [courseTitle, setCourseTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructorEmail, setInstructorEmail] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
     useEffect(() => {
         const fetchUserData = async () => {
              const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get("http://127.0.0.1:5000/auth/current_user", {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.status === 200) {
                        setUserRole(response.data.role);
                        setCurrentUserId(response.data.id)
                    } else {
                        console.error("Failed to fetch user data:", response);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
         };
        fetchUserData()
    }, []);
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates.');
      return;
    }

    if (endDate <= startDate) {
      setErrorMessage('End date must be after start date.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setErrorMessage('You must be logged in to create a course.');
        return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/courses/create_course', {
        course_title: courseTitle,
        description: description,
        instructor_email: instructorEmail,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      }, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

       if (response.status === 201) {
            setSuccessMessage('Course created successfully!');
            setCourseTitle('');
            setDescription('');
             setInstructorEmail('');
            setStartDate(null);
            setEndDate(null);
           if(userRole === "Instructor") {
                navigate("/instructor-dashboard");
           }
           else if(userRole === "HR Admin") {
               navigate("/hr-admin-dashboard");
           }
            else if(userRole === "Manager") {
                 navigate("/manager-dashboard");
            }
        } else {
            setErrorMessage(response.data.message || 'Failed to create course.');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setErrorMessage(
        error.response?.data?.message || 'An error occurred while creating the course.'
      );
    }
  };

    return (
         <div className="create-course-container">
            <div className="create-course-form">
            <h2>Create New Course</h2>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleCreateCourse}>
                 <div className="form-group">
                    <label htmlFor="courseTitle">Course Title:</label>
                    <input
                      type="text"
                      id="courseTitle"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      required
                        />
                  </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="instructorEmail">Instructor Email:</label>
                    <input
                      type="email"
                      id="instructorEmail"
                      value={userRole === 'Instructor' ?  localStorage.getItem('user_id') : instructorEmail}
                      onChange={(e) => setInstructorEmail(e.target.value)}
                         placeholder = {userRole === "Instructor" ? currentUserId:  "Enter Instructor Email" }
                      required
                         disabled = {userRole === "Instructor"}

                    />
                </div>

                <div className="form-group">
                    <label htmlFor="startDate">Start Date:</label>
                    <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd-MM-yyyy"
                        required
                         placeholderText="dd-mm-yyyy"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="endDate">Projected End Date:</label>
                    <DatePicker
                      id="endDate"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="dd-MM-yyyy"
                      required
                       placeholderText="dd-mm-yyyy"
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Submit
                </button>
            </form>
         </div>
        </div>
    );
};

export default CreateCourse;