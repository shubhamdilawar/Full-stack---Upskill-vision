import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import BannerImage from '../assets/banner.png';
const ManagerDashboard = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const channel = new BroadcastChannel('auth');
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
             const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get("http://127.0.0.1:5000/auth/current_user", {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.status === 200) {
                        setUserRole(response.data.role);
                    } else {
                        console.error("Failed to fetch user data:", response);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
             try {
                const response = await axios.get("http://127.0.0.1:5000/admin/users", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
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
                channel.close();
        };

    }, [navigate, channel]);
    const handleApprove = async (userId) => {
        const token = localStorage.getItem('token');
         try {
            const response = await axios.post(`http://127.0.0.1:5000/admin/approve/${userId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
             if(response.status === 200) {
                // Update UI immediately
                 setUsers(users.map(user =>
                    user.id === userId ? {...user, status: 'approved'} : user
                ));
            }
        }
         catch(error) {
             console.error("Error approving user: ", error);
         }
    };
      const handleRemove = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`http://127.0.0.1:5000/admin/remove/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
             if(response.status === 200) {
                 setUsers(users.filter(user => user.id !== userId));
             }
        }
        catch(error) {
            console.error("Error removing user:", error);
        }
     };
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
          localStorage.removeItem("user_id");
        localStorage.removeItem("loginEvent");
         channel.postMessage('logout');
        navigate("/");
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1 style={{ display: 'flex', alignItems: 'center' }}>
                    Upskill Vision
                       {userRole && (
                           <span className="dashboard-tag">{userRole === "HR Admin" ? "HR Admin Dashboard" : "Manager Dashboard"}</span>
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
                 <div className="dashboard-actions">
                    <button onClick={() => navigate("/create-course")}>
                        Create Your Course
                    </button>
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                     {user.role === 'Manager' || user.role === 'HR' || user.role === "HR Admin" ? (
                                        user.status === 'pending' ? (
                                            <button className="approve-btn" onClick={() => handleApprove(user.id)}>✓</button>
                                         ) : (
                                                <span style={{ color: 'green' }}>Approved</span>
                                          )
                                     ) : (
                                         <span>Not Applicable</span>
                                    )}
                                     <button className="remove-btn" onClick={() => handleRemove(user.id)}>x</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
                 <p className="inspirational-quote">"The best way to predict the future is to create it." — Peter Drucker</p>
        </div>
    );
};

export default ManagerDashboard;