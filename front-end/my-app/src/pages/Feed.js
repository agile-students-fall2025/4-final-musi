import React from 'react';
import styled from 'styled-components';
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

function Feed() {
  return (
    <Container>
      <Title>Feed</Title>
      <p>Your feed content will appear here</p>
    </Container>
  );
}

export default Feed;