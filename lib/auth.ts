import Cookies from 'js-cookie';
import { User } from './redux/authSlice';

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
export const getUser = (): User | null => {
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
export const setUserData = (user: User): void => {
  if (typeof window === 'undefined' || !user) {
    return;
  }
  
  try {
    localStorage.setItem('admin_user', JSON.stringify(user));
    Cookies.set('admin_token', user._id, { expires: 7, path: '/' });
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
  Cookies.remove('admin_token', { path: '/' });
};

// Refresh user data in localStorage
export const refreshUserData = (user: User): void => {
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