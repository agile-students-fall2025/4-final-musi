import React from "react";
import styled from "styled-components";
import { Plus, Bookmark } from "lucide-react";
import { theme } from "../theme";

const Card = styled.article`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  padding: 24px 0;
  border-bottom: 1px solid ${theme.colors.outline};
  align-items: center;
  width: 100%;
`;

const Thumbnail = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: #e9e9ec;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  text-align: left;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.subtext};
`;

const Meta = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.subtext};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Score = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
`;



const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
`;

const CircleIconButton = styled(IconButton)`
  width: 24px;
  height: 24px;
  border: 1.5px solid ${theme.colors.border};
  border-radius: 50%;
  justify-content: center;
`;

export default function SongItem({
  title,
  subtitle,
  meta,
  score,
  showScore = true,
  showPlus = false,
  showBookmark = false,
}) {
  return (
    <Card>
      <Thumbnail />
      <Body>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        {meta && <Meta>{meta}</Meta>}
      </Body>

      <RightSection>
        {showScore && <Score>{score}</Score>}
        {showPlus && (
          <CircleIconButton aria-label="Add">
            <Plus size={20} color={theme.colors.text} />
          </CircleIconButton>
        )}
        {showBookmark && (
          <IconButton aria-label="Bookmark">
            <Bookmark size={20} color={theme.colors.text} />
          </IconButton>
        )}
      </RightSection>
    </Card>
  );
}
