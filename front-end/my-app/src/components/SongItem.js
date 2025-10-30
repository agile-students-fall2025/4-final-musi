import React from "react";
import styled from "styled-components";
import { theme } from "../theme";

const Card = styled.article`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  padding: 24px 0;
  border-bottom: ${theme.colors.outline} 1px solid
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

export default function SongItem({ title, subtitle, meta, score, dividerTop }) {
  return (
    <Card dividerTop={dividerTop}>
      <Thumbnail />
      <Body>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <Meta>{meta}</Meta>
      </Body>
      <Score>{score}</Score>
    </Card>
  );
}
