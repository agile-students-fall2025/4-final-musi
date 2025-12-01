import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; 
import App from './App';
import Welcome from './pages/welcome'; 
import Login from './pages/login'; 
import Signup from './pages/signup';
import Onboarding from './pages/onboarding'; 
import OnboardingResults from './pages/OnboardingResults';
import ForgotPassword from './pages/forgot'; 
import reportWebVitals from './reportWebVitals'; 
import { ThemeProvider } from 'styled-components'; 
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} /> 
            <Route path="/login" element={<Login />} /> 
            <Route path="/signup" element={<Signup />} /> 
            <Route path="/forgot" element={<ForgotPassword />} /> 
            <Route path="/onboarding" element={<Onboarding />} /> 
            <Route path="/app/*" element={<App />} />
            <Route path="/onboarding/results" element={<OnboardingResults />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();