import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft } from 'lucide-react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { theme } from '../theme';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Container = styled.div`
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
`;

const PageTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 32px;
  line-height: 1.5;
`;

const Content = styled.div`
  flex: 1;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  margin-bottom: 30px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  background: ${theme.colors.background_secondary};
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  color: ${theme.colors.text_secondary};
  box-sizing: border-box;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    outline: none;
    background: #f0f0f0;
  }
`;

const EyeIcon = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text_secondary};
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PasswordRequirements = styled.div`
  color: ${theme.colors.text_secondary};
  font-size: 1rem;
  margin: 8px 0 16px 0;
`;

const Requirement = styled.div`
  color: ${(props) => (props.met ? "#4CAF50" : theme.colors.text_secondary)};
  transition: color 0.2s ease;

  &::before {
    content: "${(props) => (props.met ? "✓" : "✗")}";
    margin-right: 8px;
    font-weight: bold;
  }
`;

const ResetButton = styled.button`
  width: 100%;
  background: ${theme.colors.text};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: ${theme.colors.text};
  margin-bottom: 8px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.red};
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: ${theme.colors.green};
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
`;

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: security questions, 3: new password
  const [email, setEmail] = useState('');
  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation checks
  const hasValidLength = newPassword.length >= 8 && newPassword.length <= 20;
  const hasLetters = /[a-zA-Z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasAllRequired = hasLetters && hasNumbers && hasSpecialChars;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSecurityQuestion1(res.data.securityQuestion1);
      setSecurityQuestion2(res.data.securityQuestion2);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to retrieve security questions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (!answer1.trim() || !answer2.trim()) {
      setError('Please answer both security questions');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/auth/verify-security`, { 
        email, 
        answer1, 
        answer2 
      });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.msg || 'Security answers do not match');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasValidLength) {
      setError('Password must be 8-20 characters long');
      return;
    }
    
    if (!hasAllRequired) {
      setError('Password must contain letters, numbers, and special characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { 
        resetToken, 
        newPassword 
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        window.history.back();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    } else {
      window.history.back();
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </BackButton>
        <Title>Forgot password</Title>
      </Header>
      
      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {step === 1 && (
          <>
            <PageTitle>Reset Your Password</PageTitle>
            <Subtitle>Enter your email address to retrieve your security questions.</Subtitle>
            <form onSubmit={handleEmailSubmit}>
              <InputContainer>
                <Input
                  type="email"
                  placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputContainer>
            
              <ResetButton 
                type="submit" 
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? 'Checking...' : 'Continue'}
              </ResetButton>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <PageTitle>Answer Security Questions</PageTitle>
            <Subtitle>Please answer both security questions to verify your identity.</Subtitle>
            <form onSubmit={handleSecuritySubmit}>
              <InputContainer>
                <Label>{securityQuestion1}</Label>
              <Input
                type="text"
                placeholder="Answer"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                required
              />
            </InputContainer>

            <InputContainer>
              <Label>{securityQuestion2}</Label>
              <Input
                type="text"
                placeholder="Answer"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                required
              />
            </InputContainer>
            
              <ResetButton 
                type="submit" 
                disabled={isSubmitting || !answer1.trim() || !answer2.trim()}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Answers'}
              </ResetButton>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <PageTitle>Create New Password</PageTitle>
            <Subtitle>Your identity has been verified. Enter your new password below.</Subtitle>
            <form onSubmit={handlePasswordSubmit}>
              <InputContainer>
                <Label>New Password</Label>
                <InputWrapper>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <EyeIcon onClick={() => setShowNewPassword(v => !v)}>
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </EyeIcon>
                </InputWrapper>
              </InputContainer>

              <InputContainer>
                <Label>Confirm Password</Label>
                <InputWrapper>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <EyeIcon onClick={() => setShowConfirmPassword(v => !v)}>
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </EyeIcon>
                </InputWrapper>
              </InputContainer>

              <PasswordRequirements>
                <div style={{ marginBottom: "8px" }}>
                  <b>Your password must have:</b>
                </div>
                <Requirement met={hasValidLength}>8 to 20 characters</Requirement>
                <Requirement met={hasAllRequired}>
                  Letters, numbers, and special characters
                </Requirement>
              </PasswordRequirements>
            
              <ResetButton 
                type="submit" 
                disabled={isSubmitting || !newPassword || !confirmPassword}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </ResetButton>
            </form>
          </>
        )}
      </Content>
    </Container>
  );
}

export default ForgotPassword;
