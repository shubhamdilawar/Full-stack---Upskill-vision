import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
<<<<<<< HEAD
    },
    withCredentials: true
=======
    }
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
<<<<<<< HEAD
=======
        console.log('Making request to:', config.baseURL + config.url);
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

<<<<<<< HEAD
=======
instance.interceptors.response.use(
    (response) => {
        console.log(`API Response [${response.config.url}]:`, response.data);
        return response;
    },
    (error) => {
        console.error(`API Error [${error.config?.url}]:`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
export default instance; 