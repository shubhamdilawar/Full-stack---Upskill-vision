import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import '../styles/ParticipantPerformance.css';

const ParticipantPerformance = () => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMetric, setSelectedMetric] = useState('overall');

    useEffect(() => {
        fetchParticipantsData();
    }, []);

    const fetchParticipantsData = async () => {
        try {
            const response = await axios.get('/courses/participants/performance');
            setParticipants(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching participant data:', error);
            setError('Failed to fetch participant data');
            setLoading(false);
        }
    };

    const getPerformanceColor = (score) => {
        if (score >= 90) return '#4CAF50';
        if (score >= 75) return '#2196F3';
        if (score >= 60) return '#FFC107';
        return '#F44336';
    };

    const getPerformanceLabel = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Average';
        return 'Needs Improvement';
    };

    const getFilteredParticipants = () => {
        const searchFiltered = participants.filter(participant =>
            participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return searchFiltered.sort((a, b) => {
            switch (selectedMetric) {
                case 'overall':
                    return b.overallScore - a.overallScore;
                case 'courses':
                    return (b.completedCourses / b.totalCourses) - 
                           (a.completedCourses / a.totalCourses);
                case 'quizzes':
                    return b.quizAverage - a.quizAverage;
                case 'assignments':
                    return b.assignmentAverage - a.assignmentAverage;
                default:
                    return 0;
            }
        });
    };

    const filteredParticipants = getFilteredParticipants();

    const getFilteredStats = () => {
        const filtered = filteredParticipants;
        return {
            averagePerformance: filtered.length ? 
                (filtered.reduce((acc, p) => acc + p.overallScore, 0) / filtered.length).toFixed(1) : 0,
            activeCount: filtered.length,
            highPerformers: filtered.filter(p => p.overallScore >= 90).length
        };
    };

    return (
        <div className="users-section">
            <h2>Performance Analytics</h2>
            <div className="user-filters">
                <div className="search-box">
                    <input 
                        type="text"
                        placeholder="Search participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <select 
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="filter-select"
                >
                    <option value="overall">Sort by Overall Performance</option>
                    <option value="courses">Sort by Course Completion</option>
                    <option value="quizzes">Sort by Quiz Performance</option>
                    <option value="assignments">Sort by Assignment Scores</option>
                </select>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <span className="stat-title">Average Performance</span>
                    <span className="stat-value">
                        {getFilteredStats().averagePerformance}%
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-title">Active Participants</span>
                    <span className="stat-value">{getFilteredStats().activeCount}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-title">High Performers</span>
                    <span className="stat-value">
                        {getFilteredStats().highPerformers}
                    </span>
                </div>
            </div>

            <div className="performance-charts">
                <div className="chart-card">
                    <h3>Performance Distribution</h3>
                    <div className="chart-container">
                        <Doughnut
                            data={{
                                labels: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
                                datasets: [{
                                    data: [
                                        participants.filter(p => p.overallScore >= 90).length,
                                        participants.filter(p => p.overallScore >= 75 && p.overallScore < 90).length,
                                        participants.filter(p => p.overallScore >= 60 && p.overallScore < 75).length,
                                        participants.filter(p => p.overallScore < 60).length,
                                    ],
                                    backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336'],
                                    borderWidth: 0
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            padding: 15,
                                            font: {
                                                size: 11
                                            },
                                            boxWidth: 15
                                        }
                                    }
                                },
                                layout: {
                                    padding: {
                                        top: 10,
                                        bottom: 20
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Performance Trends</h3>
                    <div className="chart-container">
                        <Line
                            data={{
                                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                                datasets: [{
                                    label: 'Average Performance',
                                    data: [75, 78, 82, 85],
                                    borderColor: '#1976d2',
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            callback: value => `${value}%`,
                                            font: {
                                                size: 11
                                            }
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            font: {
                                                size: 11
                                            }
                                        }
                                    }
                                },
                                layout: {
                                    padding: {
                                        top: 10,
                                        right: 10,
                                        bottom: 10,
                                        left: 10
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {filteredParticipants.length > 0 ? (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Overall Score</th>
                            <th>Course Progress</th>
                            <th>Quiz Performance</th>
                            <th>Assignment Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParticipants.map(participant => (
                            <tr key={participant.id}>
                                <td>
                                    <div className="user-info">
                                        <span className="user-name">{participant.name}</span>
                                        <span className="user-email">{participant.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="progress-cell">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ 
                                                    width: `${participant.overallScore}%`,
                                                    backgroundColor: getPerformanceColor(participant.overallScore)
                                                }}
                                            ></div>
                                        </div>
                                        <span>{participant.overallScore}%</span>
                                    </div>
                                </td>
                                <td>
                                    {participant.completedCourses}/{participant.totalCourses}
                                    <div className="percentage-label">
                                        ({((participant.completedCourses/participant.totalCourses) * 100).toFixed(1)}%)
                                    </div>
                                </td>
                                <td>
                                    {participant.completedQuizzes}/{participant.totalQuizzes}
                                    <div className="percentage-label">
                                        ({participant.quizAverage}%)
                                    </div>
                                </td>
                                <td>{participant.assignmentAverage}%</td>
                                <td>
                                    <span 
                                        className={`status-badge ${getPerformanceLabel(participant.overallScore).toLowerCase()}`}
                                    >
                                        {getPerformanceLabel(participant.overallScore)}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="no-results">
                    No participants found matching your search criteria
                </div>
            )}
        </div>
    );
};

export default ParticipantPerformance; 