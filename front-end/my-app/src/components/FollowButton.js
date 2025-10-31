import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const Button = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  background: ${props => props.following ? 'white' : theme.colors.accent};
  color: ${props => props.following ? (theme.colors.text_secondary || theme.colors.text_secondary) : 'white'};
  border: 1px solid ${theme.colors.text_secondary || theme.colors.outline};

  &:hover {
    opacity: 0.9;
  }
`;

export default function FollowButton({ initialFollow = false }) {
  const [isFollowing, setIsFollowing] = useState(initialFollow);

  return (
    <Button
      following={isFollowing}
      onClick={() => setIsFollowing(!isFollowing)}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}