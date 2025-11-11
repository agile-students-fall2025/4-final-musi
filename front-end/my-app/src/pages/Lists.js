import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../theme";
import SectionHeader from "../components/SectionHeader";
import Tabs from "../components/Tabs";
import SongItem from "../components/SongItem";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

// Convert UI tab labels to backend `tab` keys
const tabToApi = (key) => {
  switch (key) {
    case "recs from friends":
      return "friends";
    case "new releases":
      return "new";
    default:
      return key; // listened, want, recs, trending
  }
};

export default function Lists() {
  const [activeTab, setActiveTab] = useState("listened");
  const [tabs, setTabs] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    setLoadingTabs(true);
    axios
      .get("/api/tabs")
      .then((response) => {
        setTabs(response.data || []);
      })
      .catch((err) => {
        console.error("Error fetching tabs:", err);
      })
      .finally(() => setLoadingTabs(false));
  }, []);

  // Fetch songs list whenever the active tab changes
  useEffect(() => {
    setLoadingSongs(true);
    setError(null);

    const params = { tab: tabToApi(activeTab), limit: 50, offset: 0 };

    axios
      .get("/api/lists", { params })
      .then((response) => {
        const items = Array.isArray(response.data?.items)
          ? response.data.items
          : [];
        setSongs(items);
      })
      .catch((err) => {
        console.error("Error fetching songs:", err);
        setError(err.message || "Failed to load songs");
      })
      .finally(() => setLoadingSongs(false));
  }, [activeTab]);

  const goToMusic = (song) => {
    navigate(`/app/music/Song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`);
  };

  if (loadingTabs || loadingSongs) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  if (error) {
    return <div style={{ padding: 16, color: "#e5534b" }}>Error: {error}</div>;
  }

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
        {tabs.length > 0 && (
          <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {songs.map((song, i) => (
            <li
              key={`${song.id ?? `${song.artist}-${song.title}`}-${i}`}
              onClick={() => goToMusic(song)}
              style={{ cursor: "pointer" }}
            >
              <SongItem
                title={song.title}
                subtitle={`${song.musicType ?? "Song"} • ${song.artist}`}
                meta={(song.tags ?? []).join(", ")}
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
