import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/CourseDetailsModal.css';

const CourseDetailsModal = ({ course, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [courseStats, setCourseStats] = useState({
        totalEnrolled: 0,
        averageProgress: 0,
        completionRate: 0
    });

    useEffect(() => {
        fetchCourseDetails();
    }, [course.course_id]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/courses/${course.course_id}/details`);
            const { enrollments, stats } = response.data;
            setEnrollments(enrollments);
            setCourseStats(stats);
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content course-details" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>{course.course_title}</h2>

                {loading ? (
                    <div className="loading">Loading course details...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <div className="course-overview">
                            <h3>Course Overview</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h4>Total Enrolled</h4>
                                    <p>{courseStats.totalEnrolled}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>Average Progress</h4>
                                    <p>{courseStats.averageProgress}%</p>
                                </div>
                                <div className="stat-card">
                                    <h4>Completion Rate</h4>
                                    <p>{courseStats.completionRate}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="course-info">
                            <h3>Course Information</h3>
                            <div className="info-grid">
                                <div>
<<<<<<< HEAD
                                    <strong>Category:</strong> {course.category || 'Programming'}
                                </div>
                                <div>
                                    <strong>Difficulty:</strong> {course.difficulty_level || 'Intermediate'}
=======
                                    <strong>Category:</strong> {course.category}
                                </div>
                                <div>
                                    <strong>Difficulty:</strong> {course.difficulty_level}
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
                                </div>
                                <div>
                                    <strong>Duration:</strong> {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
                                </div>
                                <div>
<<<<<<< HEAD
                                    <strong>Max Participants:</strong> {course.max_participants || '30'}
=======
                                    <strong>Max Participants:</strong> {course.max_participants}
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
                                </div>
                            </div>
                            <div className="description">
                                <h4>Description</h4>
                                <p>{course.description}</p>
                            </div>
                            <div className="prerequisites">
                                <h4>Prerequisites</h4>
<<<<<<< HEAD
                                <p>{course.prerequisites || 'None' }</p>
                            </div>
                            <div className="learning-outcomes">
                                <h4>Learning Outcomes</h4>
                                <p>{course.learning_outcomes || 'Enhance skills'}</p>
=======
                                <p>{course.prerequisites || 'None'}</p>
                            </div>
                            <div className="learning-outcomes">
                                <h4>Learning Outcomes</h4>
                                <p>{course.learning_outcomes}</p>
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
                            </div>
                        </div>

                        <div className="enrolled-students">
                            <h3>Enrolled Students</h3>
                            <div className="students-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Email</th>
                                            <th>Progress</th>
                                            <th>Last Active</th>
                                            <th>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map(student => (
                                            <tr key={student.student_id}>
                                                <td>{student.name}</td>
                                                <td>{student.email}</td>
                                                <td>
                                                    <div className="progress-bar">
                                                        <div 
                                                            className="progress" 
                                                            style={{width: `${student.progress}%`}}
                                                        />
                                                        <span>{student.progress}%</span>
                                                    </div>
                                                </td>
                                                <td>{new Date(student.last_active).toLocaleDateString()}</td>
                                                <td>
                                                    <div className={`performance ${student.performance.toLowerCase()}`}>
                                                        {student.performance}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CourseDetailsModal; 