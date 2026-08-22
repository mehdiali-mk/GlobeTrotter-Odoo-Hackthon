import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8088/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Assuming token might be stored in localStorage as 'globetrotter.token'
    const token = localStorage.getItem('globetrotter.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and session
      localStorage.removeItem('globetrotter.token');
      localStorage.removeItem('globetrotter.session');
      console.warn('Unauthorized request - session cleared');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
