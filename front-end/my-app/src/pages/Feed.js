import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Search, Menu, Heart, Bookmark, Check, Users, Disc, TrendingUp } from "lucide-react";
import { theme } from "../theme";
import Sidebar from "../components/Sidebar";
import LikesModal from "../components/LikesModal";
import "../components/Score.css";
import axios from "axios";

const Container = styled.div`
  background: white;
  min-height: 100vh;
  padding-bottom: 100px;
`;
const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; background: white; border-bottom: 1px solid #f0f0f0;
`;
const Logo = styled.img`height: 48px; width: auto;`;
const MenuButton = styled.button`background: none; border: none; cursor: pointer; padding: 8px;`;
const SearchContainer = styled.div`padding: 16px 20px; background: white;`;
const SearchBar = styled.div`
  display: flex; align-items: center; background: #f5f5f5; border-radius: 20px;
  padding: 12px 16px; margin-bottom: 16px;
`;
const SearchInput = styled.input`
  flex: 1; border: none; background: none; outline: none; margin-left: 8px;
  font-size: 0.9rem; color: #666; ::placeholder{ color:#999; }
`;

// Updated styling for scrolling tabs
const FilterButtons = styled.div`
  display: flex; 
  gap: 10px; 
  overflow-x: auto; 
  padding-bottom: 4px;
  
  /* Hide scrollbar for cleaner look */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

// Reverted styling to use accent colors as requested
const FilterButton = styled.button`
  background: ${(p) => (p.active ? theme.colors.accent : "white")};
  color: ${(p) => (p.active ? "white" : theme.colors.accent)};
  border: 1px solid ${theme.colors.accent};
  border-radius: 20px; 
  padding: 8px 16px; 
  font-size: 0.85rem; 
  font-weight: 500;
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s ease;
`;

const Section = styled.div`padding: 20px;`;
const SectionHeader = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;`;
const SectionTitle = styled.h3`
  font-size: 0.85rem; font-weight: 600; color: #666; text-align: left;
  text-transform: uppercase; letter-spacing: 0.5px; margin: 0;
`;
const SeeAll = styled.button`background: none; border: none; color: ${theme.colors.accent}; font-size: 0.9rem; font-weight: 500; cursor: pointer;`;
const FeaturedLists = styled.div`display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;`;
const ListCardButton = styled.button`
  min-width: 120px; height: 120px; border-radius: 8px;
  display: flex; align-items: flex-end; padding: 12px; color: white;
  font-weight: 500; font-size: 0.9rem; border: none; cursor: pointer; text-align: left;
  background-size: cover; background-position: center;
  position: relative; overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
    z-index: 1;
  }
  
  span {
    position: relative;
    z-index: 2;
  }
`;
const FeedItem = styled.div`padding: 16px 20px; border-bottom: 1px solid #f0f0f0;`;
const UserInfo = styled.div`display: flex; align-items: center; gap: 12px; margin-bottom: 8px;`;
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: #ddd;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
`;
const UserDetails = styled.div`flex: 1;`;
const UserName = styled.div`
  font-weight: 600; 
  font-size: 0.9rem; 
  color: #333; 
  text-align: left;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
const ActivityText = styled.div`font-size: 0.85rem; color: #666; margin-bottom: 4px; text-align: left;`;
const TimeStamp = styled.div`font-size: 0.8rem; color: #999; text-align: left;`;
const Artwork = styled.div`
  width: 80px;
  height: 80px;
  margin: 12px 0;
  border-radius: 4px;
  background: #666;
  background-size: cover;
  background-position: center;
`;
const ReviewText = styled.p`font-size: 0.9rem; color: #333; line-height: 1.4; margin: 12px 0; text-align: left;`;
const InteractionBar = styled.div`display: flex; justify-content: space-between; align-items: center; margin-top: 12px;`;
const InteractionLeft = styled.div`display: flex; align-items: center; gap: 16px; font-size: 0.85rem; color: #666;`;
const LikeButton = styled.button`
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  cursor: pointer; font-size: 0.85rem; color: #666; padding: 0; &:hover { color: #333; }
`;
const InteractionRight = styled.div`font-size: 0.85rem; color: #666;`;
const FeedScoreContainer = styled.div`
  .score-circle{ width:2.5rem!important; height:2.5rem!important; border:1.5px solid #4b5563!important;}
  .score-number{ font-size:1rem!important; font-weight:600!important;}
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.9rem;
`;

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    opacity: 0.85;
  }
