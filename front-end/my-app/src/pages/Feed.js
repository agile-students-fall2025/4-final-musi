import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${theme.colors.text};
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    opacity: 0.85;
  }
`;

function Feed() {
  const navigate = useNavigate();

  const handleGoToMusic = () => {
    // ✅ Navigate to the Music page with mock data
    navigate('/app/music');
  };

  return (
    <Container>
      <Title>Feed</Title>
      <p>Your feed content will appear here</p>

      {/* ✅ Button to navigate to Music */}
      <Button onClick={handleGoToMusic}>Go to Music Page</Button>
    </Container>
  );
}

export default Feed;