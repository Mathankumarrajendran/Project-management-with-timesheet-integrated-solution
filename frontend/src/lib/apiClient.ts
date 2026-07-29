import axios from 'axios';

const getApiBaseUrl = () => {
    // 1. Explicit environment variable if configured
    if (process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_BASE_URL.includes('localhost')) {
        return process.env.NEXT_PUBLIC_API_BASE_URL;
    }
    // 2. Dynamic runtime resolution in browser
    if (typeof window !== 'undefined') {
        const { protocol, hostname, port } = window.location;
        // Direct port access (3000/8080) -> backend is on 5000
        if (port === '3000' || port === '8080') {
            return `${protocol}//${hostname}:5000/api`;
        }
        // Nginx/Traefik reverse proxy -> /api on same host
        return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
};

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dynamic base URL check per request
apiClient.interceptors.request.use(
    (config) => {
        config.baseURL = getApiBaseUrl();
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


// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
