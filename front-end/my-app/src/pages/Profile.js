import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Share,
  Menu,
  Edit,
  ChevronRight,
  ChevronLeft,
  Heart,
  Check,
  Star,
  Flame,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import SongItem from "../components/SongItem";
import Sidebar from "../components/Sidebar";
import axios from "axios";

/* ===== styled components unchanged from your file (shortened for brevity) ===== */
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
const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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
const Button = styled.button`
  flex: 1;
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
`;
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
  border-bottom: 2px solid ${(p) => (p.active ? "#000" : "transparent")};
  font-size: 0.9rem;
  font-weight: ${(p) => (p.active ? "600" : "400")};
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
  margin: 24px 0 16px;
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
  background: ${(p) => p.color};
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
// Feed
const FeedItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
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
  background: #ddd;
  border-radius: 50%;
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
const Rating = styled.div`
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: auto;
`;
const AlbumGrid = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
`;
const AlbumCover = styled.div`
  width: 80px;
  height: 80px;
  background: #666;
  border-radius: 4px;
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
const InteractionRight = styled.div`
  font-size: 0.85rem;
  color: #666;
`;
// Modals
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(p) => (p.show ? "flex" : "none")};
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
const InputModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: white;
  display: ${(p) => (p.show ? "flex" : "none")};
  flex-direction: column;
  z-index: 3000;
`;
const InputModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;
const CancelButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
`;
const InputModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;
const InputModalBody = styled.div`
  flex: 1;
  padding: 24px 20px;
`;
const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
`;
const InputPrefix = styled.span`
  font-size: 1rem;
  color: ${theme.colors.text};
  margin-right: 8px;
