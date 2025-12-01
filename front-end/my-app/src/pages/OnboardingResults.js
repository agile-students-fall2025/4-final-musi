import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../theme";
import { Check } from "lucide-react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 32px 24px;
  text-align: center;
`;

const CheckmarkCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${theme.colors.text};
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 32px;
  line-height: 1.5;
`;

const ResultsSection = styled.div`
  width: 100%;
  max-width: 400px;
  margin-bottom: 32px;
`;

const ResultItem = styled.div`
  background: ${theme.colors.background_secondary};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  text-align: left;
`;

const ResultLabel = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResultValue = styled.div`
  font-size: 1.1rem;
  color: ${theme.colors.text};
  font-weight: 600;
`;

const ResultList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background: ${theme.colors.accent};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const Button = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 18px 0;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

function OnboardingResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const answers = location.state?.answers || {};

  const handleContinue = () => {
    navigate("/app");
  };

  return (
    <Container>
      <CheckmarkCircle>
        <Check size={40} color="white" strokeWidth={3} />
      </CheckmarkCircle>

      <Title>All Set! 🎉</Title>
      <Subtitle>
        Your music profile is ready. Let's start discovering songs that match your vibe!
      </Subtitle>

      <ResultsSection>
        {answers.genres && answers.genres.length > 0 && (
          <ResultItem>
            <ResultLabel>Genres to Avoid</ResultLabel>
            <ResultList>
              {answers.genres.map((genre) => (
                <Tag key={genre}>{genre}</Tag>
              ))}
            </ResultList>
          </ResultItem>
        )}

        {answers.listen_time && (
          <ResultItem>
            <ResultLabel>Listening Time</ResultLabel>
            <ResultValue>{answers.listen_time}</ResultValue>
          </ResultItem>
        )}

        {answers.listen_location && (
          <ResultItem>
            <ResultLabel>Listening Location</ResultLabel>
            <ResultValue>{answers.listen_location}</ResultValue>
          </ResultItem>
        )}

        {answers.decade && (
          <ResultItem>
            <ResultLabel>Favorite Decade</ResultLabel>
            <ResultValue>{answers.decade}</ResultValue>
          </ResultItem>
        )}
      </ResultsSection>

      <Button onClick={handleContinue}>Start Exploring</Button>
    </Container>
  );
}

export default OnboardingResults;