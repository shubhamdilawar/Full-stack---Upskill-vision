import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('role');

            if (!token || !userRole) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('/auth/current_user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 200) {
                    const userData = response.data;
                    console.log('Auth check successful:', userData);

                    // Check if user role is allowed
                    if (allowedRoles && !allowedRoles.includes(userRole)) {
                        console.log('Role not allowed:', userRole, 'Allowed roles:', allowedRoles);
                        navigate('/login');
                        return;
                    }

                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.clear();
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate, allowedRoles]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : null;
};

export default ProtectedRoute; 