import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/StudentDetails.css';

const StudentDetails = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        fetchStudentDetails();
    }, [courseId, studentId]);

    const fetchStudentDetails = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/students/${studentId}/details`);
            setStudentData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Failed to load student details');
            setLoading(false);
        }
    };

    const QuizAttempts = ({ attempts }) => {
        return (
            <div className="quiz-attempts-section">
                <h3>Quiz Attempts</h3>
                <div className="quiz-attempts-list">
                    {attempts.map((attempt, index) => (
                        <div key={index} className="quiz-attempt-item">
                            <div className="attempt-header">
                                <h4>{attempt.quiz_title}</h4>
                                <span className={`status-badge ${attempt.passed ? 'passed' : 'failed'}`}>
                                    {attempt.passed ? 'Passed' : 'Failed'}
                                </span>
                            </div>
                            
                            <div className="attempt-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Score:</span>
                                    <span className="stat-value">{attempt.score}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Correct Answers:</span>
                                    <span className="stat-value">{attempt.correct_answers} / {attempt.total_questions}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Attempt Date:</span>
                                    <span className="stat-value">
                                        {new Date(attempt.submitted_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Attempt Number:</span>
                                    <span className="stat-value">{attempt.attempt_number}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading">Loading student details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!studentData) return <div className="error-message">Student not found</div>;

    return (
        <div className="student-details-page">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back to Course
                </button>
                <h1>{studentData.name}'s Progress</h1>
            </div>

            <div className="student-info">
                <div className="basic-info">
                    <h2>Student Information</h2>
                    <p><strong>Email:</strong> {studentData.email}</p>
                    <p><strong>Enrollment Date:</strong> {new Date(studentData.enrollment_date).toLocaleDateString()}</p>
                    <p><strong>Overall Progress:</strong> {studentData.progress}%</p>
                </div>

                <div className="performance-metrics">
                    <h2>Performance Metrics</h2>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <h3>Assignments</h3>
                            <p>Completed: {studentData.assignments_completed}/{studentData.total_assignments}</p>
                            <p>Average Score: {studentData.assignment_average}%</p>
                        </div>
                        <div className="metric-card">
                            <h3>Quizzes</h3>
                            <p>Completed: {studentData.quizzes_completed}/{studentData.total_quizzes}</p>
                            <p>Average Score: {studentData.quiz_average}%</p>
                        </div>
                    </div>
                </div>

                <div className="activity-timeline">
                    <h2>Recent Activity</h2>
                    <div className="timeline">
                        {studentData.recent_activities?.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-date">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                </div>
                                <div className="activity-content">
                                    <h4>{activity.type}</h4>
                                    <p>{activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails; 