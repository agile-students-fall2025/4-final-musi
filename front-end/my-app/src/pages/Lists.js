import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import SectionHeader from "../components/SectionHeader";
import Tabs from "../components/Tabs";
import SongItem from "../components/SongItem";
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
`;

const TopTitle = styled.h1`
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const Hamburger = styled.button`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;

  span {
    display: block;
    width: 18px;
    height: 2px;
    background: ${theme.colors.text};
    border-radius: 2px;
  }
`;

const Main = styled.main`
  padding: 20px;
`;

const MOCK_SONGS = [
  {
    id: 1,
    title: "As It Was",
    artist: "Harry Styles",
    tags: ["Pop", "Indie Pop", "UK"],
    score: 8.2,
    musicType: "Song",
  },
  {
    id: 2,
    title: "Flowers",
    artist: "Miley Cyrus",
    tags: ["Pop", "Dance", "Contemporary"],
    score: 7.9,
    musicType: "Song",
  },
  {
    id: 3,
    title: "Kill Bill",
    artist: "SZA",
    tags: ["R&B", "Soul", "Alt R&B"],
    score: 8.7,
    musicType: "Song",
  },
  {
    id: 4,
    title: "About Damn Time",
    artist: "Lizzo",
    tags: ["Funk Pop", "Disco", "Soul"],
    score: 8.0,
    musicType: "Song",
  },
  {
    id: 5,
    title: "Blinding Lights",
    artist: "The Weeknd",
    tags: ["Synthpop", "Pop", "R&B"],
    score: 9.1,
    musicType: "Song",
  },
  {
    id: 6,
    title: "Levitating",
    artist: "Dua Lipa",
    tags: ["Disco Pop", "Dance", "Funk"],
    score: 8.4,
    musicType: "Song",
  },
  {
    id: 7,
    title: "Got to Be Real",
    artist: "Cheryl Lynn",
    tags: ["Disco", "R&B / Soul", "Funk"],
    score: 9.0,
  musicType: "Song",
  },
  {
    id: 8,
    title: "Superstition",
    artist: "Stevie Wonder",
    tags: ["Funk", "Soul", "Classic"],
    score: 9.5,
    musicType: "Song",
  },
  {
    id: 9,
    title: "Dreams",
    artist: "Fleetwood Mac",
    tags: ["Soft Rock", "Pop Rock", "Classic"],
    score: 9.2,
    musicType: "Song",
  },
  {
    id: 10,
    title: "Good as Hell",
    artist: "Lizzo",
    tags: ["Pop Soul", "Empowerment", "Funk"],
    score: 8.3,
    musicType: "Song",
  },
];

const TAB_DATA = [
  { key: "listened", label: "Listened", count: 204 },
  { key: "want", label: "Want to listen", count: 10 },
  { key: "recs", label: "Recs" },
  { key: "trending", label: "Trending" },
  { key: "recs from friends", label: "Recs from friends" },
  { key: "new releases", label: "New releases" },
];

export default function Lists({setSelectedMusic}) {
  const [activeTab, setActiveTab] = useState("listened");
  const navigate = useNavigate();
  const goToMusic = (song) => {
    setSelectedMusic(song); 
    navigate("/app/music");
  };
  return (
    <Container>
      <TopBar>
        <div />
        <TopTitle>MY LISTS</TopTitle>
        <Hamburger>
          <span />
          <span />
          <span />
        </Hamburger>
      </TopBar>

      <Main>
        <SectionHeader title="Songs" />
        <Tabs tabs={TAB_DATA} activeKey={activeTab} onChange={setActiveTab} />

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {MOCK_SONGS.map((song, i) => (
            <li key={song.id} onClick={() => goToMusic(song)} style={{ cursor: "pointer" }}>
              <SongItem
                title={song.title}
                subtitle={`Song • ${song.artist}`}
                meta={song.tags.join(", ")}
                score={song.score}
                dividerTop={i > 0}
              />
            </li>
          ))}
        </ul>
      </Main>
    </Container>
  );
}