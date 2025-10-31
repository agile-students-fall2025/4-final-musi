import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { ChevronLeft } from "lucide-react";
import SongItem from "../components/SongItem";
import { theme } from "../theme";

const Container = styled.div`
  background: ${theme.colors.background};
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 80px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 8px;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;


export default function FeaturedList() {
  const navigate = useNavigate();
  const { title: titleParam } = useParams();
  const location = useLocation();

  // Title can come from route param or from navigate state
  const pageTitle =
    location.state?.title ||
    (titleParam ? decodeURIComponent(titleParam) : "Featured");

  // Preferred: tracks passed via navigate state
  const stateTracks = location.state?.tracks;

  // Fallbacks: try per-title fallback, else empty array
  const tracks =
    (Array.isArray(stateTracks) && stateTracks.length > 0 && stateTracks) || [];

  const handleBack = () => navigate("/app/feed");

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ChevronLeft size={22} />
        </BackButton>
        <Title>{pageTitle}</Title>
      </Header>

      {tracks.length === 0 ? (
        <div style={{ padding: "8px 0", color: theme.colors.subtext }}>
          No tracks provided for this list.
        </div>
      ) : (
        tracks.map((track, index) => (
          <Row key={track.id}>
            <SongItem
              title={track.title}
              subtitle={track.subtitle}
              showScore={false}
              showPlus={true}
              showBookmark={true}
              score={null}
              dividerTop={index !== 0}
            />
          </Row>
        ))
      )}
    </Container>
  );
}
