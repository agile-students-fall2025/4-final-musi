import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import axios from "axios";

const Screen = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  background: linear-gradient(
      to top,
      ${theme.colors.background} 0%,
      transparent 60%
    ),
    linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3)),
    url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 2rem 1.5rem;
  transition: background-image 0.5s ease-in-out;
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
  background: ${(props) =>
    props.active ? theme.colors.text : theme.colors.text_secondary};
  cursor: pointer;
  transition: background 0.2s ease;
`;

const Button = styled.button`
  background: ${theme.colors.accent};
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
  backgrounds: [
    "https://res.cloudinary.com/dsogx3xli/image/upload/v1762909955/discover_spjegf.jpg",
    "https://res.cloudinary.com/dsogx3xli/image/upload/v1762909935/vibe_pyytno.jpg",
    "https://res.cloudinary.com/dsogx3xli/image/upload/v1762910020/Screenshot_2025-11-11_at_8.13.26_PM_b4ocf6.png",
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
    <Screen backgroundImage={content.backgrounds[currentPage]}>
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
