import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft } from 'lucide-react';
import { theme } from '../theme';

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

const Content = styled.div`
  flex: 1;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  margin-bottom: 30px;
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

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Here you would typically show a success message or redirect
      alert('Password reset link sent to your email!');
    }, 2000);
  };

  const handleBack = () => {
    // Navigate back to login
    window.history.back();
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
        <form onSubmit={handleSubmit}>
          <InputContainer>
            <Input
              type="email"
              placeholder="Username or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputContainer>
          
          <ResetButton 
            type="submit" 
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? 'Sending...' : 'Reset password'}
          </ResetButton>
        </form>
      </Content>
    </Container>
  );
}

export default ForgotPassword;
