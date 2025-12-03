import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3001/api';

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

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
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