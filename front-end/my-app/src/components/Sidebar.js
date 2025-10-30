import React from 'react';
import styled from 'styled-components';
import { X, Settings, Edit, LogOut } from 'lucide-react';
import { theme } from '../theme';
import { useNavigate } from 'react-router-dom';

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999; /* Increased z-index to ensure it's above everything */
  display: ${props => props.isOpen ? 'block' : 'none'};
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 320px;
  background: white;
  z-index: 10000; /* Higher z-index than overlay and bottom nav */
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const SidebarTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const MenuList = styled.div`
  flex: 1;
  padding: 20px 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f8f8;
  }
`;

const MenuIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text_secondary};
`;

const MenuText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${theme.colors.text};
`;

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
    onClose();
  };

  const handleEditProfileClick = () => {
    navigate('/app/profile');
    onClose();
  };

  const handleLogOutClick = () => {
    navigate('/login');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClick={handleOverlayClick} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <SidebarTitle>Menu</SidebarTitle>
          <CloseButton onClick={onClose}>
            <X size={20} color="#666" />
          </CloseButton>
        </SidebarHeader>
        
        <MenuList>
          <MenuItem onClick={handleSettingsClick}>
            <MenuIcon>
              <Settings size={20} />
            </MenuIcon>
            <MenuText>Settings</MenuText>
          </MenuItem>
          
          <MenuItem onClick={handleEditProfileClick}>
            <MenuIcon>
              <Edit size={20} />
            </MenuIcon>
            <MenuText>Edit profile</MenuText>
          </MenuItem>
          
          <MenuItem onClick={handleLogOutClick}>
            <MenuIcon>
              <LogOut size={20} />
            </MenuIcon>
            <MenuText>Log Out</MenuText>
          </MenuItem>
        </MenuList>
      </SidebarContainer>
    </>
  );
}

export default Sidebar;