import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

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

  const api = axios.create({
    baseURL: 'http://localhost:3001/api', 
  });

  const register = async (username, email, password) => {
    try {
      const res = await api.post('/auth/register', { username, email, password });
      setToken(res.data.token);
      return true;
    } catch (err) {
      throw err.response ? err.response.data.msg : 'Registration failed';
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
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

  if (loading) {
    return <div style={{padding: "50px", textAlign: "center"}}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};