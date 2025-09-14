import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Use relative paths to leverage the proxy

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios interceptor for auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });
      
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Get user profile
      const userResponse = await axios.get('/auth/me');
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const signup = async (username, email, password, role = 'athlete') => {
    try {
      const response = await axios.post('/auth/signup', {
        username,
        email,
        password,
        role
      });
      
      // Auto-login after signup
      return await login(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isCoach: user?.role === 'coach',
    isAthlete: user?.role === 'athlete'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
