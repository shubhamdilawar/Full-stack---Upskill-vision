import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

instance.interceptors.request.use(
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

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 404) {
            console.error('API endpoint not found:', error.config.url);
        }
        if (error.response?.status === 500) {
            console.error('Server error:', error.response?.data);
            error.message = error.response?.data?.message || 'An unexpected error occurred';
        }
        return Promise.reject(error);
    }
);

export default instance; 