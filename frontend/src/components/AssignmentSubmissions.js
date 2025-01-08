import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/AssignmentSubmissions.css';

const AssignmentSubmissions = () => {
    const { courseId, assignmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, [courseId, assignmentId]);

    const fetchSubmissions = async () => {
        try {
            const [assignmentRes, submissionsRes] = await Promise.all([
                axios.get(`/courses/${courseId}/assignments/${assignmentId}`),
                axios.get(`/courses/${courseId}/assignments/${assignmentId}/submissions`)
            ]);

            setAssignment(assignmentRes.data.assignment);
            setSubmissions(submissionsRes.data.submissions);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (submissionId, grade, feedback) => {
        try {
            await axios.put(`/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`, {
                grade,
                feedback
            });
            fetchSubmissions();
        } catch (error) {
            console.error('Error grading submission:', error);
            setError('Failed to save grade');
        }
    };

    if (loading) return <div className="loading">Loading submissions...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!assignment) return <div className="error-message">Assignment not found</div>;

    return (
        <div className="submissions-page">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back to Course
                </button>
                <h1>{assignment.title} - Submissions</h1>
            </div>

            <div className="assignment-info">
                <div className="info-grid">
                    <div className="info-item">
                        <h3>Due Date</h3>
                        <p>{new Date(assignment.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="info-item">
                        <h3>Total Points</h3>
                        <p>{assignment.total_points}</p>
                    </div>
                    <div className="info-item">
                        <h3>Submissions</h3>
                        <p>{submissions.length}</p>
                    </div>
                    <div className="info-item">
                        <h3>Average Score</h3>
                        <p>
                            {submissions.length > 0
                                ? (submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / submissions.length).toFixed(1)
                                : 'N/A'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="submissions-list">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Submitted At</th>
                            <th>Status</th>
                            <th>Grade</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map(submission => (
                            <tr key={submission._id}>
                                <td>{submission.student_name}</td>
                                <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                                <td>
                                    <span className={`status ${submission.status.toLowerCase()}`}>
                                        {submission.status}
                                    </span>
                                </td>
                                <td>
                                    {submission.grade !== null 
                                        ? `${submission.grade}/${assignment.total_points}`
                                        : 'Not Graded'
                                    }
                                </td>
                                <td>
                                    <button 
                                        className="view-btn"
                                        onClick={() => setSelectedSubmission(submission)}
                                    >
                                        View & Grade
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedSubmission && (
                <div className="submission-modal">
                    <div className="modal-content">
                        <h2>Submission Details</h2>
                        <div className="submission-details">
                            <h3>Student: {selectedSubmission.student_name}</h3>
                            <p>Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                            
                            <div className="submission-content">
                                {selectedSubmission.type === 'file' ? (
                                    <a 
                                        href={selectedSubmission.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="download-btn"
                                    >
                                        Download Submission
                                    </a>
                                ) : (
                                    <div className="text-submission">
                                        {selectedSubmission.content}
                                    </div>
                                )}
                            </div>

                            <div className="grading-section">
                                <h3>Grading</h3>
                                <div className="grade-input">
                                    <label>Points</label>
                                    <input 
                                        type="number"
                                        value={selectedSubmission.grade || ''}
                                        onChange={e => handleGrade(
                                            selectedSubmission._id,
                                            parseInt(e.target.value),
                                            selectedSubmission.feedback
                                        )}
                                        max={assignment.total_points}
                                        min="0"
                                    />
                                    <span>/ {assignment.total_points}</span>
                                </div>
                                <div className="feedback-input">
                                    <label>Feedback</label>
                                    <textarea
                                        value={selectedSubmission.feedback || ''}
                                        onChange={e => handleGrade(
                                            selectedSubmission._id,
                                            selectedSubmission.grade,
                                            e.target.value
                                        )}
                                        placeholder="Provide feedback to the student..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="close-btn"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentSubmissions; 