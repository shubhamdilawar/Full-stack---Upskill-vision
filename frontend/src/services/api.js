import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Add these API functions

// User Management
export const getAllUsers = () => api.get('/api/users/all');
export const approveUser = (userId) => api.put(`/api/users/approve/${userId}`);
export const rejectUser = (userId) => api.put(`/api/users/reject/${userId}`);

// Course Management
export const getAllCourses = () => api.get('/api/courses/all');
export const getInstructorCourses = (instructorId) => api.get(`/api/courses/instructor/${instructorId}`);
export const getEnrolledCourses = (studentId) => api.get(`/api/courses/enrolled/${studentId}`);

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats');

// Profile
export const getUserProfile = (userId) => api.get(`/api/profile/${userId}`);
export const updateProfile = (data) => api.put('/api/profile/update', data);

// Admin
export const getPendingApprovals = () => api.get('/api/admin/pending-approvals');
export const getCourseStats = () => api.get('/api/admin/course-stats'); 