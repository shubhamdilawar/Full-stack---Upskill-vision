import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../styles/Dashboard.css';
import axios from '../utils/axios';
import { useNavigate } from "react-router-dom";
import BannerImage from '../assets/banner.png';
import AdminEditSuite from './AdminEditSuite';
import ParticipantPerformance from './ParticipantPerformance';

const HRAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [channel] = useState(() => new BroadcastChannel('auth'));
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentUserId, setCurrentUserId] = useState(null);

    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get("/auth/users", {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                console.log('Users data:', response.data.users);
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response?.status === 401) {
                // Handle unauthorized access
                handleLogout();
            }
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get("/auth/current_user", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setCurrentUserId(response.data.id);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
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
        
        fetchUserData();
        fetchUsers();

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
            if (channel) {
                channel.close();
            }
        };
    }, [navigate, channel, fetchUserData, fetchUsers]);

    const handleApprove = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                `/auth/approve_user/${userId}`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.status === 200) {
                await fetchUsers();
            }
        } catch (error) {
            console.error("Error approving user:", error);
        }
    };

    const isCurrentUser = (userId) => {
        const currentUserId = localStorage.getItem('user_id');
        return userId === currentUserId;
    };

    const handleRemove = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`/auth/remove-user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                setUsers(users.filter(user => user._id !== userId));
            }
        } catch (error) {
            console.error("Error removing user:", error);
        }
    };

    const handleLogout = () => {
        try {
            if (channel) {
                try {
                    channel.postMessage('logout');
                } catch (error) {
                    console.log('Channel closed, proceeding with logout');
                } finally {
                    channel.close();
                }
            }
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            localStorage.clear();
            navigate('/login');
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `/auth/users/${userId}/status`,
                { status: newStatus },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.status === 200) {
                await fetchUsers();
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 style={{ display: 'flex', alignItems: 'center' }}>
                    Upskill Vision
                    {userRole && (
                        <span className="dashboard-tag">
                            {userRole === "HR Admin" ? "HR Admin Dashboard" : "Manager Dashboard"}
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

            <div className="content">
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        Course Management
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        Performance Analytics
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div className="users-section">
                        <h2>User Management</h2>
                        <div className="user-filters">
                            <div className="search-box">
                                <input 
                                    type="text" 
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <select 
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Roles</option>
                                <option value="HR Admin">HR Admin</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Manager">Manager</option>
                                <option value="Participant">Participant</option>
                            </select>
                        </div>
                        {filteredUsers.length > 0 ? (
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr 
                                            key={user._id}
                                            className={user.status === 'suspended' ? 'suspended-user' : ''}
                                        >
                                            <td>{`${user.first_name || ''} ${user.last_name || ''}`}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${user.status}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                {user.role === 'Instructor' && user.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApprove(user._id)}
                                                        className="approve-btn"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemove(user._id)}
                                                    className="remove-btn"
                                                    disabled={user._id === currentUserId}
                                                    title={user._id === currentUserId ? "You cannot remove your own account" : "Remove user"}
                                                >
                                                    Remove
                                                </button>
                                                <select
                                                    value={user.status}
                                                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                                    className="status-select"
                                                    disabled={user._id === currentUserId}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-results">
                                No users found matching your search criteria
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'courses' && <AdminEditSuite />}

                {activeTab === 'performance' && <ParticipantPerformance />}
            </div>
            <p className="inspirational-quote">
                "The best way to predict the future is to create it." — Peter Drucker
            </p>
        </div>
    );
};

export default HRAdminDashboard;