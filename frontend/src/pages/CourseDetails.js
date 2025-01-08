import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import AssignmentModal from '../components/AssignmentModal';
import QuizModal from '../components/QuizModal';
import '../styles/CourseDetails.css';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [performanceFilter, setPerformanceFilter] = useState('');
    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [showAddQuiz, setShowAddQuiz] = useState(false);
    const [courseData, setCourseData] = useState({
        course: null,
        modules: [],
        assignments: [],
        quizzes: [],
        enrollments: [],
        stats: {
            totalEnrolled: 0,
            averageProgress: 0,
            completionRate: 0,
            assignmentCompletion: 0,
            quizCompletion: 0,
            averagePerformance: 0
        }
    });

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/details`);
            setCourseData(response.data);
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAssignment = async (assignmentData) => {
        try {
            if (assignmentData._id) {
                await axios.put(`/courses/${courseId}/assignments/${assignmentData._id}`, assignmentData);
            } else {
                await axios.post(`/courses/${courseId}/assignments`, assignmentData);
            }
            fetchCourseDetails();
        } catch (error) {
            console.error('Error saving assignment:', error);
            setError('Failed to save assignment');
        }
    };

    const handleSaveQuiz = async (quizData) => {
        try {
            if (quizData._id) {
                await axios.put(`/courses/${courseId}/quizzes/${quizData._id}`, quizData);
            } else {
                await axios.post(`/courses/${courseId}/quizzes`, quizData);
            }
            fetchCourseDetails();
        } catch (error) {
            console.error('Error saving quiz:', error);
            setError('Failed to save quiz');
        }
    };

    const handleEditAssignment = (assignment) => {
        setShowAddAssignment(true);
        // You'll need to add state for the selected assignment if you want to edit it
    };

    const handleViewSubmissions = async (assignmentId) => {
        navigate(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
    };

    const handleEditQuiz = (quiz) => {
        setShowAddQuiz(true);
        // You'll need to add state for the selected quiz if you want to edit it
    };

    const handleViewResults = async (quizId) => {
        navigate(`/courses/${courseId}/quizzes/${quizId}/results`);
    };

    const handleViewStudentDetails = (studentId) => {
        navigate(`/courses/${courseId}/students/${studentId}`);
    };

    // Filter enrollments based on search term and performance filter
    const filteredEnrollments = courseData.enrollments.filter(student => {
        const matchesSearch = searchTerm ? (
            (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        ) : true;
        
        const matchesPerformance = !performanceFilter || 
            (student.performance_metrics?.overall?.toLowerCase() === performanceFilter.toLowerCase());
        
        return matchesSearch && matchesPerformance;
    });

    if (loading) return <div className="loading">Loading course details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!courseData.course) return <div className="error-message">Course not found</div>;

    const { course, modules, assignments, quizzes, enrollments, stats } = courseData;

    return (
        <div className="course-details-page">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back to Dashboard
                </button>
                <h1>{course.course_title}</h1>
            </div>

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
                    className={`tab ${activeTab === 'quizzes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quizzes')}
                >
                    Quizzes
                </button>
                <button 
                    className={`tab ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    Students
                </button>
            </div>

            <div className="content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Enrolled</h3>
                                
                            </div>
                            <div className="stat-card">
                                <h3>Average Progress</h3>
                                
                            </div>
                            <div className="stat-card">
                                <h3>Completion Rate</h3>
                                
                            </div>
                            <div className="stat-card">
                                <h3>Assignment Completion</h3>
                                
                            </div>
                            <div className="stat-card">
                                <h3>Quiz Completion</h3>
                                
                            </div>
                            <div className="stat-card">
                                <h3>Average Performance</h3>
                                
                            </div>
                        </div>

                        <div className="course-info">
                            <div className="info-grid">
                                <div className="info-item">
                                    <h3>Category</h3>
                                    <p>{course.category}</p>
                                </div>
                                <div className="info-item">
                                    <h3>Difficulty Level</h3>
                                    <p>{course.difficulty_level}</p>
                                </div>
                                <div className="info-item">
                                    <h3>Duration</h3>
                                    <p>{new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}</p>
                                </div>
                                <div className="info-item">
                                    <h3>Max Participants</h3>
                                    <p>{course.max_participants}</p>
                                </div>
                            </div>

                            <div className="description-section">
                                <h3>Description</h3>
                                <p>{course.description}</p>
                            </div>

                            <div className="prerequisites-section">
                                <h3>Prerequisites</h3>
                                <p>{course.prerequisites || 'None'}</p>
                            </div>

                            <div className="outcomes-section">
                                <h3>Learning Outcomes</h3>
                                <p>{course.learning_outcomes}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'modules' && (
                    <div className="modules-section">
                        <div className="modules-list">
                            {modules.map((module, index) => (
                                <div key={module._id} className="module-card">
                                    <div className="module-header">
                                        <h3>Module {index + 1}: {module.title}</h3>
                                        <span className="module-duration">{module.duration}</span>
                                    </div>
                                    <p>{module.description}</p>
                                    <div className="module-content">
                                        <h4>Content</h4>
                                        <ul>
                                            {module.content_items?.map((item, i) => (
                                                <li key={i}>{item.title}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="module-resources">
                                        <h4>Resources</h4>
                                        <ul>
                                            {module.resources?.map((resource, i) => (
                                                <li key={i}>
                                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                        {resource.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="assignments-section">
                        <div className="section-header">
                            <h2>Course Assignments</h2>
                            <button className="add-btn" onClick={() => setShowAddAssignment(true)}>
                                Add Assignment
                            </button>
                        </div>
                        <div className="assignments-list">
                            {assignments.map((assignment) => (
                                <div key={assignment._id} className="assignment-card">
                                    <div className="assignment-header">
                                        <h3>{assignment.title}</h3>
                                        <div className="assignment-meta">
                                            <span className="due-date">
                                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                            </span>
                                            <span className="points">
                                                Points: {assignment.total_points}
                                            </span>
                                        </div>
                                    </div>
                                    <p>{assignment.description}</p>
                                    <div className="assignment-stats">
                                        <div className="stat">
                                            <label>Submitted</label>
                                            <span>{assignment.submissions_count}/{stats.totalEnrolled}</span>
                                        </div>
                                        <div className="stat">
                                            <label>Average Score</label>
                                            <span>{assignment.average_score.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="assignment-actions">
                                        <button onClick={() => handleEditAssignment(assignment)}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleViewSubmissions(assignment._id)}>
                                            View Submissions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'quizzes' && (
                    <div className="quizzes-section">
                        <div className="section-header">
                            <h2>Course Quizzes</h2>
                            <button className="add-btn" onClick={() => setShowAddQuiz(true)}>
                                Add Quiz
                            </button>
                        </div>
                        <div className="quizzes-list">
                            {quizzes.map((quiz) => (
                                <div key={quiz._id} className="quiz-card">
                                    <div className="quiz-header">
                                        <h3>{quiz.title}</h3>
                                        <div className="quiz-meta">
                                            <span className="time-limit">
                                                Time: {quiz.time_limit} minutes
                                            </span>
                                            <span className="questions">
                                                Questions: {quiz.questions.length}
                                            </span>
                                        </div>
                                    </div>
                                    <p>{quiz.description}</p>
                                    <div className="quiz-stats">
                                        <div className="stat">
                                            <label>Attempts</label>
                                            <span>{quiz.attempts_count}</span>
                                        </div>
                                        <div className="stat">
                                            <label>Average Score</label>
                                            <span>{quiz.average_score.toFixed(1)}%</span>
                                        </div>
                                        <div className="stat">
                                            <label>Pass Rate</label>
                                            <span>{quiz.pass_rate.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="quiz-actions">
                                        <button onClick={() => handleEditQuiz(quiz)}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleViewResults(quiz._id)}>
                                            View Results
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="students-section">
                        <div className="section-header">
                            <h2>Enrolled Students</h2>
                            <div className="search-filter">
                                <input 
                                    type="text" 
                                    placeholder="Search students..."
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select 
                                    value={performanceFilter || ''}
                                    onChange={(e) => setPerformanceFilter(e.target.value)}
                                >
                                    <option value="">All Performance</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="average">Average</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                        </div>
                        <div className="students-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th>Progress</th>
                                        <th>Assignments</th>
                                        <th>Quizzes</th>
                                        <th>Last Active</th>
                                        <th>Performance</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEnrollments?.map(student => (
                                        <tr key={student.student_id}>
                                            <td>{student.name || 'N/A'}</td>
                                            <td>{student.email || 'N/A'}</td>
                                            <td>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress" 
                                                        style={{width: `${student.progress || 0}%`}}
                                                    />
                                                    <span>{student.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="score-display">
                                                    {student.performance_metrics?.assignments?.completed || 0}/
                                                    {student.performance_metrics?.assignments?.total || 0}
                                                    <span className="score">
                                                        ({(student.performance_metrics?.assignments?.average_score || 0).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="score-display">
                                                    {student.performance_metrics?.quizzes?.completed || 0}/
                                                    {student.performance_metrics?.quizzes?.total || 0}
                                                    <span className="score">
                                                        ({(student.performance_metrics?.quizzes?.average_score || 0).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{student.last_active ? new Date(student.last_active).toLocaleDateString() : 'Never'}</td>
                                            <td>
                                                <div className={`performance ${(student.performance_metrics?.overall || 'unknown').toLowerCase()}`}>
                                                    {student.performance_metrics?.overall || 'Unknown'}
                                                </div>
                                            </td>
                                            <td>
                                                <button onClick={() => handleViewStudentDetails(student.student_id)}>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showAddAssignment && (
                    <AssignmentModal
                        courseId={courseId}
                        onClose={() => setShowAddAssignment(false)}
                        onSave={handleSaveAssignment}
                    />
                )}

                {showAddQuiz && (
                    <QuizModal
                        courseId={courseId}
                        onClose={() => setShowAddQuiz(false)}
                        onSave={handleSaveQuiz}
                    />
                )}
            </div>
        </div>
    );
};

export default CourseDetails; 