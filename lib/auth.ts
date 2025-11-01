import Cookies from 'js-cookie';
import type { AuthUser } from './redux/authSlice';

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userData = localStorage.getItem('admin_user');
  const token = Cookies.get('admin_token');
  
  return !!userData && !!token;
};

// Get user data from localStorage
export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Failed to parse user data:', error);
    // Clear invalid data
    localStorage.removeItem('admin_user');
    Cookies.remove('admin_token', { path: '/' });
  }
  
  return null;
};

// Set user data in localStorage and cookie
export const setUserData = (user: AuthUser, token?: string): void => {
  if (typeof window === 'undefined' || !user) {
    return;
  }
  
  try {
    localStorage.setItem('admin_user', JSON.stringify(user));
    // Store JWT token if provided, otherwise use user._id as fallback
    const tokenToStore = token || user._id || '';
    if (tokenToStore) {
      localStorage.setItem('admin_token', tokenToStore);
      Cookies.set('admin_token', tokenToStore, { expires: 7, path: '/' });
    }
  } catch (error) {
    console.error('Failed to set user data:', error);
  }
};

// Clear user data from localStorage and cookie
export const clearUserData = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_token');
  Cookies.remove('admin_token', { path: '/' });
};

// Get token from localStorage or cookie
export const getToken = (): string | null => {
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

// Refresh user data in localStorage
export const refreshUserData = (user: AuthUser): void => {
  if (typeof window === 'undefined' || !user) {
    return;
  }
  
  try {
    const currentData = localStorage.getItem('admin_user');
    if (currentData) {
      const updatedUser = { ...JSON.parse(currentData), ...user };
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    } else {
      setUserData(user);
    }
  } catch (error) {
    console.error('Failed to refresh user data:', error);
  }
}; 