import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/ParticipantCourseDetails.css';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ParticipantCourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [courseData, setCourseData] = useState({
        course: null,
        modules: [],
        assignments: [],
        quizzes: [],
        progress: 0
    });

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/viewdetails`);
            const data = response.data;

            // Update the quizzes formatting to include detailed performance data
            const formattedData = {
                course: {
                    _id: String(data.course?._id || ''),
                    title: String(data.course?.title || ''),
                    description: String(data.course?.description || ''),
                    category: String(data.course?.category || 'N/A'),
                    difficulty_level: String(data.course?.difficulty_level || 'N/A'),
                    prerequisites: String(data.course?.prerequisites || 'N/A'),
                    learning_outcomes: String(data.course?.learning_outcomes || 'N/A'),
                    max_participants: Number(data.course?.max_participants || 0),
                    instructor_name: String(data.course?.instructor_name || 'N/A'),
                    instructor_image: String(data.course?.instructor_image || null),
                    instructor_title: String(data.course?.instructor_title || ''),
                    instructor_bio: String(data.course?.instructor_bio || ''),
                    duration: Number(data.course?.duration || 0),
                    start_date: data.course?.start_date || null,
                    end_date: data.course?.end_date || null,
                    is_enrolled: Boolean(data.course?.is_enrolled)
                },
                modules: Array.isArray(data.modules) ? data.modules.map(module => ({
                    _id: String(module._id || ''),
                    title: String(module.title || ''),
                    description: String(module.description || ''),
                    content: String(module.content || ''),
                    completed: Boolean(module.completed),
                    progress: Number(module.progress || 0),
                    completion_date: module.completion_date || null
                })) : [],
                assignments: Array.isArray(data.assignments) ? data.assignments.map(assignment => ({
                    _id: String(assignment._id || ''),
                    title: String(assignment.title || ''),
                    description: String(assignment.description || ''),
                    due_date: assignment.due_date || null,
                    status: String(assignment.status || 'pending'),
                    score: assignment.score !== null ? Number(assignment.score) : null,
                    submission_date: assignment.submission_date || null
                })) : [],
                quizzes: Array.isArray(data.quizzes) ? data.quizzes.map(quiz => ({
                    _id: String(quiz._id || ''),
                    title: String(quiz.title || ''),
                    description: String(quiz.description || ''),
                    time_limit: Number(quiz.time_limit || 30),
                    status: String(quiz.status || 'not_started'),
                    score: quiz.score !== null ? Number(quiz.score) : null,
                    passed: Boolean(quiz.passed),
                    correct_answers: Number(quiz.correct_answers || 0),
                    incorrect_answers: Number(quiz.incorrect_answers || 0),
                    skipped_answers: Number(quiz.skipped_answers || 0),
                    total_questions: Number(quiz.total_questions || 0)
                })) : [],
                progress: Number(data.progress || 0)
            };

            setCourseData(formattedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError(error.response?.data?.error || 'Failed to get course details');
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            await axios.post(`/courses/${courseId}/enroll`);
            await fetchCourseDetails();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to enroll in course');
        } finally {
            setEnrolling(false);
        }
    };

    const handleModuleCompletion = async (moduleId) => {
        try {
            const response = await axios.post(
                `/courses/${courseId}/modules/${moduleId}/complete`
            );
            if (response.status === 200) {
                await fetchCourseDetails();
            }
        } catch (error) {
            console.error('Error marking module as complete:', error);
            setError(error.response?.data?.error || 'Failed to mark module as complete');
        }
    };

    const startQuiz = (quizId) => {
        navigate(`/courses/${courseId}/quizzes/${quizId}`);
    };

    const getStatusClass = (module) => {
        if (module.completed) return 'completed';
        if (module.progress > 0) return 'in-progress';
        return 'not-started';
    };

    const getModuleStatus = (module) => {
        if (module.completed) return 'Completed';
        if (module.progress > 0) return 'In Progress';
        return 'Not Started';
    };

    if (loading) return <div className="loading">Loading course details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!courseData.course) return <div className="error-message">Course not found</div>;

    return (
        <div className="participant-course-details">
            <div className="header-section">
                <button 
                    className="back-button"
                    onClick={() => navigate('/dashboard')}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
                </button>
                <h1>{courseData.course.title}</h1>
            </div>

            {courseData.course.is_enrolled ? (
                <>
                    <div className="course-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${courseData.progress}%` }}
                            ></div>
                        </div>
                        <span>{Math.round(courseData.progress)}% Complete</span>
                    </div>

                    <div className="section-tabs">
                        <button 
                            className={activeSection === 'overview' ? 'active' : ''}
                            onClick={() => setActiveSection('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={activeSection === 'modules' ? 'active' : ''}
                            onClick={() => setActiveSection('modules')}
                        >
                            Modules
                        </button>
                        <button 
                            className={activeSection === 'assignments' ? 'active' : ''}
                            onClick={() => setActiveSection('assignments')}
                        >
                            Assignments
                        </button>
                        <button 
                            className={activeSection === 'quizzes' ? 'active' : ''}
                            onClick={() => setActiveSection('quizzes')}
                        >
                            Quizzes
                        </button>
                        <button 
                            className={activeSection === 'performance' ? 'active' : ''}
                            onClick={() => setActiveSection('performance')}
                        >
                            Performance
                        </button>
                    </div>

                    <div className="section-content">
                        {activeSection === 'overview' && (
                            <div className="overview-card">
                                <h2>Course Overview</h2>
                                <p className="course-description">{courseData.course.description}</p>
                                <div className="course-highlights">
                                    <div className="highlight-item">
                                        <span className="highlight-icon">📊</span>
                                        <div className="highlight-content">
                                            <h4>Overall Progress</h4>
                                            <p>{Math.round(courseData.progress)}% Completed</p>
                                        </div>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="highlight-icon">📚</span>
                                        <div className="highlight-content">
                                            <h4>Modules</h4>
                                            <p>{courseData.modules.filter(m => m.completed).length} of {courseData.modules.length} Completed</p>
                                        </div>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="highlight-icon">✍️</span>
                                        <div className="highlight-content">
                                            <h4>Assignments</h4>
                                           <p>{courseData.assignments.filter(a => a.status === 'completed').length} of {courseData.assignments.length} Completed</p>
                                        </div>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="highlight-icon">📝</span>
                                        <div className="highlight-content">
                                            <h4>Quizzes</h4>
                                           <p>{courseData.quizzes.filter(q => q.status === 'completed').length} of {courseData.quizzes.length} Completed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'performance' && (
                            <div className="performance-card">
                                <h2>Performance Insights</h2>
                                <div className="performance-metrics">
                                    {/* Course Progress Overview */}
                                    <div className="metric-item full-width">
                                        <h3>Overall Course Progress</h3>
                                        <div className="progress-chart">
                                            <Doughnut
                                                data={{
                                                    labels: ['Completed', 'Remaining'],
                                                    datasets: [{
                                                        data: [courseData.progress, 100 - courseData.progress],
                                                        backgroundColor: [
                                                            'rgba(25, 118, 210, 0.8)',
                                                            'rgba(200, 200, 200, 0.3)'
                                                        ],
                                                        borderWidth: 0
                                                    }]
                                                }}
                                                options={{
                                                    cutout: '70%',
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom'
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="progress-center">
                                                <span className="progress-percentage">{Math.round(courseData.progress)}%</span>
                                                <span className="progress-label">Complete</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quiz Performance Analysis */}
                                    <div className="metric-item full-width">
                                        <h3>Quiz Performance Analysis</h3>
                                        <div className="quiz-performance-chart">
                                            <Bar
                                                data={{
                                                    labels: courseData.quizzes
                                                        .filter(quiz => quiz.status === 'completed')
                                                        .map(quiz => quiz.title),
                                                    datasets: [
                                                        {
                                                            label: 'Correct Answers',
                                                            data: courseData.quizzes
                                                                .filter(quiz => quiz.status === 'completed')
                                                                .map(quiz => quiz.correct_answers),
                                                            backgroundColor: 'rgba(76, 175, 80, 0.6)',
                                                        },
                                                        {
                                                            label: 'Incorrect Answers',
                                                            data: courseData.quizzes
                                                                .filter(quiz => quiz.status === 'completed')
                                                                .map(quiz => quiz.incorrect_answers),
                                                            backgroundColor: 'rgba(244, 67, 54, 0.6)',
                                                        },
                                                        {
                                                            label: 'Skipped Questions',
                                                            data: courseData.quizzes
                                                                .filter(quiz => quiz.status === 'completed')
                                                                .map(quiz => quiz.skipped_answers),
                                                            backgroundColor: 'rgba(158, 158, 158, 0.6)',
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    scales: {
                                                        x: { stacked: true },
                                                        y: { 
                                                            stacked: true,
                                                            beginAtZero: true,
                                                            ticks: {
                                                                stepSize: 1
                                                            }
                                                        }
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom'
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function(context) {
                                                                    return `${context.dataset.label}: ${context.raw} questions`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Module Progress Timeline */}
                                    <div className="metric-item full-width">
                                        <h3>Module Progress Timeline</h3>
                                        <div className="module-timeline-chart">
                                            <Line
                                                data={{
                                                    labels: courseData.modules.map(module => module.title),
                                                    datasets: [{
                                                        label: 'Progress',
                                                        data: courseData.modules.map(module => 
                                                            module.completed ? 100 : module.progress || 0
                                                        ),
                                                        borderColor: 'rgba(25, 118, 210, 0.8)',
                                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                        fill: true,
                                                        tension: 0.4
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            max: 100,
                                                            ticks: {
                                                                callback: value => `${value}%`
                                                            }
                                                        }
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            display: false
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function(context) {
                                                                    const moduleIndex = context.dataIndex;
                                                                    const module = courseData.modules[moduleIndex];
                                                                    return `Progress: ${context.raw}% ${module.completed ? '(Completed)' : ''}`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Recent Activity Timeline */}
                                    <div className="metric-item">
                                        <h3>Recent Activities</h3>
                                        <div className="activity-timeline">
                                            {courseData.modules.slice(-5).reverse().map(module => (
                                                <div key={module._id} className="activity-item">
                                                    <div className="activity-status-indicator">
                                                        <div className={`status-dot ${module.completed ? 'completed' : 'in-progress'}`}></div>
                                                        <div className="status-line"></div>
                                                    </div>
                                                    <div className="activity-content">
                                                        <h4>{module.title}</h4>
                                                        <p className="activity-meta">
                                                            <span className="activity-date">
                                                                {new Date(module.last_accessed || Date.now()).toLocaleDateString()}
                                                            </span>
                                                            <span className={`activity-status ${module.completed ? 'completed' : 'in-progress'}`}>
                                                                {module.completed ? 'Completed' : 'In Progress'}
                                                            </span>
                                                        </p>
                                                        <div className="activity-progress">
                                                            <div 
                                                                className="progress-bar" 
                                                                style={{width: `${module.progress || 0}%`}}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'modules' && (
                            <div className="modules-list">
                                {courseData.modules.map((module, index) => (
                                    <div key={module._id} className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Module {index + 1}</span>
                                            <div className={`status-badge ${getStatusClass(module)}`}>
                                                {getModuleStatus(module)}
                                            </div>
                                        </div>
                                        
                                        <h3>{module.title}</h3>
                                        <p className="module-description">{module.description}</p>
                                        
                                        <div className="learning-points">
                                            <h4>Learning Points</h4>
                                            {module.learning_points ? (
                                                <ul className="points-list">
                                                    {module.learning_points.map((point, idx) => (
                                                        <li key={idx}>
                                                            <span className="point-icon">📍</span>
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="no-points">Learning points will be added by the instructor</p>
                                            )}
                                        </div>

                                        <div className="module-footer">
                                            <div className="module-meta">
                                                <span className="duration">
                                                    <i className="far fa-clock"></i>
                                                    {module.duration || 'N/A'} mins
                                                </span>
                                                {module.completed && (
                                                    <span className="completion-date">
                                                        Completed on: {new Date(module.completion_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {!module.completed && courseData.course.is_enrolled && (
                                                <button 
                                                    onClick={() => handleModuleCompletion(module._id)}
                                                    className="complete-button"
                                                >
                                                    Mark as Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'assignments' && (
                            <div className="assignments-list">
                                {courseData.assignments.map(assignment => (
                                    <div key={assignment._id} className="assignment-item">
                                        <div className="assignment-header">
                                            <h3>{assignment.title}</h3>
                                            <div className={`status-badge ${assignment.status}`}>
                                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                            </div>
                                        </div>

                                        <p className="assignment-description">{assignment.description}</p>

                                        <div className="assignment-stats">
                                            <div className="stat-item">
                                                <span className="stat-icon">📅</span>
                                                <div className="stat-content">
                                                    <h4>Due Date</h4>
                                                    <p>{new Date(assignment.due_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {assignment.status === 'completed' && (
                                                <div className="stat-item">
                                                    <span className="stat-icon">🎯</span>
                                                    <div className="stat-content">
                                                        <h4>Score</h4>
                                                        <p>{assignment.score}%</p>
                                                    </div>
                                                </div>
                                            )}
                                            {assignment.submission_date && (
                                               <div className="stat-item">
                                                    <span className="stat-icon">📤</span>
                                                    <div className="stat-content">
                                                        <h4>Submitted On</h4>
                                                        <p>{new Date(assignment.submission_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'quizzes' && (
                            <div className="quizzes-list">
                                {courseData.quizzes.map(quiz => (
                                    <div key={quiz._id} className="quiz-item">
                                        <div className="quiz-header">
                                            <h3>{quiz.title}</h3>
                                             {quiz.status === 'completed' && (
                                                <div className={`status-badge ${quiz.passed ? 'passed' : 'failed'}`}>
                                                    {quiz.passed ? 'Passed' : 'Failed'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <p className="quiz-description">{quiz.description}</p>
                                        
                                        <div className="quiz-stats">
                                            <div className="stat-item">
                                                <span className="stat-icon">⏱️</span>
                                                <div className="stat-content">
                                                    <h4>Time Limit</h4>
                                                    <p>{quiz.time_limit} minutes</p>
                                                </div>
                                            </div>
                                              {quiz.status === 'completed' && (
                                                <>
                                                    <div className="stat-item">
                                                        <span className="stat-icon">📊</span>
                                                        <div className="stat-content">
                                                            <h4>Score</h4>
                                                            <p>{quiz.score}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="stat-icon">✅</span>
                                                        <div className="stat-content">
                                                            <h4>Correct Answers</h4>
                                                            <p>{quiz.correct_answers || 0} questions</p>
                                                        </div>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="stat-icon">❌</span>
                                                        <div className="stat-content">
                                                            <h4>Incorrect Answers</h4>
                                                            <p>{quiz.incorrect_answers || 0} questions</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {quiz.status !== 'completed' && courseData.course.is_enrolled && (
                                            <button 
                                                className="start-quiz-btn"
                                                onClick={() => startQuiz(quiz._id)}
                                            >
                                                Start Quiz
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="course-overview-section">
                    <div className="overview-card">
                        <h2>Course Overview</h2>
                        <p className="course-description">{courseData.course.description}</p>
                        
                        <div className="course-meta-details">
                            <div className="meta-item">
                                <span className="meta-icon">🏷️</span>
                                <div className="meta-content">
                                    <h4>Category</h4>
                                    <p className="category-text">{courseData.course.category}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📊</span>
                                <div className="meta-content">
                                    <h4>Difficulty Level</h4>
                                    <p className="difficulty-text">{courseData.course.difficulty_level}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">⏱️</span>
                                <div className="meta-content">
                                    <h4>Duration</h4>
                                    <p className="duration-text">{courseData.course.duration} days</p>
                                </div>
                            </div>
                        </div>

                        <div className="prerequisites-section">
                            <h3>Prerequisites</h3>
                            <p>{courseData.course?.prerequisites || 'None'}</p>
                        </div>

                        <div className="learning-outcomes">
                            <h3>Learning Outcomes</h3>
                            <p className="learning-outcomes-text">{courseData.course.learning_outcomes}</p>
                        </div>

                        <div className="course-highlights">
                            <div className="highlight-item">
                                <span className="highlight-icon">🎯</span>
                                <div className="highlight-content">
                                    <h4>Start Date</h4>
                                     {courseData.course.start_date && <p>{new Date(courseData.course.start_date).toLocaleDateString()}</p>}

                                </div>
                            </div>
                            <div className="highlight-item">
                                <span className="highlight-icon">🏁</span>
                                <div className="highlight-content">
                                    <h4>End Date</h4>
                                    {courseData.course.end_date && <p>{new Date(courseData.course.end_date).toLocaleDateString()}</p>}

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="instructor-card">
                        <h2>About the Instructor</h2>
                        <div className="instructor-profile">
                           <div className="instructor-avatar">
                                {courseData.course.instructor_image ? (
                                    <img src={courseData.course.instructor_image} alt="Instructor" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {courseData.course.instructor_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="instructor-info">
                                <h3>{courseData.course.instructor_name}</h3>
                                <p className="instructor-title">{courseData.course.instructor_title || 'Course Instructor'}</p>
                                <p className="instructor-bio">{courseData.course.instructor_bio || 'Experienced professional dedicated to teaching and sharing knowledge in this field.'}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="enroll-btn"
                        onClick={handleEnroll}
                        disabled={enrolling}
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ParticipantCourseDetails;