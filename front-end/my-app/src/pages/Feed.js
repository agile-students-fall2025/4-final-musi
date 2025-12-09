import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Search, Menu, Heart, Users, Disc, TrendingUp } from "lucide-react";
import { theme } from "../theme";
import Sidebar from "../components/Sidebar";
import LikesModal from "../components/LikesModal";
import RatingModal from "../components/RatingModal";
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

// Updated Button Styling (Removed 'active' prop logic, added hover effect)
const FilterButton = styled.button`
  background: white;
  color: ${theme.colors.accent};
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

  &:hover {
    background: ${theme.colors.accent};
    color: white;
  }
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
  width: 120px; 
  height: 120px; 
  min-width: 120px;
  border-radius: 8px;
  display: flex; 
  align-items: flex-end; 
  padding: 12px; 
  color: white;
  font-weight: 500; 
  font-size: 0.9rem; 
  border: none; 
  cursor: pointer; 
  text-align: left;
  background-size: cover; 
  background-position: center;
  position: relative; 
  overflow: hidden;
  flex-shrink: 0;
  
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
const FeedItem = styled.div`padding: 16px 20px; border-bottom: 1px solid #f0f0f0; position: relative;`;
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
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;
const ReviewText = styled.p`font-size: 0.9rem; color: #333; line-height: 1.4; margin: 12px 0; text-align: left;`;
const InteractionBar = styled.div`display: flex; justify-content: space-between; align-items: center; margin-top: 12px;`;
const InteractionLeft = styled.div`display: flex; align-items: center; gap: 16px; font-size: 0.85rem; color: #666;`;
const LikeButton = styled.button`
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  cursor: pointer; font-size: 0.85rem; color: #666; padding: 0; &:hover { color: #333; }
`;
const InteractionRight = styled.div`font-size: 0.85rem; color: #666;`;
const MoreButtonWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
const MoreButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0 8px 0;
  color: ${theme.colors.text_secondary};
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.text};
  }
`;
const ReviewMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: -4px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  min-width: 140px;
  display: flex;
  flex-direction: column;
`;
const ReviewMenuItem = styled.button`
  border: none;
  background: none;
  padding: 10px 12px;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${theme.colors.text};

  &:hover {
    background: #f5f5f5;
  }
`;
const FeedScoreContainer = styled.div`
  .score-item{ margin-right: 0!important; }
  .score-circle-container{ margin-right: 0!important; }
  .score-circle{ width:2.5rem!important; height:2.5rem!important; border:1.5px solid #4b5563!important;}
  .score-number{ font-size:1rem!important; font-weight:600!important;}
`;
const ScoreAndMenuContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.9rem;
`;

// Skeleton loading components
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #f8f8f8 40px,
    #f0f0f0 80px
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

const SkeletonCircle = styled(SkeletonBase)`
  border-radius: 50%;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
`;

const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  margin-bottom: ${props => props.marginBottom || '8px'};
`;

const SkeletonFeaturedCard = styled(SkeletonBase)`
  min-width: 120px;
  height: 120px;
  border-radius: 8px;
  flex-shrink: 0;
`;

const SkeletonFeedItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const SkeletonUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const SkeletonUserDetails = styled.div`
  flex: 1;
`;

const SkeletonArtwork = styled(SkeletonBase)`
  width: 80px;
  height: 80px;
  margin: 12px 0;
  border-radius: 4px;
`;

