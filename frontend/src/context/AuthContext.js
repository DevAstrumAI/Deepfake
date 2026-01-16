import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://deepfake-qbl3.onrender.com';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });
      
      setUser(response.data);
      setToken(tokenToVerify);
      setLoading(false);
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        username,
        email,
        password
      });

      const { access_token, user: userData } = response.data;
      
      // Store token and user
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });

      const { access_token, user: userData } = response.data;
      
      // Store token and user
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      
      toast.success('Logged in successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully!');
  };

  const getAuthHeaders = () => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

