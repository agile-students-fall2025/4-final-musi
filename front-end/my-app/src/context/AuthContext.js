import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = '/api';

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor: ensure token is always included
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !config.headers['x-auth-token']) {
          config.headers['x-auth-token'] = storedToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: handle 401 errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired, clear it
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          
          // Only redirect if not already on login/register page
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/signup') &&
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['x-auth-token'] = storedToken;
      } else {
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const register = async (username, email, password, securityQuestions = {}) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { 
        username, 
        email, 
        password,
        securityQuestion1: securityQuestions.securityQuestion1,
        securityAnswer1: securityQuestions.securityAnswer1,
        securityQuestion2: securityQuestions.securityQuestion2,
        securityAnswer2: securityQuestions.securityAnswer2,
      });
      setToken(res.data.token);
      return true; 
    } catch (err) {
      throw err.response ? err.response.data.msg : 'Registration failed';
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      return true;
    } catch (err) {
      throw err.response ? err.response.data.msg : 'Login failed';
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/profile`);
      
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return true;
    } catch (err) {
      console.error("Delete account error:", err);
      throw err.response ? err.response.data.msg : 'Could not delete account';
    }
  };

  if (loading) {
    return <div style={{padding: "50px", textAlign: "center"}}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};