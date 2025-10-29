import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Home, List, Search, BarChart3, User } from 'lucide-react';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  z-index: 1000;
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.active ? '#000' : '#666'};
  font-size: 12px;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/app/feed', label: 'Feed', icon: Home },
    { path: '/app/lists', label: 'Your lists', icon: List },  // Changed path
    { path: '/app/search', label: 'Search', icon: Search },
    { path: '/app/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { path: '/app/profile', label: 'Profile', icon: User },
  ];

  return (
    <NavContainer>
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavItem
          key={path}
          active={location.pathname === path}
          onClick={() => navigate(path)}
        >
          <Icon />
          <span>{label}</span>
        </NavItem>
      ))}
    </NavContainer>
  );
}

export default BottomNavBar;