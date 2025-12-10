import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Share, Menu, Edit, ChevronRight, Star, Flame, ChevronLeft, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { theme } from '../theme';
import FollowButton from '../components/FollowButton';
import LikesModal from '../components/LikesModal';
import SongItem from '../components/SongItem';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../components/Score.css';

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

const Container = styled.div`
  background: ${theme.colors.background};
  padding: 16px;
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const UserName = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${theme.colors.text};
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #d3d3d3;
  position: relative;
  margin-bottom: 16px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 2rem;
`;

const EditIcon = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: 2px solid ${theme.colors.background};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Username = styled.div`
  font-size: 1rem;
  color: ${theme.colors.text};
  margin-bottom: 4px;
`;

const Bio = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 8px;
`;

const MemberSince = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

// const Button = styled.button`
//   flex: 1;
//   padding: 10px 20px;
//   border: 1px solid #e0e0e0;
//   background: white;
//   border-radius: 8px;
//   font-size: 0.9rem;
//   cursor: pointer;
// `;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 32px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatItemClickable = styled(StatItem)`
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.7;
  }
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 0;
  border: none;
  background: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

const ListItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ListItemText = styled.span`
  font-size: 1rem;
  color: ${theme.colors.text};
`;

const ListItemCount = styled.span`
  font-size: 1rem;
  color: ${theme.colors.text_secondary};
`;

const CardRow = styled.div`
  display: flex;
  gap: 12px;
  margin: 24px 0;
`;

