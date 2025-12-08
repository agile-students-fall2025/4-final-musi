import React from "react";
import styled from "styled-components";
import { Plus, Bookmark } from "lucide-react";
import { theme } from "../theme";

const getScoreColor = (rating) => {
  const numRating = parseFloat(rating);
  if (numRating >= 8) {
    return theme.colors.green;
  } else if (numRating > 5) {
    return theme.colors.yellow;
  } else {
    return theme.colors.red;
  }
};

const Card = styled.article`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  padding: 24px 0;
  border-bottom: 1px solid ${theme.colors.outline};
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

const Thumbnail = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: #e9e9ec;
  background-size: cover;
  background-position: center;
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
  gap: 16px;
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

const ScoreNumber = styled.span`
  color: ${(props) => props.scoreColor || theme.colors.text};
`;

const TwoScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const TwoScoreRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const ScoreCircleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ScoreCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScoreLabel = styled.div`
  font-size: 0.6rem;
  color: ${theme.colors.subtext};
  text-align: center;
  line-height: 1.2;
  max-width: 56px;
`;

const ScoreWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const FriendRatingLabel = styled.div`
  font-size: 0.6rem;
  color: ${theme.colors.subtext};
  text-align: center;
  line-height: 1.2;
  max-width: 56px;
`;

const FriendUsername = styled.span`
  color: #444;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
    color: ${theme.colors.text};
  }
`;

const ScoreValue = styled.span`
  color: ${(props) => props.scoreColor || theme.colors.text};
  font-size: 1rem;
  font-weight: 700;
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
  onClick,
  onBookmarkClick,
  bookmarked = false,
  imageUrl,
  onPlusClick,
  twoScores = null, // { yourScore, theirScore, theirName }
  friendRating = null, // { username, name, onUsernameClick }
}) {
  return (
    <Card onClick={onClick}>
      <Thumbnail
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
              }
            : undefined
        }
      />
      <Body>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        {meta && <Meta>{meta}</Meta>}
      </Body>

      <RightSection>
        {twoScores ? (
          <TwoScoreContainer>
            <TwoScoreRow>
              <ScoreCircleWrapper>
                <ScoreCircle>
                  <ScoreValue scoreColor={getScoreColor(twoScores.yourScore)}>
                    {twoScores.yourScore || "-"}
                  </ScoreValue>
                </ScoreCircle>
                <ScoreLabel>Your score</ScoreLabel>
              </ScoreCircleWrapper>
              <ScoreCircleWrapper>
                <ScoreCircle>
                  <ScoreValue scoreColor={getScoreColor(twoScores.theirScore)}>
                    {twoScores.theirScore || "-"}
                  </ScoreValue>
                </ScoreCircle>
                <ScoreLabel>{twoScores.theirName}'s score</ScoreLabel>
              </ScoreCircleWrapper>
            </TwoScoreRow>
          </TwoScoreContainer>
        ) : (
          <>
            {showPlus && (
              <CircleIconButton
                aria-label="Add"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlusClick) onPlusClick();
                }}
              >
                <Plus size={20} color={theme.colors.text} />
              </CircleIconButton>
            )}
            {showBookmark && (
              <IconButton
                aria-label="Bookmark"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBookmarkClick) onBookmarkClick(e);
                }}
              >
                <Bookmark
                  size={20}
                  color={bookmarked ? theme.colors.primary : theme.colors.text}
                  fill={bookmarked ? theme.colors.primary : "none"}
                />
              </IconButton>
            )}
            {showScore && (
              friendRating ? (
                <ScoreWrapper>
                  <Score>
                    <ScoreNumber scoreColor={getScoreColor(score)}>{score}</ScoreNumber>
                  </Score>
                  <FriendRatingLabel>
                    <FriendUsername
                      onClick={(e) => {
                        e.stopPropagation();
                        if (friendRating.onUsernameClick) {
                          friendRating.onUsernameClick(friendRating.username);
                        }
                      }}
                    >
                      {friendRating.name}
                    </FriendUsername>
                    's rating
                  </FriendRatingLabel>
                </ScoreWrapper>
              ) : (
                <Score>
                  <ScoreNumber scoreColor={getScoreColor(score)}>{score}</ScoreNumber>
                </Score>
              )
            )}
          </>
        )}
      </RightSection>
    </Card>
  );
}
