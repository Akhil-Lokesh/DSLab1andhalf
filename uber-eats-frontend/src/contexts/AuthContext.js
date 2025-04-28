import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/auth';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // State for auth data
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // Use getCurrentUser to check auth status
        const response = await getCurrentUser();
        
        if (response && response.data && response.data.user) {
          const { user } = response.data;
          handleLoginSuccess(user, user.role);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Helper to clear auth state
  const clearAuthState = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
  };

  // Handle successful login
  const handleLoginSuccess = (userData, type) => {
    console.log('Login success with data:', userData);
    
    // Clean up any empty strings
    const cleanedData = userData ? {
      ...userData,
      // Convert empty strings to null values for consistency
      address: userData.address && userData.address.trim() !== '' ? userData.address : null,
      city: userData.city && userData.city.trim() !== '' ? userData.city : null,
      state: userData.state && userData.state.trim() !== '' ? userData.state : null,
      phone: userData.phone && userData.phone.trim() !== '' ? userData.phone : null,
    } : null;
    
    setCurrentUser(cleanedData);
    setUserType(type);
    setIsAuthenticated(true);
  };

  // Update current user data
  const updateUserData = (userData) => {
    if (!userData) return;
    
    console.log('Updating auth context with new user data:', userData);
    
    // Update only the fields that are provided
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      
      // Even if API fails, clear session on client-side
      clearAuthState();
    }
  };

  // Check if user is a customer
  const isCustomer = userType === 'customer';
  
  // Check if user is a restaurant
  const isRestaurant = userType === 'restaurant';

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    userType,
    isCustomer,
    isRestaurant,
    handleLoginSuccess,
    updateUserData,
    handleLogout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};