import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { theme } from "../theme";
import SectionHeader from "../components/SectionHeader";
import Tabs from "../components/Tabs";
import SongItem from "../components/SongItem";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: ${theme.colors.text_secondary};
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  margin-bottom: 16px;
  color: ${theme.colors.text_secondary};
`;

const EmptyStateButton = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background-color: #000;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
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
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = location.state?.tab || "listened";
  const lastLocationKey = useRef(location.key);
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabs, setTabs] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Update activeTab only when navigating to this page with state
  // location.key changes on every navigation, so this detects new navigations
  useEffect(() => {
    if (location.key !== lastLocationKey.current) {
      // We've navigated to this page (new navigation)
      lastLocationKey.current = location.key;
      const tabFromState = location.state?.tab;
      if (tabFromState) {
        setActiveTab(tabFromState);
      }
    }
  }, [location.key, location.state?.tab]);


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
    setVisibleCount(10); // Reset visible count when tab changes

    const params = { tab: tabToApi(activeTab), limit: 50, offset: 0 };
    console.log("Fetching lists with params:", params);

    axios
      .get("/api/lists", { params })
      .then((response) => {
        console.log("Lists API response:", response.data);
        const items = Array.isArray(response.data?.items)
          ? response.data.items
          : [];
        console.log("Processed items:", items.length);
        setSongs(items);
      })
      .catch((err) => {
        console.error("Error fetching songs:", err);
        setError(err.message || "Failed to load songs");
      })
      .finally(() => setLoadingSongs(false));
  }, [activeTab]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || visibleCount >= songs.length) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Trigger when user scrolls to 80% of the page
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        setLoadingMore(true);
        // Simulate loading delay
        setTimeout(() => {
          setVisibleCount((prev) => prev + 10);
          setLoadingMore(false);
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, visibleCount, songs.length]);

  const goToMusic = (song) => {
    const type = song.musicType ?? "Song";
    navigate(
      `/app/music/${encodeURIComponent(type)}/${encodeURIComponent(
        song.artist
      )}/${encodeURIComponent(song.title)}`
    );
  };

  if (loadingTabs) {
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
        <Hamburger onClick={() => setIsSidebarOpen(true)}>
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

        {loadingSongs ? (
          <div style={{ padding: 16, textAlign: "center" }}>Loading…</div>
        ) : songs.length === 0 && (activeTab === "listened" || activeTab === "want") ? (
          <EmptyState>
            <EmptyStateText>
              {activeTab === "listened"
                ? "You haven't reviewed any songs yet"
                : "Your Want to listen list is empty"}
            </EmptyStateText>
            <EmptyStateButton onClick={() => navigate("/app/search")}>
              {activeTab === "listened"
                ? "Find a song to review"
                : "Find songs to add"}
            </EmptyStateButton>
          </EmptyState>
        ) : songs.length === 0 && activeTab === "new releases" ? (
          <EmptyState>
            <EmptyStateText>No new releases available at the moment</EmptyStateText>
          </EmptyState>
        ) : songs.length === 0 && activeTab === "trending" ? (
          <EmptyState>
            <EmptyStateText>No trending songs available at the moment</EmptyStateText>
          </EmptyState>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {songs.slice(0, visibleCount).map((song, i) => (
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
                  imageUrl={song.imageUrl}
                  showScore={activeTab !== "want" && activeTab !== "new releases" && activeTab !== "trending"}
                  showPlus={activeTab === "want" || activeTab === "new releases" || activeTab === "trending"}
                  showBookmark={activeTab === "want" || activeTab === "new releases" || activeTab === "trending"}
                  bookmarked={song.bookmarked || (activeTab === "want")}
                  onPlusClick={() => goToMusic(song)}
                onBookmarkClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const type = song.musicType ?? "Song";
                    const spotifyId =
                      song.spotifyId ||
                      `${type}-${song.artist}-${song.title}`
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "-");

                    if (activeTab === "want") {
                      // Remove from want list
                      await axios.post("http://localhost:3001/api/want/remove", {
                        spotifyId,
                      });

                      setSongs((prev) =>
                        prev.filter(
                          (s, idx) =>
                            idx !== i &&
                            (s.id ?? `${s.artist}-${s.title}`) !==
                              (song.id ?? `${song.artist}-${song.title}`)
                        )
                      );
                      setTabs((prev) =>
                        prev.map((t) =>
                          t.key === "want"
                            ? {
                                ...t,
                                count: Math.max(0, (t.count || 0) - 1),
                              }
                            : t
                        )
                      );
                    } else if (activeTab === "new releases") {
                      // Add to want list
                      if (song.bookmarked) {
                        await axios.post("http://localhost:3001/api/want/remove", {
                          spotifyId,
                        });
                        setSongs((prev) =>
                          prev.map((s, idx) =>
                            idx === i ? { ...s, bookmarked: false } : s
                          )
                        );
                      } else {
                        await axios.post("http://localhost:3001/api/want", {
                          spotifyId,
                          title: song.title,
                          artist: song.artist,
                          musicType: type,
                          imageUrl: song.imageUrl,
                        });
                        setSongs((prev) =>
                          prev.map((s, idx) =>
                            idx === i ? { ...s, bookmarked: true } : s
                          )
                        );
                      }
                    }
                  } catch (e) {
                    console.error("Failed to update want list:", e);
                    alert(activeTab === "want" 
                      ? "Failed to remove from Want to listen"
                      : "Failed to update Want to listen");
                  }
                }}
              imageUrl={song.imageUrl}
                dividerTop={i > 0}
              />
            </li>
          ))}
          </ul>
          {loadingMore && visibleCount < songs.length && (
            <div style={{ padding: 16, textAlign: "center" }}>Loading more...</div>
          )}
          </>
        )}
      </Main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </Container>
  );
}