const Card = styled.div`
  flex: 1;
  padding: 20px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardClickable = styled(Card)`
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  &:hover {
    background-color: #fafafa;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const CardLabel = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
`;

const CardValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  border-bottom: 2px solid ${(props) => (props.active ? "#000" : "transparent")};
  font-size: 0.9rem;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  color: ${theme.colors.text};
`;

const TabContent = styled.div`
  padding-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.text_secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  margin-top: 24px;
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  position: relative;
  height: 250px;
`;

const ChartLegend = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${(props) => props.color};
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TrackImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #d3d3d3;
  flex-shrink: 0;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TrackTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${theme.colors.text};
`;

const TrackArtist = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const InsightCard = styled.div`
  padding: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
`;

const InsightLabel = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 4px;
`;

const InsightValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

// Edit Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: flex-end;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${theme.colors.text};
  position: absolute;
  left: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 auto;
  color: ${theme.colors.text};
`;

const EditPhotoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const EditPhotoButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FormItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border: none;
  background: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  text-align: left;
`;

const FormLabel = styled.div`
  font-size: 1rem;
  font-weight: 400;
  color: ${theme.colors.text};
`;

const FormValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormValue = styled.div`
  font-size: 1rem;
  color: ${theme.colors.text_secondary};
`;

const SectionDivider = styled.div`
  height: 16px;
`;

// Feed styled components for activity
const FeedItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const FeedAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const FeedUserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  text-align: left;
`;

const ActivityText = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
  text-align: left;
`;

const TimeStamp = styled.div`
  font-size: 0.8rem;
  color: #999;
  text-align: left;
`;

const FeedScoreContainer = styled.div`
  .score-circle {
    width: 2.5rem !important;
    height: 2.5rem !important;
    border: 1.5px solid #4b5563 !important;
  }
  .score-number {
    font-size: 1rem !important;
    font-weight: 600 !important;
    color: inherit !important; /* Add this line */
  }
`;

const Artwork = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background: #666;
  background-size: cover;
  background-position: center;
  margin: 12px 0;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ReviewText = styled.p`
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
  margin: 12px 0;
  text-align: left;
`;

const InteractionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const InteractionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: #666;
`;

const InteractionRight = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  padding: 0;
  &:hover {
    color: #333;
  }
`;

function User() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activity");
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likesModalReviewId, setLikesModalReviewId] = useState(null);
  const [genres, setGenres] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [insights, setInsights] = useState({});

  const handleLike = async (id, e) => {
    e?.stopPropagation();
    const item = activity.find((it) => it.id === id);
    if (!item) return;

    const wasLiked = item.isLiked;
    // Optimistic update
    setActivity((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              isLiked: !wasLiked,
              likes: wasLiked ? it.likes - 1 : it.likes + 1,
            }
          : it
      )
    );

    try {
      const response = await axios.post(`/api/reviews/${id}/like`);
      // Update with server response
      setActivity((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                isLiked: response.data.isLiked,
                likes: response.data.likesCount,
              }
            : it
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setActivity((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                isLiked: wasLiked,
                likes: wasLiked ? it.likes + 1 : it.likes - 1,
              }
            : it
        )
      );
    }
  };

  const handleLikesClick = (id, e) => {
    e.stopPropagation();
    setLikesModalReviewId(id);
  };

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `/api/users/${encodeURIComponent(username)}/profile`,
          token
            ? {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            : undefined
        );

        const data = response.data.profile;
        setProfile(data);
        setActivity(response.data.activity || []);
        setGenres(response.data.taste?.genres || []);
        setTopTracks(response.data.taste?.topTracks || []);
        setInsights(response.data.taste?.insights || {});
        setIsFollowing(!!data.isFollowing);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, navigate]);

  // Redirect to /app/profile if viewing own profile
  useEffect(() => {
    if (profile && profile.isCurrentUser) {
      navigate("/app/profile", { replace: true });
    }
  }, [profile, navigate]);

  const formatDate = (date) => {
    if (!date) return "Recently";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Container>
        <p
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: theme.colors.text_secondary,
          }}
        >
          Loading profile...
        </p>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <p
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: theme.colors.text_secondary,
          }}
        >
          User not found
        </p>
      </Container>
    );
  }

  const handleToggleFollow = async (nextFollowState) => {
    const token = localStorage.getItem("token");
    const url = nextFollowState
      ? `/api/users/${profile.id}/follow`
      : `/api/users/${profile.id}/unfollow`;

    await axios.post(
      url,
      {},
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );

    setIsFollowing(nextFollowState);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            followers: prev.followers + (nextFollowState ? 1 : -1),
          }
        : prev
    );
  };

  const handleFollowersClick = () =>
    navigate(`/app/followers/${encodeURIComponent(profile.username)}`, {
      state: { initialTab: "followers" },
    });

  const handleFollowingClick = () =>
    navigate(`/app/followers/${encodeURIComponent(profile.username)}`, {
      state: { initialTab: "following" },
    });

  return (
    <>
      <Container>
        <Header>
          <div>
            <IconButton onClick={() => navigate(-1)}>
              <ChevronLeft size={22} />
            </IconButton>
          </div>
          <UserName>{profile.name}</UserName>
          <div>
            <IconButton>
              <Share size={20} />
            </IconButton>
            <IconButton>
              <Menu size={20} />
            </IconButton>
          </div>
        </Header>

        <ProfileSection>
          <Avatar
            style={
              profile.profilePictureUrl
                ? {
                    backgroundImage: `url(${profile.profilePictureUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    backgroundColor: profile.avatarColor || "#666",
                  }
            }
          >
            {!profile.profilePictureUrl &&
              (profile.name || profile.username || "")
                .trim()
                .charAt(0)
                .toUpperCase()}
            {profile.isCurrentUser && (
              <EditIcon onClick={() => setShowEditModal(true)}>
                <Edit size={16} />
              </EditIcon>
            )}
          </Avatar>
          <Username>@{profile.username}</Username>
          <Bio>{profile.bio}</Bio>
          <MemberSince>
            Member since {formatDate(profile.dateJoined)}
          </MemberSince>

          {!profile.isCurrentUser && (
            <ButtonGroup>
              <FollowButton
                initialFollow={isFollowing}
                onToggle={handleToggleFollow}
              />
            </ButtonGroup>
          )}
        </ProfileSection>

        <StatsRow>
          <StatItemClickable onClick={handleFollowersClick}>
            <StatValue>{profile.followers}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItemClickable>
          <StatItemClickable onClick={handleFollowingClick}>
            <StatValue>{profile.following}</StatValue>
            <StatLabel>Following</StatLabel>
          </StatItemClickable>
          <StatItemClickable onClick={() => navigate("/app/leaderboard")}>
            <StatValue>#{profile.rank || "?"}</StatValue>
            <StatLabel>Rank on Musi</StatLabel>
          </StatItemClickable>
        </StatsRow>

        <ListItem
          onClick={() => navigate(`/app/users/${encodeURIComponent(profile.username)}/lists`, { state: { tab: "listened" } })}
        >
          <ListItemLeft>
            <span>🎧</span>
            <ListItemText>Listened</ListItemText>
          </ListItemLeft>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ListItemCount>{profile.listenedCount || 0}</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem
          onClick={() => navigate(`/app/users/${encodeURIComponent(profile.username)}/lists`, { state: { tab: "want" } })}
        >
          <ListItemLeft>
            <span>🔖</span>
            <ListItemText>Want to listen</ListItemText>
          </ListItemLeft>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ListItemCount>{profile.wantCount || 0}</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem
          onClick={() => navigate(`/app/users/${encodeURIComponent(profile.username)}/lists`, { state: { tab: "both" } })}
        >
          <ListItemLeft>
            <span>🔗</span>
            <ListItemText>Music you both listen to</ListItemText>
          </ListItemLeft>
          <ChevronRight size={20} color="#999" />
        </ListItem>

        <CardRow>
          <CardClickable onClick={() => navigate("/app/leaderboard")}>
            <Star size={20} />
            <CardLabel>Rank on Musi</CardLabel>
            <CardValue>#{profile.rank || "?"}</CardValue>
          </CardClickable>
          <Card>
            <Flame size={20} />
            <CardLabel>Current streak</CardLabel>
            <CardValue>
              {profile.currentStreak}{" "}
              {profile.currentStreak === 1 ? "day" : "days"}
            </CardValue>
          </Card>
        </CardRow>

        <TabBar>
          <Tab
            active={activeTab === "activity"}
            onClick={() => setActiveTab("activity")}
          >
            Recent activity
          </Tab>
          <Tab
            active={activeTab === "taste"}
            onClick={() => setActiveTab("taste")}
          >
            Music taste
          </Tab>
        </TabBar>

        {activeTab === "activity" && (
          <TabContent>
            {activity.length === 0 ? (
              <div
                style={{
                  color: theme.colors.text_secondary,
                  textAlign: "center",
                  padding: "40px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <p>No recent activity</p>
              </div>
            ) : (
              activity.map((item) => {
                const goToMusic = () => {
                  const musicType = item.musicType || "Song";
                  navigate(
                    `/app/music/${encodeURIComponent(
                      musicType
                    )}/${encodeURIComponent(item.artist)}/${encodeURIComponent(
                      item.title
                    )}`
                  );
                };

                return (
                  <FeedItem key={item.id}>
                    <UserInfo>
                      <FeedAvatar
                        style={{
                          backgroundImage: item.userAvatar
                            ? `url(${item.userAvatar})`
                            : "none",
                          backgroundColor: item.userAvatar
                            ? "transparent"
                            : item.userAvatarColor || "#ddd",
                        }}
                      >
                        {!item.userAvatar &&
                          item.username &&
                          item.username.charAt(0).toUpperCase()}
                      </FeedAvatar>
                      <UserDetails>
                        <FeedUserName>{item.user}</FeedUserName>
                        <ActivityText>
                          {item.activity}{" "}
                          <span
                            style={{
                              color: theme.colors.accent,
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            onClick={goToMusic}
                          >
                            {item.title}
                          </span>{" "}
                          by {item.artist}
                        </ActivityText>
                        <TimeStamp>{item.time}</TimeStamp>
                      </UserDetails>
                      <FeedScoreContainer>
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
                      </FeedScoreContainer>
                    </UserInfo>

                    {item.imageUrl && (
                      <Artwork
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                        onClick={goToMusic}
                      />
                    )}
                    {item.review && (
                      <ReviewText>Notes: {item.review}</ReviewText>
                    )}

                    <InteractionBar>
                      <InteractionLeft>
                        <LikeButton onClick={(e) => handleLike(item.id, e)}>
                          <Heart
                            size={16}
                            fill={item.isLiked ? "#ff6b6b" : "none"}
                            color={item.isLiked ? "#ff6b6b" : "#666"}
                          />
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
                );
              })
            )}
          </TabContent>
        )}

        {activeTab === "taste" && (
          <TabContent>
            <SectionTitle>TOP GENRES</SectionTitle>

            <ChartContainer>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genres}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {genres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic legends matching Profile.js */}
              <ChartLegend
                style={{
                  left: '10%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                {genres.slice(2, 4).map((g, i) => (
                  <React.Fragment key={`L1-${i}`}>
                    <LegendItem>
                      <LegendColor color={g.color} />
                      <span>{g.name}</span>
                    </LegendItem>
                    <LegendItem>
                      <span style={{ marginLeft: '20px', fontSize: '.8rem' }}>
                        {g.value.toFixed(2)}%
                      </span>
                    </LegendItem>
                  </React.Fragment>
                ))}
              </ChartLegend>
              <ChartLegend
                style={{
                  right: '10%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                {genres.slice(0, 2).map((g, i) => (
                  <React.Fragment key={`L2-${i}`}>
                    <LegendItem>
                      <LegendColor color={g.color} />
                      <span>{g.name}</span>
                    </LegendItem>
                    <LegendItem>
                      <span style={{ marginLeft: '20px', fontSize: '.8rem' }}>
                        {g.value.toFixed(2)}%
                      </span>
                    </LegendItem>
                  </React.Fragment>
                ))}
              </ChartLegend>
            </ChartContainer>

            <SectionTitle>TOP TRACKS</SectionTitle>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {topTracks.map((t, i) => (
                <li 
                  key={t.id}
                  onClick={() => {
                    navigate(`/app/music/Song/${encodeURIComponent(t.artist)}/${encodeURIComponent(t.title)}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <SongItem
                    title={t.title}
                    subtitle={`Song • ${t.artist}`}
                    meta={t.tags && t.tags.length > 0 ? t.tags.join(", ") : ""}
                    score={t.score}
                    imageUrl={t.imageUrl}
                    dividerTop={i > 0}
                  />
                </li>
              ))}
            </ul>

            <SectionTitle>INSIGHTS</SectionTitle>
            <InsightsGrid>
              <InsightCard>
                <InsightLabel>Artists Listened</InsightLabel>
                <InsightValue>{insights.artistsListened ?? 0}</InsightValue>
              </InsightCard>
              <InsightCard>
                <InsightLabel>Songs Rated</InsightLabel>
                <InsightValue>{insights.songsRated ?? 0}</InsightValue>
              </InsightCard>
            </InsightsGrid>
          </TabContent>
        )}
      </Container>

      {/* Edit Profile Modal */}
      <ModalOverlay
        show={showEditModal}
        onClick={() => setShowEditModal(false)}
      >
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <CloseButton onClick={() => setShowEditModal(false)}>
              <ChevronLeft size={24} />
            </CloseButton>
            <ModalTitle>Edit profile</ModalTitle>
          </ModalHeader>

          <EditPhotoSection>
            <Avatar />
            <EditPhotoButton>Edit profile photo</EditPhotoButton>
          </EditPhotoSection>

          <FormSection>
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormValueContainer>
                <FormValue>{profile.name}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormValueContainer>
                <FormValue>@{profile.username}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormValueContainer>
                <FormValue>{profile.bio}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <SectionDivider />

            <FormItem>
              <FormLabel>Account settings</FormLabel>
              <ChevronRight size={20} color="#999" />
            </FormItem>
          </FormSection>
        </ModalContent>
      </ModalOverlay>
      {likesModalReviewId && (
        <LikesModal
          reviewId={likesModalReviewId}
          onClose={() => setLikesModalReviewId(null)}
        />
      )}
    </>
  );
}

export default User;
