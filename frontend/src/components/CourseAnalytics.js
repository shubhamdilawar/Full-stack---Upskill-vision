import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from '../utils/axios';
import '../styles/CourseAnalytics.css';

const CourseAnalytics = () => {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`/courses/${courseId}/analytics`);
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const activityDistributionData = {
        labels: ['High', 'Medium', 'Low', 'Inactive'],
        datasets: [{
            data: analytics?.engagement.activity_distribution 
                ? Object.values(analytics.engagement.activity_distribution)
                : [],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)'
            ],
            borderWidth: 1
        }]
    };

    const gradeDistributionData = {
        labels: ['A', 'B', 'C', 'D', 'F'],
        datasets: [{
            label: 'Grade Distribution',
            data: analytics?.performance.grade_distribution 
                ? Object.values(analytics.performance.grade_distribution)
                : [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const improvementTrendData = {
        labels: analytics?.performance.improvement_trends.map(t => `Week ${t.week}`),
        datasets: [{
            label: 'Average Score',
            data: analytics?.performance.improvement_trends.map(t => t.average_score),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const peakActivityData = {
        labels: analytics?.time_metrics.peak_activity_hours.map(h => 
            `${h.hour}:00`
        ),
        datasets: [{
            label: 'Activity Count',
            data: analytics?.time_metrics.peak_activity_hours.map(h => 
                h.activity_count
            ),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    if (loading) return <div className="loading">Loading analytics...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!analytics) return <div className="error-message">No analytics data available</div>;

    return (
        <div className="analytics-page">
            <h1>Course Analytics</h1>

            <div className="metrics-overview">
                <div className="metric-card">
                    <h3>Total Students</h3>
                    <p className="metric-value">{analytics.engagement.total_students}</p>
                </div>
                <div className="metric-card">
                    <h3>Active Students</h3>
                    <p className="metric-value">{analytics.engagement.active_students}</p>
                    <p className="metric-label">Last 7 days</p>
                </div>
                <div className="metric-card">
                    <h3>Retention Rate</h3>
                    <p className="metric-value">{analytics.engagement.retention_rate}%</p>
                </div>
                <div className="metric-card">
                    <h3>Avg. Time per Student</h3>
                    <p className="metric-value">{analytics.time_metrics.average_time_per_student} min</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h2>Student Activity Distribution</h2>
                    <Pie data={activityDistributionData} />
                </div>

                <div className="chart-container">
                    <h2>Grade Distribution</h2>
                    <Bar data={gradeDistributionData} />
                </div>

                <div className="chart-container">
                    <h2>Performance Improvement Trend</h2>
                    <Line data={improvementTrendData} />
                </div>

                <div className="chart-container">
                    <h2>Peak Activity Hours</h2>
                    <Bar data={peakActivityData} />
                </div>
            </div>

            <div className="content-effectiveness">
                <h2>Content Effectiveness</h2>
                
                <div className="content-section">
                    <h3>Assignments</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Average Score</th>
                                <th>Completion Rate</th>
                                <th>Submissions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.content_effectiveness.assignments.map(assignment => (
                                <tr key={assignment.id}>
                                    <td>{assignment.title}</td>
                                    <td>{assignment.average_score}%</td>
                                    <td>{assignment.completion_rate}%</td>
                                    <td>{assignment.submission_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="content-section">
                    <h3>Quizzes</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Average Score</th>
                                <th>Completion Rate</th>
                                <th>Attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.content_effectiveness.quizzes.map(quiz => (
                                <tr key={quiz.id}>
                                    <td>{quiz.title}</td>
                                    <td>{quiz.average_score}%</td>
                                    <td>{quiz.completion_rate}%</td>
                                    <td>{quiz.attempt_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics; 