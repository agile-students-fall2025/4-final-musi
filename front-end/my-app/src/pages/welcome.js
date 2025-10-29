import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";

const Screen = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  background: linear-gradient(to top, ${theme.colors.background} 40%, ${theme.colors.background_secondary} 100%);
  padding: 2rem 1.5rem;
`;

const Title = styled.h4`
  color: ${theme.colors.accent};
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  font-weight: 700;
  align-self: flex-start;
`;

const Subtitle = styled.h2`
  font-size: 1.6rem;
  color: ${theme.colors.text}; 
  line-height: 1.3;
  margin: 0 0 2rem 0;
  align-self: flex-start;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 2rem;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.active ? theme.colors.text : theme.colors.text_secondary)};
`;

const Button = styled.button`
  background: ${theme.colors.accent}; // Use accent color from theme
  color: white;
  border: none;
  border-radius: 12px;
  width: 100%;
  padding: 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const content = {
  titles: ["DISCOVER", "VIBE", "CONNECT"],
  subtitles: [
    "See what others are listening to, one song at a time.",
    "Scroll through the days moods, rate and discover your kind of sound.",
    "Match through music that truly gets you. Find your people.",
  ],
};

function Welcome() {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const handleDotClick = (index) => {
    setCurrentPage(index);
  };

  const handleContinue = () => {
    if (currentPage === 2) {
      navigate("/login");
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Screen>
      <Dots>
        {content.titles.map((_, index) => (
          <Dot
            key={index}
            active={currentPage === index}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </Dots>
      <Title>{content.titles[currentPage]}</Title>
      <Subtitle>{content.subtitles[currentPage]}</Subtitle>
      <Button onClick={handleContinue}>
        {currentPage === 2 ? "Get Started" : "Continue"}
      </Button>
    </Screen>
  );
}

export default Welcome;