`;

// Helper function to get score color based on rating
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

function Feed() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState(null);
  const [likesModalReviewId, setLikesModalReviewId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeTab, setActiveTab] = useState("trending");

  // load featured lists (once)
  useEffect(() => {
    axios.get("/api/featured-lists")
      .then((r) => setFeatured(Array.isArray(r.data) ? r.data : []))
      .catch((e) => console.error("featured-lists error:", e));
  }, []);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    axios.get("/api/feed", { params: { tab: "trending" } })
      .then((r) => setFeedData(Array.isArray(r.data?.items) ? r.data.items : []))
      .catch((e) => setErr(e.message || "Failed to load feed"))
      .finally(() => setLoading(false));
  }, []);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loadingMore || visibleCount >= feedData.length) return;

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
  }, [loadingMore, visibleCount, feedData.length]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Tab click handler for filtering feed
  const handleTabClick = async (tab) => {
    setLoading(true);
    setErr(null);
    setVisibleCount(10); // Reset visible count
    setActiveTab(tab);

    let params = {};
    
    if (tab === "trending") {
      params = { tab: "trending" };
    } else if (tab === "recs from friends") {
      params = { tab: "friend-recs" };
    } else if (tab === "new releases") {
      params = { tab: "new-releases" };
    }

    try {
      const response = await axios.get("/api/feed", { params });
      setFeedData(
        Array.isArray(response.data?.items) ? response.data.items : []
      );
    } catch (e) {
      setErr(e.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (itemId, e) => {
    e?.stopPropagation();
    const item = feedData.find((it) => it.id === itemId);
    if (!item) return;

    const wasLiked = item.isLiked;
    // Optimistic update
    setFeedData((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, isLiked: !wasLiked, likes: wasLiked ? it.likes - 1 : it.likes + 1 }
          : it
      )
    );

    try {
      const response = await axios.post(`/api/reviews/${itemId}/like`);
      // Update with server response
      setFeedData((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, isLiked: response.data.isLiked, likes: response.data.likesCount }
            : it
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setFeedData((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, isLiked: wasLiked, likes: wasLiked ? it.likes + 1 : it.likes - 1 }
            : it
        )
      );
    }
  };

  const handleLikesClick = (itemId, e) => {
    e.stopPropagation();
    setLikesModalReviewId(itemId);
  };

  const openFeatured = (list) => {
    navigate(`/app/featuredlist/${encodeURIComponent(list.title)}`, {
      state: { title: list.title, tracks: list.tracks },
    });
  };

  const goToMusic = (music) => {
    navigate(`/app/music/${encodeURIComponent(music.musicType)}/${encodeURIComponent(music.artist)}/${encodeURIComponent(music.title)}`);
  };

  const handleBookmark = async (item) => {
    try {
      const type = item.musicType || "Song";
      const spotifyId = `${type}-${item.artist}-${item.title}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');

      await axios.post("/api/want", {
        spotifyId,
        title: item.title,
        artist: item.artist,
        musicType: type,
      });
    } catch (e) {
      console.error("Failed to add to want list:", e);
      alert("Failed to add to Want to listen");
    }
  };

  const visibleFeedData = feedData.slice(0, visibleCount);
  const hasMore = visibleCount < feedData.length;

  return (
    <Container>
      <Header>
        <Logo src="/assets/images/logo.png" alt="musi" />
        <MenuButton onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} color="#333" />
        </MenuButton>
      </Header>

      <SearchContainer>
        <SearchBar onClick={() => navigate("/app/search")}>
          <Search size={16} color="#999" />
          <SearchInput
            placeholder="Search a song, album or user..."
            onFocus={() => navigate("/app/search")}
            readOnly
          />
        </SearchBar>

        {/* Updated Tabs - Now filters feed content */}
        <FilterButtons>
          <FilterButton 
            active={activeTab === "trending"}
            onClick={() => handleTabClick("trending")}
          >
            <TrendingUp size={16} /> Trending
          </FilterButton>
          <FilterButton 
            active={activeTab === "recs from friends"}
            onClick={() => handleTabClick("recs from friends")}
          >
            <Users size={16} /> Friend recs
          </FilterButton>
          <FilterButton 
            active={activeTab === "new releases"}
            onClick={() => handleTabClick("new releases")}
          >
            <Disc size={16} /> New releases
          </FilterButton>
        </FilterButtons>
      </SearchContainer>

      {loading ? (
        <Section><div>Loading…</div></Section>
      ) : err ? (
        <Section><div style={{color:"#e5534b"}}>Error: {err}</div></Section>
      ) : (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>Featured Lists</SectionTitle>
              <SeeAll>See all</SeeAll>
            </SectionHeader>

        <FeaturedLists>
          {featured.map((list) => (
            <ListCardButton 
              key={list.title} 
              onClick={() => openFeatured(list)} 
              aria-label={`Open ${list.title}`}
              style={{
                backgroundImage: list.imageUrl ? `url(${list.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <span>{list.title}</span>
            </ListCardButton>
          ))}
        </FeaturedLists>
      </Section>

      <Section><SectionTitle>Your Feed</SectionTitle></Section>

      {visibleFeedData.map((item) => (
        <FeedItem key={item.id}>
          <UserInfo>
            <Avatar
              style={
                item.userAvatar
                  ? { backgroundImage: `url(${item.userAvatar})` }
                  : { backgroundColor: item.userAvatarColor || "#666" }
              }
            >
              {!item.userAvatar &&
                (item.user || "")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
            </Avatar>
            <UserDetails>
              <UserName
                onClick={() => {
                  if (item.username) {
                    navigate(`/app/user/${encodeURIComponent(item.username)}`);
                  }
                }}
              >
                {item.user}
              </UserName>
              <ActivityText>
                {item.activity}{" "}
                <span
                  style={{ color: theme.colors.accent, cursor: "pointer", fontWeight: 600 }}
                  onClick={() => goToMusic(item)}
                >
                  {item.title}
                </span>{" "}
                by {item.artist}
              </ActivityText>
              <TimeStamp>{item.time}</TimeStamp>
            </UserDetails>
            <FeedScoreContainer>
              {item.rating ? (
                <div className="score-item">
                  <div className="score-circle-container">
                    <div className="score-circle">
                      <span 
                        className="score-number" 
                        style={{ color: getScoreColor(item.rating) }}
                      >
                        {item.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '1.2rem' }}>🔥</div>
              )}
            </FeedScoreContainer>
          </UserInfo>

          {item.imageUrl && (
            <Artwork style={{ backgroundImage: `url(${item.imageUrl})` }} />
          )}
          <ReviewText>{item.review}</ReviewText>

          <InteractionBar>
            <InteractionLeft>
              <LikeButton onClick={(e) => handleLike(item.id, e)}>
                <Heart size={16} fill={item.isLiked ? "#ff6b6b" : "none"} color={item.isLiked ? "#ff6b6b" : "#666"} />
              </LikeButton>
              <span
                onClick={(e) => handleLikesClick(item.id, e)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                {item.likes} {item.likes === 1 ? "like" : "likes"}
              </span>
            </InteractionLeft>
            <InteractionRight>
              <button
                onClick={() => handleBookmark(item)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                <Bookmark size={16} />
                <span>Want to listen</span>
              </button>
            </InteractionRight>
          </InteractionBar>
        </FeedItem>
      ))}

      {loadingMore && hasMore && (
        <LoadingIndicator>Loading more...</LoadingIndicator>
      )}
        </>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {likesModalReviewId && (
        <LikesModal
          reviewId={likesModalReviewId}
          onClose={() => setLikesModalReviewId(null)}
        />
      )}
    </Container>
  );
}

export default Feed;