const SkeletonScore = styled(SkeletonCircle)`
  width: 2.5rem;
  height: 2.5rem;
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
  const [currentUsername, setCurrentUsername] = useState(null);
  const [activeReviewMenuId, setActiveReviewMenuId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Fetch current user's username
  useEffect(() => {
    axios.get("/api/auth/me")
      .then((r) => setCurrentUsername(r.data?.user?.username || null))
      .catch((e) => console.error("Failed to fetch current user:", e));
  }, []);

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

  // Close review menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeReviewMenuId) {
        const clickedMenu = event.target.closest('[data-review-menu]');
        const clickedButton = event.target.closest('[data-review-button]');
        
        // Close if clicking outside both the menu and the button
        if (!clickedMenu && !clickedButton) {
          setActiveReviewMenuId(null);
        }
      }
    };
    
    if (activeReviewMenuId) {
      // Use a small delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [activeReviewMenuId]);

  const handleListRedirect = (tabName) => {
    navigate("/app/lists", { state: { tab: tabName } });
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

  const openReviewMenu = (id) => {
    setActiveReviewMenuId((prev) => (prev === id ? null : id));
  };

  const startEditReview = (item) => {
    setActiveReviewMenuId(null);
    
    // Convert rating to ratingIndex (0, 1, or 2)
    // Rating >= 8 = 0 (liked it), > 5 = 1 (fine), <= 5 = 2 (didn't like)
    let ratingIndex = 0;
    const rating = parseFloat(item.rating || 0);
    if (rating >= 8) {
      ratingIndex = 0; // "I liked it!"
    } else if (rating > 5) {
      ratingIndex = 1; // "It was fine"
    } else {
      ratingIndex = 2; // "I didn't like it"
    }
    
    // Generate spotifyId from item data
    const spotifyId = `${item.musicType || "Song"}-${item.artist}-${item.title}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    
    setSelectedSong({
      title: item.title,
      artist: item.artist,
      musicType: item.musicType || "Song",
      imageUrl: item.imageUrl,
      spotifyId: spotifyId,
      initialRating: ratingIndex,
      initialComment: item.review || ""
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingInfo) => {
    const payload = {
      ...ratingInfo,
      reviewText: ratingInfo.comment,
      targetId: ratingInfo.targetId || ratingInfo.spotifyId 
    };

    if (!payload.targetId) {
      alert("Error: Missing Target ID");
      return;
    }

    try {
      await axios.post('/api/reviews/rate-ranked', payload);
      
      // Refresh feed data
      const feedResponse = await axios.get("/api/feed", { params: { tab: "trending" } });
      setFeedData(Array.isArray(feedResponse.data?.items) ? feedResponse.data.items : []);
      
      window.dispatchEvent(new CustomEvent('reviewSubmitted'));
      
      setShowRatingModal(false);
      setSelectedSong(null);
    } catch (err) {
      console.error('Failed to save rating:', err);
      alert("Failed to save rating");
    }
  };

  const handleCancelModal = () => {
    setShowRatingModal(false);
    setSelectedSong(null);
  };

  const deleteReview = async (item) => {
    if (!window.confirm("Delete this review?")) {
      setActiveReviewMenuId(null);
      return;
    }
    try {
      await axios.delete(`/api/reviews/${item.id}`);
      setFeedData((prev) => prev.filter((it) => it.id !== item.id));
    } catch (e) {
      console.error("Failed to delete review:", e);
      alert("Failed to delete review. Please try again.");
    } finally {
      setActiveReviewMenuId(null);
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

        <FilterButtons>
          <FilterButton onClick={() => handleListRedirect("trending")}>
            <TrendingUp size={16} /> Trending
          </FilterButton>
          <FilterButton onClick={() => handleListRedirect("recs from friends")}>
            <Users size={16} /> Friend recs
          </FilterButton>
          <FilterButton onClick={() => handleListRedirect("new releases")}>
            <Disc size={16} /> New releases
          </FilterButton>
        </FilterButtons>
      </SearchContainer>

      {loading ? (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>Featured Lists</SectionTitle>
            </SectionHeader>
            <FeaturedLists>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonFeaturedCard key={i} />
              ))}
            </FeaturedLists>
          </Section>

          <Section>
            <SectionTitle>Your Feed</SectionTitle>
          </Section>

          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonFeedItem key={i}>
              <SkeletonUserInfo>
                <SkeletonCircle size="40px" />
                <SkeletonUserDetails>
                  <SkeletonRect width="120px" height="14px" marginBottom="8px" />
                  <SkeletonRect width="200px" height="12px" marginBottom="4px" />
                  <SkeletonRect width="80px" height="10px" marginBottom="0" />
                </SkeletonUserDetails>
                <SkeletonScore />
              </SkeletonUserInfo>
              {i % 2 === 0 && <SkeletonArtwork />}
              <SkeletonRect width="100%" height="12px" marginBottom="8px" />
              <SkeletonRect width="90%" height="12px" marginBottom="8px" />
              <SkeletonRect width="60%" height="12px" marginBottom="12px" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <SkeletonRect width="80px" height="14px" marginBottom="0" />
                <SkeletonRect width="100px" height="14px" marginBottom="0" />
              </div>
            </SkeletonFeedItem>
          ))}
        </>
      ) : err ? (
        <Section><div style={{color:"#e5534b"}}>Error: {err}</div></Section>
      ) : (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>Featured Lists</SectionTitle>
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
            <ScoreAndMenuContainer>
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
              {currentUsername && item.username === currentUsername && (
                <MoreButtonWrapper>
                  <MoreButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      openReviewMenu(item.id);
                    }}
                    data-review-button
                  >
                    ⋯
                  </MoreButton>
                  {activeReviewMenuId === item.id && (
                    <ReviewMenu data-review-menu>
                      <ReviewMenuItem onClick={() => startEditReview(item)}>
                        Edit review
                      </ReviewMenuItem>
                      <ReviewMenuItem
                        onClick={() => deleteReview(item)}
                        style={{ color: "#e5534b" }}
                      >
                        Delete review
                      </ReviewMenuItem>
                    </ReviewMenu>
                  )}
                </MoreButtonWrapper>
              )}
            </ScoreAndMenuContainer>
          </UserInfo>

          {item.imageUrl && (
            <Artwork 
              style={{ backgroundImage: `url(${item.imageUrl})` }}
              onClick={() => goToMusic(item)}
            />
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
      
      {showRatingModal && selectedSong && (
        <RatingModal 
          {...selectedSong}
          onClose={handleCancelModal}  
          onSubmit={handleRatingSubmit} 
        />
      )}
    </Container>
  );
}

export default Feed;