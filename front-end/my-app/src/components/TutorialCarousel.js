import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { FiArrowLeft } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

const CarouselContainer = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${theme.colors.background_secondary};
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  position: relative;
`;

const BackArrowButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: ${theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 16px;
  margin-top: 16px;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.text_secondary};
  line-height: 1.6;
  margin-bottom: 32px;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 24px;
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? theme.colors.accent : theme.colors.text_secondary};
  transition: all 0.3s ease;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SkipButton = styled(Button)`
  background: transparent;
  color: ${theme.colors.text_secondary};
  border: 2px solid ${theme.colors.text_secondary};
`;

const NextButton = styled(Button)`
  background: ${theme.colors.accent};
  color: white;
`;

const tutorialSteps = [
  {
    icon: '🎵',
    title: 'Welcome to Musi!',
    description: 'Discover new music, rate songs, and share your taste with friends.'
  },
  {
    icon: '⭐',
    title: 'Rate & Review',
    description: 'Listen to songs and give them a rating. Your reviews help others discover great music!'
  },
  {
    icon: '🔥',
    title: 'Build Your Streak',
    description: 'Listen to at least one song daily to maintain your streak and climb the leaderboard.'
  },
  {
    icon: '👥',
    title: 'Connect with Others',
    description: 'Follow friends, see what they\'re listening to, and discover music through their activity.'
  },
  {
    icon: '📊',
    title: 'Track Your Taste',
    description: 'View your music statistics, favorite genres, and get personalized recommendations.'
  }
];

function TutorialCarousel({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <Overlay>
      <CarouselContainer>
        <BackArrowButton 
          onClick={handleBack} 
          disabled={isFirstStep}
          style={{ visibility: isFirstStep ? 'hidden' : 'visible' }}
        >
          <FiArrowLeft />
        </BackArrowButton>

        <Icon>{step.icon}</Icon>
        <Title>{step.title}</Title>
        <Description>{step.description}</Description>
        
        <DotsContainer>
          {tutorialSteps.map((_, index) => (
            <Dot key={index} active={index === currentStep} />
          ))}
        </DotsContainer>

        <ButtonContainer>
          {!isLastStep ? (
            <>
              <SkipButton onClick={handleSkip}>Skip</SkipButton>
              <NextButton onClick={handleNext}>Next</NextButton>
            </>
          ) : (
            <NextButton onClick={handleNext}>Get Started</NextButton>
          )}
        </ButtonContainer>
      </CarouselContainer>
    </Overlay>
  );
}

export default TutorialCarousel;