import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get token (avoids circular dependency)
const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // First try localStorage
    const token = localStorage.getItem('admin_token');
    if (token) {
      return token;
    }
    
    // Fallback to cookie
    const cookieToken = Cookies.get('admin_token');
    if (cookieToken) {
      return cookieToken;
    }
  } catch (error) {
    console.error('Failed to get token:', error);
  }
  
  return null;
};

// Request interceptor to add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

