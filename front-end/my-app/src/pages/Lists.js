import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";
import Tabs from "../components/Tabs";
import SongItem from "../components/SongItem";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { ChevronLeft } from "lucide-react";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const SkeletonSongItem = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  padding: 24px 0;
  border-bottom: 1px solid ${theme.colors.outline};
  align-items: center;
`;

const SkeletonImage = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkeletonLine = styled.div`
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  border-radius: 4px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonScore = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonTabs = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;
  overflow-x: auto;
`;

const SkeletonTab = styled.div`
  height: 32px;
  min-width: 80px;
  border-radius: 16px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

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

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: ${theme.colors.text};
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
  const { username } = useParams();
  const initialTab = location.state?.tab || "listened";
  const lastLocationKey = useRef(location.key);
  const isViewingOtherUser = !!username;
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabs, setTabs] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userName, setUserName] = useState("");
  const [listenedCount, setListenedCount] = useState(0);
  const [wantCount, setWantCount] = useState(0);
  const [bothCount, setBothCount] = useState(0);
  
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
    if (isViewingOtherUser) {
      // Fetch user's profile to get counts
      Promise.all([
        axios.get(`/api/users/${encodeURIComponent(username)}/profile`),
        axios.get(`/api/users/${encodeURIComponent(username)}/lists`, { 
          params: { tab: 'both', limit: 1 } 
        })
      ])
        .then(([profileResponse, bothResponse]) => {
          const profile = profileResponse.data.profile;
          setUserName(profile?.name || username);
          setListenedCount(profile?.listenedCount || 0);
          setWantCount(profile?.wantCount || 0);
          const bothCountValue = bothResponse.data?.count || 0;
          setBothCount(bothCountValue);
          
          // Set tabs with counts
          setTabs([
            { key: "listened", label: "Listened", count: profile?.listenedCount || 0 },
            { key: "want", label: "Want to listen", count: profile?.wantCount || 0 },
            { key: "both", label: "Music you both listen to", count: bothCountValue },
          ]);
          setLoadingTabs(false);
        })
        .catch((err) => {
          console.error("Error fetching user profile or both count:", err);
          setUserName(username);
          // Set tabs without counts on error
          setTabs([
            { key: "listened", label: "Listened" },
            { key: "want", label: "Want to listen" },
            { key: "both", label: "Music you both listen to" },
          ]);
          setLoadingTabs(false);
        });
    } else {
      // For current user's lists, fetch tabs from API
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
    }
  }, [username, isViewingOtherUser]);

  // Fetch songs list whenever the active tab changes
  useEffect(() => {
    setLoadingSongs(true);
    setError(null);
    setVisibleCount(10); // Reset visible count when tab changes

    if (isViewingOtherUser) {
      // Use user-specific endpoint
      const params = { tab: activeTab === "both" ? "both" : tabToApi(activeTab), limit: 50, offset: 0 };
      axios
        .get(`/api/users/${encodeURIComponent(username)}/lists`, { params })
        .then((response) => {
          const items = Array.isArray(response.data?.items)
            ? response.data.items
            : [];
          setSongs(items);
        })
        .catch((err) => {
          console.error("Error fetching user lists:", err);
          setError(err.message || "Failed to load lists");
        })
        .finally(() => setLoadingSongs(false));
    } else {
      // Use current user's lists endpoint
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
    }
  }, [activeTab, username, isViewingOtherUser]);

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
    return (
      <Container>
        <TopBar>
          {isViewingOtherUser ? (
            <BackButton onClick={() => navigate(`/app/user/${encodeURIComponent(username)}`)}>
              <ChevronLeft size={22} />
            </BackButton>
          ) : (
            <div />
          )}
          <TopTitle>{isViewingOtherUser ? `${username}'s Lists`.toUpperCase() : "MY LISTS"}</TopTitle>
          {!isViewingOtherUser && (
            <Hamburger>
              <span />
              <span />
              <span />
            </Hamburger>
          )}
          {isViewingOtherUser && <div />}
        </TopBar>
        <Main>
          <SkeletonTabs>
            {[...Array(4)].map((_, index) => (
              <SkeletonTab key={`tab-skeleton-${index}`} />
            ))}
          </SkeletonTabs>
          {[...Array(5)].map((_, index) => (
            <SkeletonSongItem key={`song-skeleton-${index}`}>
              <SkeletonImage />
              <SkeletonContent>
                <SkeletonLine height="16px" width="60%" />
                <SkeletonLine height="14px" width="40%" />
              </SkeletonContent>
              <SkeletonScore />
            </SkeletonSongItem>
          ))}
        </Main>
      </Container>
    );
  }

  if (error) {
    return <div style={{ padding: 16, color: "#e5534b" }}>Error: {error}</div>;
  }

  return (
    <Container>
      <TopBar>
        {isViewingOtherUser ? (
          <BackButton onClick={() => navigate(`/app/user/${encodeURIComponent(username)}`)}>
            <ChevronLeft size={22} />
          </BackButton>
        ) : (
          <div />
        )}
        <TopTitle>{isViewingOtherUser ? `${userName || username}'s Lists`.toUpperCase() : "MY LISTS"}</TopTitle>
        {!isViewingOtherUser && (
          <Hamburger onClick={() => setIsSidebarOpen(true)}>
            <span />
            <span />
            <span />
          </Hamburger>
        )}
        {isViewingOtherUser && <div />}
      </TopBar>

      <Main>
        {tabs.length > 0 && (
          <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
        )}

        {loadingSongs ? (
          <>
            {[...Array(8)].map((_, index) => (
              <SkeletonSongItem key={`song-skeleton-${index}`}>
                <SkeletonImage />
                <SkeletonContent>
                  <SkeletonLine height="16px" width="60%" />
                  <SkeletonLine height="14px" width="40%" />
                </SkeletonContent>
                {(activeTab !== "want" && activeTab !== "new releases" && activeTab !== "trending" && activeTab !== "both") && (
                  <SkeletonScore />
                )}
                {(activeTab === "want" || activeTab === "new releases" || activeTab === "trending" || activeTab === "recs from friends" || activeTab === "recs") && (
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <SkeletonScore style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                    <SkeletonScore style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                  </div>
                )}
                {activeTab === "both" && (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <SkeletonScore />
                    <SkeletonScore />
                  </div>
                )}
              </SkeletonSongItem>
            ))}
          </>
        ) : songs.length === 0 && activeTab === "listened" ? (
          <EmptyState>
            <EmptyStateText>
              {isViewingOtherUser
                ? `${userName || username} hasn't reviewed any songs yet`
                : "You haven't reviewed any songs yet"}
            </EmptyStateText>
            {!isViewingOtherUser && (
              <EmptyStateButton onClick={() => navigate("/app/search")}>
                Find a song to review
              </EmptyStateButton>
            )}
          </EmptyState>
        ) : songs.length === 0 && activeTab === "want" ? (
          <EmptyState>
            <EmptyStateText>
              {isViewingOtherUser
                ? `${userName || username}'s Want to listen list is empty`
                : "Your Want to listen list is empty"}
            </EmptyStateText>
            {!isViewingOtherUser && (
              <EmptyStateButton onClick={() => navigate("/app/search")}>
                Find songs to add
              </EmptyStateButton>
            )}
          </EmptyState>
        ) : songs.length === 0 && activeTab === "both" ? (
          <EmptyState>
            <EmptyStateText>
              You and {userName || username} haven't listened to any of the same songs yet
            </EmptyStateText>
          </EmptyState>
        ) : songs.length === 0 && activeTab === "new releases" ? (
          <EmptyState>
            <EmptyStateText>No new releases available at the moment</EmptyStateText>
          </EmptyState>
        ) : songs.length === 0 && activeTab === "trending" ? (
          <EmptyState>
            <EmptyStateText>No trending songs available at the moment</EmptyStateText>
          </EmptyState>
        ) : songs.length === 0 && activeTab === "recs from friends" ? (
          <EmptyState>
            <EmptyStateText>
              {isViewingOtherUser
                ? `${userName || username} doesn't have any friend recommendations yet`
                : "No recommendations from friends yet. Follow more people to see their recommendations!"}
            </EmptyStateText>
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
                  meta={activeTab === "new releases" ? null : (song.tags ?? []).join(", ")}
                  score={song.score}
                  imageUrl={song.imageUrl}
                  showScore={activeTab !== "want" && activeTab !== "new releases" && activeTab !== "trending" && activeTab !== "both" && activeTab !== "recs"}
                  showPlus={!isViewingOtherUser && (activeTab === "want" || activeTab === "new releases" || activeTab === "trending" || activeTab === "recs from friends" || activeTab === "recs")}
                  showBookmark={!isViewingOtherUser && (activeTab === "want" || activeTab === "new releases" || activeTab === "trending" || activeTab === "recs from friends" || activeTab === "recs")}
                  bookmarked={song.bookmarked || (activeTab === "want")}
                  twoScores={activeTab === "both" ? {
                    yourScore: song.currentUserScore,
                    theirScore: song.score,
                    theirName: userName || username || "User"
                  } : null}
                  friendRating={activeTab === "recs from friends" && song.friendRating ? {
                    username: song.friendRating.username,
                    name: song.friendRating.name,
                    onUsernameClick: (username) => {
                      navigate(`/app/user/${encodeURIComponent(username)}`);
                    }
                  } : null}
                  onPlusClick={() => goToMusic(song)}
                  dividerTop={i > 0}
                  onBookmarkClick={async (e) => {
                  if (e) e.stopPropagation();
                  try {
                    const type = song.musicType ?? "Song";
                    const spotifyId =
                      song.spotifyId ||
                      `${type}-${song.artist}-${song.title}`
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "-");

                    if (activeTab === "want") {
                      // Remove from want list
                      await axios.post("/api/want/remove", {
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
                    } else if (activeTab === "new releases" || activeTab === "recs from friends" || activeTab === "recs") {
                      // Toggle want list
                      if (song.bookmarked) {
                        await axios.post("/api/want/remove", {
                          spotifyId,
                        });
                        setSongs((prev) =>
                          prev.map((s, idx) =>
                            idx === i ? { ...s, bookmarked: false } : s
                          )
                        );
                      } else {
                        await axios.post("/api/want", {
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