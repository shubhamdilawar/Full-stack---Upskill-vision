import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
import { Line } from 'react-chartjs-2';
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
import axios from '../utils/axios';
import '../styles/StudentDetails.css';

const StudentDetails = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);
=======
<<<<<<< HEAD
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);
=======
    const [error, setError] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [progressHistory, setProgressHistory] = useState([]);
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983

    useEffect(() => {
        fetchStudentDetails();
    }, [courseId, studentId]);

    const fetchStudentDetails = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/students/${studentId}/details`);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
            setStudentData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Failed to load student details');
<<<<<<< HEAD
=======
=======
            setStudentData(response.data.student);
            setProgressHistory(response.data.progress_history);
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Failed to load student details');
        } finally {
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
            setLoading(false);
        }
    };

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
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
<<<<<<< HEAD
=======
=======
    const progressChartData = {
        labels: progressHistory.map(p => new Date(p.date).toLocaleDateString()),
        datasets: [{
            label: 'Course Progress',
            data: progressHistory.map(p => p.progress),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Progress Over Time'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Progress (%)'
                }
            }
        }
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
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
<<<<<<< HEAD
=======
=======
                <h1>{studentData.name}'s Performance</h1>
            </div>

            <div className="overview-section">
                <div className="student-info">
                    <img 
                        src={studentData.profile_image || '/default-avatar.png'} 
                        alt="Profile" 
                        className="profile-image"
                    />
                    <div className="info-details">
                        <h2>{studentData.name}</h2>
                        <p>{studentData.email}</p>
                        <p>Enrolled: {new Date(studentData.enrollment_date).toLocaleDateString()}</p>
                        <p>Last Active: {new Date(studentData.last_active).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="performance-metrics">
                    <div className="metric-card">
                        <h3>Overall Progress</h3>
                        <div className="progress-circle">
                            <svg viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#eee"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#4caf50"
                                    strokeWidth="3"
                                    strokeDasharray={`${studentData.progress}, 100`}
                                />
                                <text x="18" y="20.35" className="percentage">
                                    {studentData.progress}%
                                </text>
                            </svg>
                        </div>
                    </div>

                    <div className="metric-card">
                        <h3>Assignment Performance</h3>
                        <p className="metric-value">{studentData.metrics.assignments.average_score}%</p>
                        <p className="metric-label">Average Score</p>
                        <p className="completion-rate">
                            {studentData.metrics.assignments.completed}/{studentData.metrics.assignments.total} Completed
                        </p>
                    </div>

                    <div className="metric-card">
                        <h3>Quiz Performance</h3>
                        <p className="metric-value">{studentData.metrics.quizzes.average_score}%</p>
                        <p className="metric-label">Average Score</p>
                        <p className="completion-rate">
                            {studentData.metrics.quizzes.completed}/{studentData.metrics.quizzes.total} Completed
                        </p>
                    </div>
                </div>
            </div>

            <div className="progress-chart">
                <Line data={progressChartData} options={chartOptions} />
            </div>

            <div className="detailed-performance">
                <div className="assignments-section">
                    <h2>Assignment Submissions</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Assignment</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Grade</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentData.assignments.map(assignment => (
                                <tr key={assignment._id}>
                                    <td>{assignment.title}</td>
                                    <td>
                                        <span className={`status ${assignment.status.toLowerCase()}`}>
                                            {assignment.status}
                                        </span>
                                    </td>
                                    <td>{assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleDateString() : 'Not submitted'}</td>
                                    <td>{assignment.grade !== null ? `${assignment.grade}/${assignment.total_points}` : 'Not graded'}</td>
                                    <td>
                                        <button 
                                            className="view-btn"
                                            onClick={() => navigate(`/courses/${courseId}/assignments/${assignment._id}/submission/${assignment.submission_id}`)}
                                        >
                                            View Submission
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="quizzes-section">
                    <h2>Quiz Attempts</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Quiz</th>
                                <th>Attempts</th>
                                <th>Best Score</th>
                                <th>Last Attempt</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentData.quizzes.map(quiz => (
                                <tr key={quiz._id}>
                                    <td>{quiz.title}</td>
                                    <td>{quiz.attempts_count}/{quiz.attempts_allowed}</td>
                                    <td>{quiz.best_score}%</td>
                                    <td>{new Date(quiz.last_attempt_date).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="view-btn"
                                            onClick={() => navigate(`/courses/${courseId}/quizzes/${quiz._id}/attempts/${quiz.last_attempt_id}`)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
                </div>
            </div>
        </div>
    );
};

export default StudentDetails; 