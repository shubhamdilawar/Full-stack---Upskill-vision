import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
<<<<<<< HEAD
import ModuleManager from './ModuleManager';
=======
<<<<<<< HEAD
import ModuleManager from './ModuleManager';
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
import '../styles/CourseDetails.css';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState(null);
<<<<<<< HEAD
    const [activeTab, setActiveTab] = useState('overview');
    const [userRole, setUserRole] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
=======
<<<<<<< HEAD
    const [activeTab, setActiveTab] = useState('overview');
    const [userRole, setUserRole] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
=======
    const [showEditModal, setShowEditModal] = useState(false);
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
    const [stats, setStats] = useState({
        totalEnrolled: 0,
        activeStudents: 0,
        completedStudents: 0,
        averageProgress: 0
    });

<<<<<<< HEAD
    useEffect(() => {
        const fetchData = async () => {
        try {
            setLoading(true);
=======
<<<<<<< HEAD
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                const role = localStorage.getItem('role');
                const userId = localStorage.getItem('user_id');
                setUserRole(role);

                const response = await axios.get(`/courses/${courseId}/details`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data) {
                    const courseData = response.data.course || response.data;
                    setCourse(courseData);
                    setIsOwner(courseData.instructor_id === userId);

<<<<<<< HEAD
            if (response.data.enrollmentStats) {
                setStats({
                    totalEnrolled: response.data.enrollmentStats.totalEnrolled || 0,
                    activeStudents: response.data.enrollmentStats.activeStudents || 0,
                    completedStudents: response.data.enrollmentStats.completedStudents || 0,
                    averageProgress: response.data.enrollmentStats.averageProgress || 0
                });
            }
=======
                    if (response.data.enrollmentStats) {
                        setStats({
                            totalEnrolled: response.data.enrollmentStats.totalEnrolled || 0,
                            activeStudents: response.data.enrollmentStats.activeStudents || 0,
                            completedStudents: response.data.enrollmentStats.completedStudents || 0,
                            averageProgress: response.data.enrollmentStats.averageProgress || 0
                        });
                    }
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                }
            } catch (err) {
                console.error('Error fetching course details:', err);
                setError('Failed to load course details');
<<<<<<< HEAD
        } finally {
            setLoading(false);
        }
    };
=======
            } finally {
                setLoading(false);
            }
        };
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983

        fetchData();
    }, [courseId]);

    const renderOverview = () => {
        const currentStats = stats || {
            totalEnrolled: 0,
            activeStudents: 0,
            completedStudents: 0,
            averageProgress: 0
        };

        return (
            <div className="overview-section">
                <div className="course-info">
                    <h3>Course Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Instructor:</label>
                            <span>{course?.instructor_name || 'Unknown'}</span>
                        </div>
                        <div className="info-item">
                            <label>Description:</label>
                            <p>{course?.description || 'No description available'}</p>
                        </div>
                        <div className="info-item">
                            <label>Duration:</label>
                            <span>{course?.duration ? `${course.duration} days` : 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                            <label>Start Date:</label>
                            <span>
                                {course?.start_date 
                                    ? new Date(course.start_date).toLocaleDateString() 
                                    : 'Not set'}
                            </span>
                        </div>
                        <div className="info-item">
                            <label>End Date:</label>
                            <span>
                                {course?.end_date 
                                    ? new Date(course.end_date).toLocaleDateString() 
                                    : 'Not set'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="course-stats">
                    <div className="stat-item">
                        <label>Total Enrolled</label>
                        <span>{currentStats.totalEnrolled}</span>
                    </div>
                    <div className="stat-item">
                        <label>Active Students</label>
                        <span>{currentStats.activeStudents}</span>
                    </div>
                    <div className="stat-item">
                        <label>Completed</label>
                        <span>{currentStats.completedStudents}</span>
                    </div>
                    <div className="stat-item">
                        <label>Average Progress</label>
                        <span>{Math.round(currentStats.averageProgress)}%</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderParticipants = () => (
        <div className="participants-section">
            <h3>Course Participants</h3>
            {course?.enrollments && course.enrollments.length > 0 ? (
                course.enrollments.map(enrollment => (
                    <div key={enrollment.student_id} className="participant-item">
                        <span>{enrollment.student_name || 'Unknown Student'}</span>
                        <div className="participant-info">
                            <span className="status">{enrollment.status}</span>
                            <span className="progress">Progress: {enrollment.progress || 0}%</span>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-participants">No participants enrolled yet.</p>
            )}
        </div>
    );

    const renderAssignments = () => {
        const currentStats = stats || {
            totalEnrolled: 0,
            activeStudents: 0,
            completedStudents: 0,
            averageProgress: 0
        };

        return (
            <div className="assignments-section">
                <h3>Course Assignments</h3>
                {course?.assignments && course.assignments.length > 0 ? (
                    <div className="assignments-list">
                        {course.assignments.map(assignment => (
                            <div key={assignment._id} className="assignment-item">
                                <div className="assignment-header">
                                    <h4>{assignment.title}</h4>
                                    <div className="assignment-stats">
                                        <span className="submissions">
                                            Submissions: {assignment.submissions_count || 0}/
                                            {currentStats.totalEnrolled}
                                        </span>
                                        <span className="due-date">
                                            Due: {assignment.due_date 
                                                ? new Date(assignment.due_date).toLocaleDateString()
                                                : 'Not set'}
                                        </span>
                                    </div>
                                </div>
                                <p>{assignment.description || 'No description available'}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-assignments">No assignments created yet.</p>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'modules':
                return <ModuleManager courseId={courseId} />;
            case 'participants':
                return renderParticipants();
            case 'assignments':
                return renderAssignments();
            default:
                return renderOverview();
<<<<<<< HEAD
=======
=======
    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`/courses/${courseId}/details`);
            console.log('Course details response:', response.data);

            if (!response.data) {
                throw new Error('No data received from server');
            }

            // Set course data
            setCourse(response.data.course || response.data);

            // Set enrollment statistics
            if (response.data.enrollmentStats) {
                setStats({
                    totalEnrolled: response.data.enrollmentStats.totalEnrolled || 0,
                    activeStudents: response.data.enrollmentStats.activeStudents || 0,
                    completedStudents: response.data.enrollmentStats.completedStudents || 0,
                    averageProgress: response.data.enrollmentStats.averageProgress || 0
                });
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError(error.response?.data?.message || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId]);

    const handleEditCourse = async (courseData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.put(
                `/courses/update-course/${courseId}`,
                courseData
            );

            if (response.status === 200) {
                await fetchCourseDetails();
                setShowEditModal(false);
            }
        } catch (error) {
            console.error('Error updating course:', error);
            setError(error.response?.data?.message || 'Failed to update course');
        } finally {
            setLoading(false);
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
        }
    };

    if (loading) return <div className="loading">Loading course details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!course) return <div className="error-message">Course not found</div>;

    return (
        <div className="course-details-page">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back
                </button>
                <h1>{course.course_title}</h1>
            </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
            {userRole === 'Instructor' && isOwner && (
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab ${activeTab === 'modules' ? 'active' : ''}`}
                        onClick={() => setActiveTab('modules')}
                    >
                        Modules
                    </button>
                    <button 
                        className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        Assignments
                    </button>
                    <button 
                        className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        Participants
                    </button>
                </div>
            )}

            <div className="content">
                {renderContent()}
<<<<<<< HEAD
=======
=======
            <div className="course-info-section">
                <h2>Course Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Instructor:</label>
                        <span>{course.instructor_name || 'Unknown'}</span>
                    </div>
                    <div className="info-item">
                        <label>Start Date:</label>
                        <span>{course.start_date ? new Date(course.start_date).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="info-item">
                        <label>End Date:</label>
                        <span>{course.end_date ? new Date(course.end_date).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="info-item">
                        <label>Duration:</label>
                        <span>{course.duration ? `${course.duration} days` : 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                        <label>Status:</label>
                        <span>{course.status || 'Unknown'}</span>
                    </div>
                </div>
                <div className="description">
                    <h3>Description</h3>
                    <p>{course.description || 'No description available'}</p>
                </div>
            </div>

            <div className="course-stats">
                <div className="stat-item">
                    <label>Total Enrolled</label>
                    <span>{stats.totalEnrolled}</span>
                </div>
                <div className="stat-item">
                    <label>Active Students</label>
                    <span>{stats.activeStudents}</span>
                </div>
                <div className="stat-item">
                    <label>Completed</label>
                    <span>{stats.completedStudents}</span>
                </div>
                <div className="stat-item">
                    <label>Average Progress</label>
                    <span>{Math.round(stats.averageProgress)}%</span>
                </div>
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
            </div>
        </div>
    );
};

export default CourseDetails;