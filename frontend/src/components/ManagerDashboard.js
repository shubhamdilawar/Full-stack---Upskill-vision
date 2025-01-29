import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/Dashboard.css';
import axios from '../utils/axios';
import { useNavigate } from "react-router-dom";
import TeamPerformance from './TeamPerformance';
import BannerImage from '../assets/banner.png';

const ManagerDashboard = () => {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [detailedMetrics, setDetailedMetrics] = useState(null);
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userMetrics, setUserMetrics] = useState({});
    
    const channel = useMemo(() => new BroadcastChannel('auth'), []);

    const fetchUserMetrics = async (userId) => {
        try {
            console.log('Fetching metrics for user:', userId); // Debug log
            const response = await axios.get(`/courses/user/${userId}/metrics`);
            console.log('Metrics response:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error(`Error fetching metrics for user ${userId}:`, error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Status code:', error.response.status);
            }
            return null;
        }
    };

    const fetchUsers = useCallback(async (token) => {
        try {
            setLoading(true);
            const response = await axios.get('/auth/team-members');
            if (response.data && response.data.teamMembers) {
                const members = response.data.teamMembers;
                setUsers(members);
                
                // Fetch metrics for each user
                const metrics = {};
                for (const member of members) {
                    if (member.role === 'Participant') {
                        const userMetrics = await fetchUserMetrics(member._id);
                        if (userMetrics) {
                            metrics[member._id] = userMetrics;
                        }
                    }
                }
                setUserMetrics(metrics);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching team members:', error);
            setError('Failed to load team members');
            setLoading(false);
        }
    }, []);
    

     useEffect(() => {
         const handleStorageChange = (event) => {
            if (event.key === 'loginEvent' && event.newValue === 'loggedIn') {
                const token = localStorage.getItem('token');
                 if (token) {
                     localStorage.removeItem("token");
                     localStorage.removeItem("role");
                     localStorage.removeItem("user_id");
                     navigate("/");
                 }
             }
        };
        window.addEventListener('storage', handleStorageChange);


        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/auth/current_user');
                setUserRole(response.data.role);
                
                // Fetch team members regardless of role since this is ManagerDashboard
                const token = localStorage.getItem('token');
                if (token) {
                    fetchUsers(token);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load dashboard');
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
       

        fetchUserData();

        channel.onmessage = (event) => {
            if (event.data === 'logout') {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user_id");
                navigate("/");
            }
        };

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            channel.close();
        };
    }, [navigate, channel, fetchUsers]);


    const handleApprove = async (userId) => {
        try {
            await axios.put(`/auth/approve_user/${userId}`);
            const token = localStorage.getItem('token');
            if (token) {
              fetchUsers(token);
            }
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

      const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user_id");
             localStorage.removeItem("loginEvent");
            if (channel) {
                channel.postMessage('logout');
            }
           
            navigate("/");
        } catch (error) {
            console.error('Error during logout:', error);
            navigate("/");
        }
    };

    const handleRemove = async (userId) => {
       try {
            await axios.delete(`/auth/remove-user/${userId}`);
            const token = localStorage.getItem('token');
           if (token) {
                fetchUsers(token);
             }
       } catch (error) {
           console.error('Error removing user:', error);
        }
    };

    const handleParticipantClick = async (userId) => {
        try {
            console.log('Fetching detailed metrics for user:', userId); // Debug log
            const response = await axios.get(`/courses/user/${userId}/detailed-metrics`);
            console.log('Detailed metrics response:', response.data); // Debug log
            setSelectedParticipant(userId);
            setDetailedMetrics(response.data);
        } catch (error) {
            console.error('Error fetching detailed metrics:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };

    if(loading) return <div className="loading">Loading dashboard...</div>;
     if (error) return <div className="error">{error}</div>;
    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 style={{ display: 'flex', alignItems: 'center' }}>
                    Upskill Vision
                    {userRole && (
                        <span className="dashboard-tag">
                            {userRole} Dashboard
                        </span>
                    )}
                </h1>
                <div className="user-info">
                    <span>Welcome, {userRole}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            <div className="banner">
                <img src={BannerImage} alt="Banner" />
            </div>

            <div className="dashboard-navigation">
                <div className="tab-navigation">
                    <button 
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Team Overview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        Performance Tracking
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' ? (
                    <div className="team-overview">
                        <h2>Team Overview</h2>
                        <div className="table-container">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Course Progress</th>
                                        <th>Quiz Performance</th>
                                        <th>Course Status</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((member) => (
                                        <tr key={member._id} 
                                            className={member.role === 'Participant' ? 'participant-row' : ''}
                                            onClick={() => member.role === 'Participant' && handleParticipantClick(member._id)}
                                        >
                                            <td>{member.first_name} {member.last_name}</td>
                                            <td>{member.email}</td>
                                            <td>{member.role}</td>
                                            {member.role === 'Participant' && userMetrics[member._id] ? (
                                                <>
                                                    <td>
                                                        <div className="progress-bar-container">
                                                            <div 
                                                                className="progress-bar" 
                                                                style={{width: `${userMetrics[member._id].completion_rate}%`}}
                                                            ></div>
                                                            <span>{userMetrics[member._id].completion_rate}%</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="metrics-cell">
                                                            <span className="metric-value">
                                                                {userMetrics[member._id].average_quiz_score}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="metrics-cell">
                                                            <div>Active: {userMetrics[member._id].active_courses}</div>
                                                            <div>Completed: {userMetrics[member._id].completed_courses}</div>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td colSpan="3" className="no-metrics">
                                                        {member.role === 'Participant' ? 'No metrics available' : 'N/A'}
                                                    </td>
                                                </>
                                            )}
                                            <td>
                                                <span className={`status-badge ${member.status?.toLowerCase() || 'pending'}`}>
                                                    {member.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                {member.role === 'Participant' && (
                                                    <button 
                                                        className="view-details-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/participant/${member._id}/details`);
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <TeamPerformance />
                )}
            </div>

            {selectedParticipant && detailedMetrics && (
                <div className="detailed-metrics-modal">
                    <div className="modal-content">
                        <h3>Detailed Performance Metrics</h3>
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <h4>Learning Progress</h4>
                                <div className="progress-indicator">
                                    <div 
                                        className="progress-bar" 
                                        style={{width: `${detailedMetrics.overall_progress}%`}}
                                    />
                                    <span>{detailedMetrics.overall_progress}%</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <h4>Quiz Performance</h4>
                                <div className="quiz-stats">
                                    <p>Average Score: {detailedMetrics.quiz_average}%</p>
                                    <p>Completed: {detailedMetrics.quizzes_completed}</p>
                                    <p>Pending: {detailedMetrics.quizzes_pending}</p>
                                </div>
                            </div>
                            <div className="metric-card">
                                <h4>Course Engagement</h4>
                                <div className="engagement-stats">
                                    <p>Active Time: {detailedMetrics.active_time_hours}h</p>
                                    <p>Last Active: {new Date(detailedMetrics.last_active).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setSelectedParticipant(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            <p className="inspirational-quote">
                "The best way to predict the future is to create it." — Peter Drucker
            </p>
        </div>
    );
};

export default ManagerDashboard;