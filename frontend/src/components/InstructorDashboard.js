import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import axios from '../utils/axios';
import BannerImage from '../assets/banner.png';
import AdminEditSuite from './AdminEditSuite';
import CreateCourseModal from './CreateCourseModal';
import EditCourseModal from './EditCourseModal';
import CourseDetailsModal from './CourseDetailsModal';
import AuditTrail from './AuditTrail';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [ownCourses, setOwnCourses] = useState([]);
    const [instructorName, setInstructorName] = useState('Instructor');
    const [channel] = useState(new BroadcastChannel('auth'));
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAuditTrail, setShowAuditTrail] = useState(false);

    useEffect(() => {
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        const userId = localStorage.getItem('user_id');

        console.log('Current instructor details:', {
            name: userName,
            email: userEmail,
            id: userId
        });

        if (userName) {
            setInstructorName(userName);
        } else if (userEmail) {
            setInstructorName(userEmail.split('@')[0]);
        }
    }, []);

    const fetchInstructorCourses = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('user_id');
            const userEmail = localStorage.getItem('user_email');
            const userName = localStorage.getItem('user_name');

            if (!token || !userId) {
                navigate('/');
                return;
            }

            console.log('Fetching courses with user details:', {
                userId,
                userEmail,
                userName,
                token: token ? 'Present' : 'Missing'
            });

            const response = await axios.get("/courses/courses");

            console.log('Raw API response:', response.data);

            if (response.data && response.data.courses) {
                const allCourses = response.data.courses;
                const own = allCourses.filter(course => {
                    console.log('Processing course:', course);
                    
                    // Ensure course has required fields
                    if (!course._id) {
                        console.warn('Course missing _id:', course);
                        return false;
                    }

                    const isInstructor = course.instructor_id === userId;
                    
                    console.log('Course ownership check:', {
                        courseId: course._id,
                        instructorId: course.instructor_id,
                        userId,
                        isInstructor
                    });
                    
                    return isInstructor;
                });

                console.log('Filtered own courses:', own);
                setOwnCourses(own);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_name');
                localStorage.removeItem('user_email');
                navigate('/');
            }
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');
        
        console.log('Dashboard Mount:', { token, userId, role });
        
        if (!token || !userId || role !== 'Instructor') {
            console.log('Invalid credentials, redirecting to login');
            localStorage.clear();
            navigate('/login', { replace: true });
            return;
        }

        fetchInstructorCourses();

        return () => {
            console.log('Dashboard unmounting...');
        };
    }, [navigate, fetchInstructorCourses]);

    useEffect(() => {
        const courseUpdateChannel = new BroadcastChannel('course-updates');
        courseUpdateChannel.onmessage = (event) => {
            if (event.data === 'course-created') {
                console.log('Received course-created event, refreshing courses...');
                fetchInstructorCourses();
            }
        };
        return () => courseUpdateChannel.close();
    }, [fetchInstructorCourses]);

    useEffect(() => {
        return () => {
            channel.close();
        };
    }, [channel]);

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user_id");
            localStorage.removeItem("loginEvent");
            
            if (channel) {
                channel.postMessage('logout');
                channel.close();
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
            }
            
            navigate("/");
        } catch (error) {
            console.error('Error during logout:', error);
            navigate("/");
        }
    };

    const handleEditCourse = (course) => {
        try {
            // Validate course object
            if (!course || !course._id) {
                console.error('Invalid course data:', course);
                return;
            }

            console.log('Editing course:', course);
            setSelectedCourse({
                ...course,
                id: course._id  // Ensure we have both id and _id
            });
            setShowEditModal(true);
        } catch (err) {
            console.error('Error preparing course for edit:', err);
        }
    };

    const handleShowDetails = (course) => {
        try {
            // Validate course and course ID
            if (!course || (!course._id && !course.id)) {
                console.error('Invalid course data:', course);
                alert('Cannot view details: Invalid course data');
                return;
            }

            // Get the correct course ID
            const courseId = course._id || course.id;
            
            console.log('Viewing details for course:', {
                courseId,
                course: course
            });

            navigate(`/course/${courseId}/details`);
        } catch (error) {
            console.error('Error navigating to course details:', error);
            alert('Failed to view course details');
        }
    };

    const handleRemoveCourse = async (courseId) => {
        try {
            console.log('Attempting to delete course:', courseId);
            const response = await axios.delete(`/courses/delete_course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // Remove course from state
                setOwnCourses(ownCourses.filter(course => course._id !== courseId));
                alert('Course deleted successfully');
            }
        } catch (error) {
            console.error('Error removing course:', error);
            alert('Failed to delete course. Please try again.');
        }
    };

<<<<<<< HEAD
=======
=======
            }
            
            navigate("/");
        } catch (error) {
            console.error('Error during logout:', error);
            navigate("/");
        }
    };

    const handleEditCourse = (course) => {
        try {
            // Validate course object
            if (!course || !course._id) {
                console.error('Invalid course data:', course);
                return;
            }

            console.log('Editing course:', course);
            setSelectedCourse({
                ...course,
                id: course._id  // Ensure we have both id and _id
            });
            setShowEditModal(true);
        } catch (err) {
            console.error('Error preparing course for edit:', err);
        }
    };

    const handleShowDetails = (course) => {
        try {
            // Validate course and course ID
            if (!course || (!course._id && !course.id)) {
                console.error('Invalid course data:', course);
                alert('Cannot view details: Invalid course data');
                return;
            }

            // Get the correct course ID
            const courseId = course._id || course.id;
            
            console.log('Viewing details for course:', {
                courseId,
                course: course
            });

            navigate(`/course/${courseId}/details`);
        } catch (error) {
            console.error('Error navigating to course details:', error);
            alert('Failed to view course details');
        }
    };

    const handleRemoveCourse = async (courseId) => {
        try {
            // Validate courseId
            if (!courseId) {
                console.error('Invalid course ID:', courseId);
                alert('Cannot delete course: Invalid course ID');
                return;
            }

            // Debug log
            console.log('Attempting to delete course:', {
                courseId,
                userRole: localStorage.getItem('role'),
                userId: localStorage.getItem('user_id')
            });

            // Confirm deletion
            if (!window.confirm('Are you sure you want to remove this course?')) {
                return;
            }

            const response = await axios.delete(`/courses/delete_course/${courseId}`);
            
            if (response.status === 200) {
                console.log('Course deleted successfully:', response.data);
                await fetchInstructorCourses(); // Refresh the courses list
                alert('Course removed successfully');
            }
        } catch (error) {
            console.error('Error removing course:', error);
            alert(error.response?.data?.message || 'Failed to remove course. Please try again.');
        }
    };

>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 style={{ display: 'flex', alignItems: 'center' }}>
                    Upskill Vision
                    <span className="dashboard-tag">Instructor Dashboard</span>
                </h1>
                <div className="user-info">
                    <span>Welcome, {instructorName}</span>
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
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="create-course-btn"
                    >
                        Create New Course
                    </button>
                    <button 
                        onClick={() => setShowAuditTrail(true)}
                        className="audit-trail-btn"
                    >
                        View Audit Trail
                    </button>
                </div>

                <div className="courses-section">
                    <h3>Your Courses</h3>
                    <div className="course-grid">
                        {ownCourses.length > 0 ? (
                            ownCourses.map(course => (
                                <div key={course._id} className="course-card instructor-course">
                                    <h4>{course.course_title}</h4>
                                    <div className="course-info">
                                        <p className="course-id">Course ID: {course._id}</p>
                                        <p><strong>Duration:</strong> {calculateDuration(course.start_date, course.end_date)} days</p>
                                        <p><strong>Start Date:</strong> {new Date(course.start_date).toLocaleDateString()}</p>
                                        <p><strong>End Date:</strong> {new Date(course.end_date).toLocaleDateString()}</p>
                                        <p><strong>Enrolled:</strong> {course.enrolled_count || 0} students</p>
                                    </div>
                                    <div className="course-actions">
                                        <button 
                                            onClick={() => handleEditCourse(course)} 
                                            className="edit-btn"
                                            disabled={!course._id}
                                        >
                                            Edit Course
                                        </button>
                                        <button 
                                            onClick={() => handleShowDetails(course)} 
                                            className="details-btn"
                                            disabled={!course._id}
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveCourse(course._id)} 
                                            className="remove-btn"
                                            disabled={!course._id}
                                        >
                                            Remove Course
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-courses-message">
                                <p>You haven't created any courses yet.</p>
                                <p>Click the "Create New Course" button to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <p className="inspirational-quote">"The best way to predict the future is to create it." — Peter Drucker</p>

            {showCreateModal && (
                <CreateCourseModal
                    onClose={() => setShowCreateModal(false)}
                    onCourseCreated={async () => {
                        console.log('Course created, fetching updated courses...');
                        await fetchInstructorCourses();
                    }}
                />
            )}

            {showEditModal && selectedCourse && (
                <EditCourseModal
                    course={selectedCourse}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCourse(null);
                    }}
                    onCourseUpdated={async () => {
                        console.log('Course updated, fetching updated courses...');
                        await fetchInstructorCourses();
                    }}
                />
            )}

            {showDetailsModal && selectedCourse && (
                <CourseDetailsModal
                    course={selectedCourse}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedCourse(null);
                    }}
                />
            )}

            {showAuditTrail && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button 
                            className="close-btn"
                            onClick={() => setShowAuditTrail(false)}
                        >
                            ×
                        </button>
                        <AuditTrail />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboard;