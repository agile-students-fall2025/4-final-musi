import React, { useState } from "react";
import styled from "styled-components";
import { RiCloseCircleLine } from "react-icons/ri";
import BackArrow from "../components/BackArrow";
import { theme } from "../theme";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    id: "genres",
    type: "multi",
    title: (
      <>
        Select categories of songs you <i>don’t</i> vibe with.
      </>
    ),
    options: [
      "Pop",
      "Hip Hop",
      "Rock",
      "R&B",
      "Electronic",
      "Country",
      "Jazz",
      "Classical",
    ],
  },
  {
    id: "listen_time",
    type: "single",
    title: "When do you listen to music most?",
    options: ["Morning", "Afternoon", "Evening", "Late Night", "All Day"],
  },
  {
    id: "decade",
    type: "single",
    title: "Which decade of music best fits your vibe?",
    options: ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
  },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 32px 24px 0 24px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 400;
  margin: 32px 0 24px 0;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const CategoryItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 3px solid
    ${(props) =>
      props.selected ? "#E14B4B" : theme.colors.background_secondary};
  background: ${theme.colors.background};
  border-radius: 16px;
  color: ${(props) =>
    props.selected ? "#E14B4B" : theme.colors.text_secondary};
  font-size: 1.1rem;
  font-weight: 400;
  cursor: pointer;
  transition: border 0.2s, color 0.2s;
`;

const OptionItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 3px solid
    ${(props) =>
      props.selected ? theme.colors.text : theme.colors.background_secondary};
  background: ${theme.colors.background};
  border-radius: 16px;
  color: ${(props) =>
    props.selected ? theme.colors.text : theme.colors.text_secondary};
  font-size: 1.1rem;
  font-weight: 400;
  cursor: pointer;
  transition: border 0.2s, color 0.2s;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  color: inherit;
  font-size: 1.2rem;
`;

const ContinueButton = styled.button`
  width: 100%;
  padding: 18px 0;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
`;

function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    genres: [],
    listen_time: "",
    decade: "",
  });

  const currentQuestion = questions[step];

  const toggleGenre = (genre) => {
    setAnswers((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const selectOption = (id, option) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: option,
    }));
  };

  const navigate = useNavigate();

  const handleContinue = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/app"); 
    }
  };

  return (
    <Container>
      <TopBar>
        <BackArrow />
      </TopBar>
      <Title>{currentQuestion.title}</Title>
      <CategoryList>
        {currentQuestion.type === "multi" &&
          currentQuestion.options.map((cat) => (
            <CategoryItem
              key={cat}
              selected={answers.genres.includes(cat)}
              onClick={() => toggleGenre(cat)}
            >
              {cat}
              <IconWrapper>
                <RiCloseCircleLine />
              </IconWrapper>
            </CategoryItem>
          ))}
        {currentQuestion.type === "single" &&
          currentQuestion.options.map((option) => (
            <OptionItem
              key={option}
              selected={answers[currentQuestion.id] === option}
              onClick={() => selectOption(currentQuestion.id, option)}
            >
              {option}
            </OptionItem>
          ))}
      </CategoryList>
      <ContinueButton onClick={handleContinue}>
        {step < questions.length - 1 ? "Continue" : "Submit"}
      </ContinueButton>
    </Container>
  );
}

export default Onboarding;
