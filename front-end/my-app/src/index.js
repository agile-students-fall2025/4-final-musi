import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components
import './index.css'; 
import App from './App';
import Welcome from './pages/welcome'; 
import Login from './pages/login'; 
import Signup from './pages/signup';
import Onboarding from './pages/onboarding'; 
import reportWebVitals from './reportWebVitals'; 
import { ThemeProvider } from 'styled-components'; 
import { theme } from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/app" element={<App />} /> 
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/onboarding" element={<Onboarding />} /> 
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();