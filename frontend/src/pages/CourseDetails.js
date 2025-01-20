import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import ModuleManager from '../components/ModuleManager';
import AssignmentModal from '../components/AssignmentModal';
import QuizModal from '../components/QuizModal';
import ModuleModal from '../components/ModuleModal';
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
    const [showAddModule, setShowAddModule] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
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
            setError(null);
            
            // Validate data before sending
            if (!assignmentData.title?.trim()) {
                setError('Assignment title is required');
                alert('Assignment title is required');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Prepare the data
            const assignmentPayload = {
                title: String(assignmentData.title || '').trim(),
                description: String(assignmentData.description || '').trim(),
                due_date: assignmentData.due_date || null,
                total_points: parseInt(assignmentData.total_points || 100)
            };

            console.log('Sending assignment data:', assignmentPayload);
            console.log('Course ID:', courseId);
            console.log('Token:', token);

            let response;
        try {
            if (assignmentData._id) {
                    response = await axios.put(
                        `/courses/${courseId}/assignments/${assignmentData._id}`,
                        assignmentPayload,
                        config
                    );
                } else {
                    response = await axios.post(
                        `/courses/${courseId}/assignments`,
                        assignmentPayload,
                        config
                    );
                }

                console.log('Server response:', response.data);

                if (response.data && (response.data.assignment || response.data.assignment_id)) {
                    console.log('Assignment saved successfully:', response.data);
                    setShowAddAssignment(false);
                    await fetchCourseDetails();
            } else {
                    console.error('Invalid response format:', response.data);
                    throw new Error('Invalid server response');
                }
            } catch (axiosError) {
                console.error('Axios error details:', {
                    response: axiosError.response?.data,
                    status: axiosError.response?.status,
                    headers: axiosError.response?.headers,
                    config: axiosError.config
                });
                throw axiosError;
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.details || 
                               error.message || 
                               'Failed to save assignment';
            setError(errorMessage);
            alert(`Failed to save assignment: ${errorMessage}`);
        }
    };

    const handleSaveQuiz = async (quizData) => {
        try {
            setError(null);
            
            // Validate data before sending
            if (!quizData.title?.trim()) {
                setError('Quiz title is required');
                alert('Quiz title is required');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            };

            // Prepare the data
            const quizPayload = {
                title: String(quizData.title || '').trim(),
                description: String(quizData.description || '').trim(),
                time_limit: parseInt(quizData.time_limit || 30),
                passing_score: parseInt(quizData.passing_score || 60),
                max_attempts: parseInt(quizData.max_attempts || 3),
                questions: quizData.questions || []
            };

            console.log('Sending quiz data:', quizPayload);

            let response;
        try {
            if (quizData._id) {
                    response = await axios.put(
                        `/courses/${courseId}/quizzes/${quizData._id}`,
                        quizPayload,
                        config
                    );
                } else {
                    response = await axios.post(
                        `/courses/${courseId}/quizzes`,
                        quizPayload,
                        config
                    );
                }

                console.log('Server response:', response.data);

                if (response.data && (response.data.quiz || response.data.quiz_id)) {
                    console.log('Quiz saved successfully:', response.data);
                    setShowAddQuiz(false);
                    await fetchCourseDetails();
            } else {
                    console.error('Invalid response format:', response.data);
                    throw new Error('Invalid server response');
                }
            } catch (axiosError) {
                console.error('Axios error:', axiosError.response?.data);
                throw axiosError;
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.details || 
                               error.message || 
                               'Failed to save quiz';
            setError(errorMessage);
            alert(`Failed to save quiz: ${errorMessage}`);
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

    const handleSaveModule = async (moduleData) => {
        try {
            setError(null);
            
            // Validate data before sending
            if (!moduleData.title?.trim()) {
                setError('Module title is required');
                alert('Module title is required');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            };

            // Prepare the data - ensure all fields are the correct type
            const modulePayload = {
                title: String(moduleData.title || '').trim(),
                description: String(moduleData.description || '').trim(),
                content: String(moduleData.content || '').trim(),
                order: Number(moduleData.order || 0)
            };

            console.log('Sending module data:', modulePayload);

            let response;
            try {
                if (moduleData._id) {
                    response = await axios.put(
                        `/courses/${courseId}/modules/${moduleData._id}`,
                        modulePayload,
                        config
                    );
                } else {
                    response = await axios.post(
                        `/courses/${courseId}/modules`,
                        modulePayload,
                        config
                    );
                }

                if (response.data && response.data.module) {
                    console.log('Module saved successfully:', response.data.module);
                    setShowAddModule(false);
                    setEditingModule(null);
                    await fetchCourseDetails();
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (axiosError) {
                console.error('Axios error:', axiosError.response?.data);
                throw axiosError;
            }
        } catch (error) {
            console.error('Error saving module:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.details || 
                               'Failed to save module';
            setError(errorMessage);
            alert(`Failed to save module: ${errorMessage}`);
        }
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setShowAddModule(true);
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('Are you sure you want to delete this module?')) {
            try {
                setError(null); // Clear any previous errors
                
                const response = await axios.delete(`/courses/${courseId}/modules/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 200) {
                    // Refresh the course details after successful deletion
                    await fetchCourseDetails();
                }
            } catch (error) {
                console.error('Error deleting module:', error);
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.details || 
                                   'Failed to delete module';
                
                setError(errorMessage);
                alert(`Failed to delete module: ${errorMessage}`);
            }
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                setError(null);
                
                const response = await axios.delete(
                    `/courses/${courseId}/assignments/${assignmentId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.status === 200) {
                    await fetchCourseDetails();
                }
            } catch (error) {
                console.error('Error deleting assignment:', error);
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.details || 
                                   'Failed to delete assignment';
                setError(errorMessage);
                alert(`Failed to delete assignment: ${errorMessage}`);
            }
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                setError(null);
                
                const response = await axios.delete(
                    `/courses/${courseId}/quizzes/${quizId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.status === 200) {
                    await fetchCourseDetails();
                }
            } catch (error) {
                console.error('Error deleting quiz:', error);
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.details || 
                                   'Failed to delete quiz';
                setError(errorMessage);
                alert(`Failed to delete quiz: ${errorMessage}`);
            }
        }
    };

    // Filter enrollments based on search term and performance filter
    const filteredEnrollments = Array.isArray(courseData.enrollments) 
        ? courseData.enrollments.filter(student => {
        const matchesSearch = searchTerm ? (
            (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        ) : true;
        
        const matchesPerformance = !performanceFilter || 
            (student.performance_metrics?.overall?.toLowerCase() === performanceFilter.toLowerCase());
        
        return matchesSearch && matchesPerformance;
        })
        : [];

    const getStats = () => {
        return {
            totalEnrolled: courseData.stats?.totalEnrolled || 0,
            averageProgress: courseData.stats?.averageProgress || 0,
            completionRate: courseData.stats?.completionRate || 0,
            assignmentCompletion: courseData.stats?.assignmentCompletion || 0,
            quizCompletion: courseData.stats?.quizCompletion || 0,
            averagePerformance: courseData.stats?.averagePerformance || 0
        };
    };

    const renderOverview = () => {
        const stats = getStats();
        const { course } = courseData;

        return (
            <div className="overview-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Enrolled</h3>
                        <p>{stats.totalEnrolled}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Average Progress</h3>
                        <p>{stats.averageProgress.toFixed(1)}%</p>
                    </div>
                    <div className="stat-card">
                        <h3>Completion Rate</h3>
                        <p>{stats.completionRate.toFixed(1)}%</p>
                    </div>
                    <div className="stat-card">
                        <h3>Assignment Completion</h3>
                        <p>{stats.assignmentCompletion.toFixed(1)}%</p>
                    </div>
                    <div className="stat-card">
                        <h3>Quiz Completion</h3>
                        <p>{stats.quizCompletion.toFixed(1)}%</p>
                    </div>
                    <div className="stat-card">
                        <h3>Average Performance</h3>
                        <p>{stats.averagePerformance.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="course-info">
                    <div className="info-grid">
                        <div className="info-item">
                            <h3>Category</h3>
                            <p>{course.category || 'Uncategorized'}</p>
                        </div>
                        <div className="info-item">
                            <h3>Difficulty Level</h3>
                            <p>{course.difficulty_level || 'Beginner'}</p>
                        </div>
                        <div className="info-item">
                            <h3>Duration</h3>
                            <p>
                                {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'Not set'} - 
                                {course.end_date ? new Date(course.end_date).toLocaleDateString() : 'Not set'}
                            </p>
                        </div>
                        <div className="info-item">
                            <h3>Max Participants</h3>
                            <p>{course.max_participants || 'Unlimited'}</p>
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Description</h3>
                        <p>{course.description || 'No description available'}</p>
                    </div>

                    <div className="prerequisites-section">
                        <h3>Prerequisites</h3>
                        <p>{course.prerequisites || 'None'}</p>
                    </div>

                    <div className="outcomes-section">
                        <h3>Learning Outcomes</h3>
                        <p>{course.learning_outcomes || 'No learning outcomes specified'}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderAssignments = () => {
        const currentStats = getStats();

        return (
            <div className="assignments-section">
                <div className="section-header">
                    <h2>Course Assignments</h2>
                    <button className="add-btn" onClick={() => setShowAddAssignment(true)}>
                        Add Assignment
                    </button>
                </div>
                <div className="assignments-list">
                    {courseData.assignments && courseData.assignments.length > 0 ? (
                        courseData.assignments.map((assignment) => (
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
                                        <span>
                                            {assignment.submissions_count || 0}/{currentStats.totalEnrolled}
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <label>Average Score</label>
                                        <span>
                                            {(assignment.average_score || 0).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="assignment-actions">
                                    <button onClick={() => handleEditAssignment(assignment)}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleViewSubmissions(assignment._id)}>
                                        View Submissions
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-assignments">No assignments added yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderQuizzes = () => {
        return (
            <div className="quizzes-section">
                <div className="section-header">
                    <h2>Course Quizzes</h2>
                    <button className="add-btn" onClick={() => setShowAddQuiz(true)}>
                        Add Quiz
                    </button>
                </div>
                <div className="quizzes-list">
                    {courseData.quizzes && courseData.quizzes.length > 0 ? (
                        courseData.quizzes.map((quiz) => (
                            <div key={quiz._id} className="quiz-card">
                                <div className="quiz-header">
                                    <h3>{quiz.title}</h3>
                                    <div className="quiz-meta">
                                        <span className="time-limit">
                                            Time: {quiz.time_limit || 0} minutes
                                        </span>
                                        <span className="questions">
                                            Questions: {quiz.questions?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                <p>{quiz.description}</p>
                                <div className="quiz-stats">
                                    <div className="stat">
                                        <label>Attempts</label>
                                        <span>{quiz.attempts_count || 0}</span>
                                    </div>
                                    <div className="stat">
                                        <label>Average Score</label>
                                        <span>{(quiz.average_score || 0).toFixed(1)}%</span>
                                    </div>
                                    <div className="stat">
                                        <label>Pass Rate</label>
                                        <span>{(quiz.pass_rate || 0).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="quiz-actions">
                                    <button onClick={() => handleEditQuiz(quiz)}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleViewResults(quiz._id)}>
                                        View Results
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteQuiz(quiz._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-quizzes">No quizzes added yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderModules = () => {
        return (
            <div className="modules-section">
                <div className="section-header">
                    <h2>Course Modules</h2>
                    <button className="add-btn" onClick={() => setShowAddModule(true)}>
                        Add Module
                    </button>
                </div>
                <div className="modules-list">
                    {courseData.modules && courseData.modules.length > 0 ? (
                        courseData.modules.map((module, index) => (
                            <div key={module._id} className="module-card">
                                <div className="module-header">
                                    <h3>Module {index + 1}: {module.title}</h3>
                                    <div className="module-actions">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEditModule(module)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteModule(module._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p>{module.description}</p>
                                {module.content && (
                                    <div className="module-content">
                                        <h4>Content</h4>
                                        <div className="content-text">
                                            {typeof module.content === 'object' 
                                                ? module.content.title || 'No content title'
                                                : module.content
                                            }
                                        </div>
                                        {module.content.type && (
                                            <div className="content-type">
                                                Type: {module.content.type}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {module.resources && module.resources.length > 0 && (
                                    <div className="module-resources">
                                        <h4>Resources</h4>
                                        <ul>
                                            {module.resources.map((resource, idx) => (
                                                <li key={idx}>
                                                    {typeof resource === 'object' 
                                                        ? (
                                                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                                {resource.title}
                                                            </a>
                                                        ) 
                                                        : resource
                                                    }
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="no-modules">No modules added yet. Create your first module using the Add Module button.</p>
                    )}
                </div>
                
                {showAddModule && (
                    <ModuleModal
                        courseId={courseId}
                        module={editingModule}
                        onClose={() => {
                            setShowAddModule(false);
                            setEditingModule(null);
                        }}
                        onSave={handleSaveModule}
                    />
                )}
            </div>
        );
    };

    const renderStudents = () => (
        <div className="students-section">
            <div className="section-header">
                <h2>Enrolled Students ({filteredEnrollments.length})</h2>
                <div className="search-filter">
                    <input 
                        type="text" 
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                        value={performanceFilter}
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
                {filteredEnrollments.length > 0 ? (
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
                            {filteredEnrollments.map(student => (
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
                                    <td>
                                        {student.assignments_completed}/{courseData.assignments.length}
                                        <div className="completion-rate">
                                            ({student.performance_metrics?.assignments?.average_score.toFixed(1)}%)
                                        </div>
                                    </td>
                                    <td>
                                        {student.quizzes_completed}/{courseData.quizzes.length}
                                        <div className="completion-rate">
                                            ({student.performance_metrics?.quizzes?.average_score.toFixed(1)}%)
                                        </div>
                                    </td>
                                    <td>
                                        {student.last_active 
                                            ? new Date(student.last_active).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </td>
                                    <td className={`performance ${student.performance_metrics.overall.toLowerCase()}`}>
                                        {student.performance_metrics.overall}
                                    </td>
                                    <td>
                                        <button 
                                            className="view-details-btn"
                                            onClick={() => handleViewStudentDetails(student.student_id)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-students">
                        {searchTerm || performanceFilter 
                            ? 'No students found matching the criteria.'
                            : 'No students enrolled in this course yet.'
                        }
                    </p>
                )}
            </div>
        </div>
    );

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
                {activeTab === 'overview' && renderOverview()}

                {activeTab === 'modules' && renderModules()}

                {activeTab === 'assignments' && renderAssignments()}

                {activeTab === 'quizzes' && renderQuizzes()}

                {activeTab === 'students' && renderStudents()}

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