`;
const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: ${theme.colors.text};
  background: transparent;
  ::placeholder {
    color: ${theme.colors.text_secondary};
  }
`;
const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;
const SaveButton = styled.button`
  width: calc(100% - 40px);
  margin: 0 20px 20px 20px;
  padding: 16px;
  background: #000;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activity");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // API state
  const [profile, setProfile] = useState(null); // {name, username, bio, memberSince, followers, following, rank, streak, listenedCount, wantCount}
  const [activity, setActivity] = useState([]); // feed items
  const [genres, setGenres] = useState([]); // [{name,value,color}]
  const [topTracks, setTopTracks] = useState([]); // [{id,title,artist,tags,score}]
  const [insights, setInsights] = useState({}); // {artistsListened, songsRated}

  useEffect(() => {
    setLoading(true);
    setErr(null);

    // Fetch both profile and streak data
    Promise.all([axios.get("/api/profile"), axios.get("/api/streak")])
      .then(([profileRes, streakRes]) => {
        const profileData = profileRes.data || {};
        const streakData = streakRes.data || {};

        // Update profile with current streak
        const updatedProfile = {
          ...profileData.profile,
          streakDays: streakData.currentStreak,
        };

        setProfile(updatedProfile);
        setActivity(profileData.activity || []);
        setGenres(profileData.taste?.genres || []);
        setTopTracks(profileData.taste?.topTracks || []);
        setInsights(profileData.taste?.insights || {});
      })
      .catch((e) => setErr(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  // nav handlers
  const handleFollowersClick = () => navigate("/app/followers");
  const handleFollowingClick = () => navigate("/app/followers");

  // likes (optimistic)
  const handleLike = (id) => {
    setActivity((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              isLiked: !it.isLiked,
              likes: it.isLiked ? it.likes - 1 : it.likes + 1,
            }
          : it
      )
    );
    axios.post(`/api/profile/activity/${id}/like`).catch(() => {
      setActivity((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                isLiked: !it.isLiked,
                likes: it.isLiked ? it.likes - 1 : it.likes + 1,
              }
            : it
        )
      );
    });
  };

  // edit flow
  const openEditField = (field) => {
    setEditingField(field);
    setTempValue(profile?.[field] || "");
    setShowEditModal(false);
    setShowInputModal(true);
  };

  const handleSaveField = () => {
    const payload = { [editingField]: tempValue };
    axios
      .put("/api/profile", payload)
      .then((r) => {
        setProfile(r.data.profile); // server returns updated profile
        setShowInputModal(false);
        setShowEditModal(true);
      })
      .catch(() => {
        // if it fails, keep modal open; could show toast
      });
  };

  const handleCancelEdit = () => {
    setShowInputModal(false);
    setShowEditModal(true);
    setTempValue("");
  };

  const getFieldTitle = (field) =>
    field === "name"
      ? "Change name"
      : field === "username"
      ? "Change username"
      : "Change bio";

  if (loading)
    return (
      <Container>
        <div>Loading…</div>
      </Container>
    );
  if (err || !profile)
    return (
      <Container>
        <div style={{ color: "#e5534b" }}>Error: {err || "No profile"}</div>
      </Container>
    );

  const recordActivity = async (activity = "listened") => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/streak/activity",
        {
          activity: activity,
        }
      );

      console.log("Activity recorded:", response.data);

      setProfile((prev) => ({
        ...prev,
        streakDays: response.data.currentStreak,
      }));

      return response.data;
    } catch (error) {
      console.error("Error recording activity:", error);
      throw error;
    }
  };

  return (
    <>
      <Container>
        <Header>
          <UserName>{profile.name}</UserName>
          <HeaderIcons>
            <IconButton>
              <Share size={24} />
            </IconButton>
            <IconButton onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} color="#333" />
            </IconButton>
          </HeaderIcons>
        </Header>

        <ProfileSection>
          <Avatar>
            <EditIcon onClick={() => setShowEditModal(true)}>
              <Edit size={16} />
            </EditIcon>
          </Avatar>
          <Username>@{profile.username}</Username>
          <Bio>{profile.bio}</Bio>
          <MemberSince>Member since {profile.memberSince}</MemberSince>

          <ButtonGroup>
            <Button onClick={() => setShowEditModal(true)}>Edit profile</Button>
            <Button>Share profile</Button>
          </ButtonGroup>
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
          <StatItem>
            <StatValue>#{profile.rank}</StatValue>
            <StatLabel>Rank on Musi</StatLabel>
          </StatItem>
        </StatsRow>

        <ListItem>
          <ListItemLeft>
            <span>🎧</span>
            <ListItemText>Listened</ListItemText>
          </ListItemLeft>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ListItemCount>{profile.listenedCount}</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem>
          <ListItemLeft>
            <span>🔖</span>
            <ListItemText>Want to listen</ListItemText>
          </ListItemLeft>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ListItemCount>{profile.wantCount}</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem>
          <ListItemLeft>
            <span>🎯</span>
            <ListItemText>Recs for you</ListItemText>
          </ListItemLeft>
          <ChevronRight size={20} color="#999" />
        </ListItem>

        <CardRow>
          <Card>
            <Star size={20} />
            <CardLabel>Rank on Musi</CardLabel>
            <CardValue>#{profile.rank}</CardValue>
          </Card>
          <Card>
            <Flame size={20} />
            <CardLabel>Current streak</CardLabel>
            <CardValue>{profile.streakDays} days</CardValue>
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
            {activity.map((item) => (
              <FeedItem key={item.id}>
                <UserInfo>
                  <FeedAvatar />
                  <UserDetails>
                    <FeedUserName>{item.user}</FeedUserName>
                    <ActivityText>{item.activity}</ActivityText>
                    <TimeStamp>{item.time}</TimeStamp>
                  </UserDetails>
                  <Rating>{item.rating}</Rating>
                </UserInfo>

                <AlbumGrid>
                  <AlbumCover />
                  <AlbumCover />
                  <AlbumCover />
                </AlbumGrid>
                <ReviewText>Notes: {item.review}</ReviewText>

                <InteractionBar>
                  <InteractionLeft>
                    <LikeButton onClick={() => handleLike(item.id)}>
                      <Heart
                        size={16}
                        fill={item.isLiked ? "#ff6b6b" : "none"}
                        color={item.isLiked ? "#ff6b6b" : "#666"}
                      />
                      <span>{item.likes} likes</span>
                    </LikeButton>
                  </InteractionLeft>
                  <InteractionRight>
                    <span>{item.bookmarks} bookmarks</span>
                  </InteractionRight>
                </InteractionBar>
              </FeedItem>
            ))}
          </TabContent>
        )}

        {activeTab === "taste" && (
          <TabContent>
            <SectionTitle>YOUR TOP GENRES</SectionTitle>
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
                    {genres.map((g, i) => (
                      <Cell key={i} fill={g.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* simple static legends (match colors from server) */}
              <ChartLegend
                style={{
                  left: "10%",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {genres.slice(2, 4).map((g, i) => (
                  <React.Fragment key={`L1-${i}`}>
                    <LegendItem>
                      <LegendColor color={g.color} />
                      <span>{g.name}</span>
                    </LegendItem>
                    <LegendItem>
                      <span style={{ marginLeft: "20px", fontSize: ".8rem" }}>
                        {g.value.toFixed(2)}%
                      </span>
                    </LegendItem>
                  </React.Fragment>
                ))}
              </ChartLegend>
              <ChartLegend
                style={{
                  right: "10%",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {genres.slice(0, 2).map((g, i) => (
                  <React.Fragment key={`L2-${i}`}>
                    <LegendItem>
                      <LegendColor color={g.color} />
                      <span>{g.name}</span>
                    </LegendItem>
                    <LegendItem>
                      <span style={{ marginLeft: "20px", fontSize: ".8rem" }}>
                        {g.value.toFixed(2)}%
                      </span>
                    </LegendItem>
                  </React.Fragment>
                ))}
              </ChartLegend>
            </ChartContainer>

            <SectionTitle>YOUR TOP TRACKS</SectionTitle>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {topTracks.map((t, i) => (
                <li key={t.id}>
                  <SongItem
                    title={t.title}
                    subtitle={`Song • ${t.artist}`}
                    meta={t.tags.join(", ")}
                    score={t.score}
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

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
            <FormItem onClick={() => openEditField("name")}>
              <FormLabel>Name</FormLabel>
              <FormValueContainer>
                <FormValue>{profile.name}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <FormItem onClick={() => openEditField("username")}>
              <FormLabel>Username</FormLabel>
              <FormValueContainer>
                <FormValue>@{profile.username}</FormValue>
                <ChevronRight size={20} color="#999" />
              </FormValueContainer>
            </FormItem>

            <FormItem onClick={() => openEditField("bio")}>
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

      {/* Input Edit Modal */}
      <InputModalOverlay show={showInputModal}>
        <InputModalHeader>
          <CancelButton onClick={handleCancelEdit}>Cancel</CancelButton>
          <InputModalTitle>{getFieldTitle(editingField)}</InputModalTitle>
          <div style={{ width: "60px" }} />
        </InputModalHeader>

        <InputModalBody>
          <InputWrapper>
            {editingField === "username" && <InputPrefix>@</InputPrefix>}
            <Input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={`Enter ${editingField}`}
              autoFocus
            />
            {tempValue && profile && tempValue !== profile[editingField] && (
              <CheckIcon>
                <Check size={16} />
              </CheckIcon>
            )}
          </InputWrapper>
        </InputModalBody>

        <SaveButton
          onClick={handleSaveField}
          disabled={
            !tempValue.trim() ||
            (profile && tempValue === profile[editingField])
          }
        >
          Save
        </SaveButton>
      </InputModalOverlay>
    </>
  );
}

export default Profile;
