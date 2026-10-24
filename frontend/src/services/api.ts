import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base URL from environment variable
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (or wherever you store it)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can transform the response data here if needed
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with a status other than 2xx
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          // You might want to redirect to login page here
          console.error('Unauthorized access - redirecting to login');
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Forbidden: Insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 429:
          // Too many requests
          console.error('Too many requests - please try again later');
          break;
        case 500:
          // Server error
          console.error('Server error - please try again later');
          break;
        default:
          console.error(`Request failed with status ${error.response.status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API utility functions
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Export the configured axios instance
export default api;