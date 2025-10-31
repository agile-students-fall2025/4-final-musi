import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronLeft } from 'react-icons/fa';
import { theme } from "../theme";

const ArrowButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${theme.colors.text}; 
  font-size: 24px;
`;

const BackArrow = () => {
  const navigate = useNavigate();

  return (
    <ArrowButton onClick={() => navigate(-1)}>
      <FaChevronLeft />
    </ArrowButton>
  );
};

export default BackArrow;