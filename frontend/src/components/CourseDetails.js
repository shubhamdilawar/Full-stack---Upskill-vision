import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/CourseDetails.css';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [stats, setStats] = useState({
        totalEnrolled: 0,
        activeStudents: 0,
        completedStudents: 0,
        averageProgress: 0
    });

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
            </div>
        </div>
    );
};

export default CourseDetails;