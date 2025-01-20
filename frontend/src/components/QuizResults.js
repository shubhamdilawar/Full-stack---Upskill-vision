import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import '../styles/QuizResults.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const QuizResults = () => {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quiz, setQuiz] = useState(null);
    const [results, setResults] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [analytics, setAnalytics] = useState({
        scoreDistribution: {},
        questionPerformance: [],
        completionTime: [],
        passingRate: { passed: 0, failed: 0 }
    });

    useEffect(() => {
        fetchQuizResults();
    }, [courseId, quizId]);

    const fetchQuizResults = async () => {
        try {
            const [quizRes, resultsRes] = await Promise.all([
                axios.get(`/courses/${courseId}/quizzes/${quizId}`),
                axios.get(`/courses/${courseId}/quizzes/${quizId}/results`)
            ]);

            setQuiz(quizRes.data.quiz);
            setResults(resultsRes.data.results);
            processAnalytics(resultsRes.data.results);
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            setError('Failed to load quiz results');
        } finally {
            setLoading(false);
        }
    };

    const processAnalytics = (results) => {
        // Score Distribution
        const distribution = {};
        results.forEach(result => {
            const scoreRange = Math.floor(result.score / 10) * 10;
            distribution[`${scoreRange}-${scoreRange + 9}`] = (distribution[`${scoreRange}-${scoreRange + 9}`] || 0) + 1;
        });

        // Question Performance
        const questionPerf = quiz.questions.map((q, index) => {
            const correct = results.filter(r => r.answers[index]?.correct).length;
            return {
                question: `Q${index + 1}`,
                correctRate: (correct / results.length) * 100
            };
        });

        // Completion Time Analysis
        const times = results.map(r => ({
            student: r.student_name,
            time: r.completion_time
        })).sort((a, b) => a.time - b.time);

        // Passing Rate
        const passed = results.filter(r => r.score >= quiz.passing_score).length;

        setAnalytics({
            scoreDistribution: distribution,
            questionPerformance: questionPerf,
            completionTime: times,
            passingRate: {
                passed,
                failed: results.length - passed
            }
        });
    };

    const scoreDistributionData = {
        labels: Object.keys(analytics.scoreDistribution),
        datasets: [{
            label: 'Number of Students',
            data: Object.values(analytics.scoreDistribution),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const questionPerformanceData = {
        labels: analytics.questionPerformance.map(q => q.question),
        datasets: [{
            label: 'Correct Answer Rate (%)',
            data: analytics.questionPerformance.map(q => q.correctRate),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const passingRateData = {
        labels: ['Passed', 'Failed'],
        datasets: [{
            data: [analytics.passingRate.passed, analytics.passingRate.failed],
            backgroundColor: [
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    const AttemptDetailsModal = ({ attempt, quiz, onClose }) => {
        return (
            <div className="attempt-modal" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h2>Attempt Details</h2>
                    <div className="attempt-info">
                        <p><strong>Student:</strong> {attempt.student_name}</p>
                        <p><strong>Score:</strong> {attempt.score}%</p>
                        <p><strong>Time Taken:</strong> {attempt.completion_time} minutes</p>
                        <p><strong>Submitted:</strong> {new Date(attempt.submitted_at).toLocaleString()}</p>
                    </div>

                    <div className="questions-review">
                        <h3>Questions Review</h3>
                        {quiz.questions.map((question, index) => (
                            <div 
                                key={index} 
                                className={`question-review ${attempt.answers[index]?.correct ? 'correct' : 'incorrect'}`}
                            >
                                <h4>Question {index + 1}</h4>
                                <p>{question.question}</p>

                                {question.type === 'multiple_choice' && (
                                    <div className="options">
                                        {question.options.map((option, optionIndex) => (
                                            <div 
                                                key={optionIndex}
                                                className={`answer-option ${
                                                    attempt.answers[index]?.answer === optionIndex ? 'selected' : ''
                                                } ${
                                                    question.correct_answer === optionIndex ? 'correct' : ''
                                                } ${
                                                    attempt.answers[index]?.answer === optionIndex && 
                                                    attempt.answers[index]?.answer !== question.correct_answer ? 'incorrect' : ''
                                                }`}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'true_false' && (
                                    <div className="options">
                                        <div className={`answer-option ${attempt.answers[index]?.answer === true ? 'selected' : ''}`}>
                                            True
                                        </div>
                                        <div className={`answer-option ${attempt.answers[index]?.answer === false ? 'selected' : ''}`}>
                                            False
                                        </div>
                                    </div>
                                )}

                                {question.explanation && (
                                    <div className="explanation">
                                        <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button className="close-btn" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading">Loading quiz results...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!quiz) return <div className="error-message">Quiz not found</div>;

    return (
        <div className="quiz-results-page">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back to Course
                </button>
                <h1>{quiz.title} - Results</h1>
            </div>

            <div className="results-overview">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Attempts</h3>
                        <p>{results.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Average Score</h3>
                        <p>
                            {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}%
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>Pass Rate</h3>
                        <p>
                            {((analytics.passingRate.passed / results.length) * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>Average Time</h3>
                        <p>
                            {Math.round(
                                results.reduce((sum, r) => sum + r.completion_time, 0) / results.length
                            )} min
                        </p>
                    </div>
                </div>
            </div>

            <div className="analytics-section">
                <div className="chart-container">
                    <h2>Score Distribution</h2>
                    <Bar data={scoreDistributionData} />
                </div>

                <div className="chart-container">
                    <h2>Question Performance</h2>
                    <Bar data={questionPerformanceData} />
                </div>

                <div className="chart-container">
                    <h2>Passing Rate</h2>
                    <div className="pie-chart-container">
                        <Pie data={passingRateData} />
                    </div>
                </div>
            </div>

            <div className="results-list">
                <h2>Individual Results</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Score</th>
                            <th>Time Taken</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(result => (
                            <tr key={result._id}>
                                <td>{result.student_name}</td>
                                <td>{result.score}%</td>
                                <td>{result.completion_time} min</td>
                                <td>
                                    <span className={`status ${result.score >= quiz.passing_score ? 'passed' : 'failed'}`}>
                                        {result.score >= quiz.passing_score ? 'Passed' : 'Failed'}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className="view-btn"
                                        onClick={() => setSelectedAttempt(result)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedAttempt && (
                <AttemptDetailsModal
                    attempt={selectedAttempt}
                    quiz={quiz}
                    onClose={() => setSelectedAttempt(null)}
                />
            )}
        </div>
    );
};

export default QuizResults; 