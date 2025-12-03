import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Scores from "../components/Scores";

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
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import SongItem from "../components/SongItem";
import Sidebar from "../components/Sidebar";
import "../components/Score.css";
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
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
  
  &:active {
    transform: scale(0.95);
  }
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
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.02);
  }
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
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
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
  text-align: center;
  max-width: 300px;
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
  transition: all 0.2s;
  
  &:hover {
    background: #f8f8f8;
    border-color: #d0d0d0;
  }
  
  &:active {
    transform: scale(0.98);
  }
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
  
  &:active {
    transform: scale(0.95);
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
  transition: background 0.2s;
  
  &:hover {
    background: #f9f9f9;
  }
  
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
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transform: translateY(-2px);
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
  border-bottom: 2px solid ${(p) => (p.active ? "#000" : "transparent")};
  font-size: 0.9rem;
  font-weight: ${(p) => (p.active ? "600" : "400")};
  cursor: pointer;
  color: ${theme.colors.text};
  transition: all 0.2s;
  
  &:hover {
    background: #f9f9f9;
  }
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
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
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
const FeedScoreContainer = styled.div`
  .score-circle{ width:2.5rem!important; height:2.5rem!important; border:1.5px solid #4b5563!important;}
  .score-number{ font-size:1rem!important; font-weight:600!important;}
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
  transition: all 0.2s;
  
  &:hover {
    color: #333;
  }
  
  &:active {
    transform: scale(0.95);
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
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
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
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
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
  transition: background 0.2s;
  
  &:hover {
    background: #f9f9f9;
  }
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
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
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
  transition: opacity 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// ===== NEW: Enhanced Components =====

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyStateTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const EmptyStateText = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text_secondary};
  max-width: 300px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
`;

const ErrorIcon = styled(AlertCircle)`
  color: #e5534b;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const ErrorText = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text_secondary};
  margin-bottom: 24px;
  max-width: 300px;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SuccessToast = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(${p => p.show ? '0' : '-100px'});
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 4000;
  opacity: ${p => p.show ? '1' : '0'};
  transition: all 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: ${p => p.radius || '4px'};
  width: ${p => p.width || '100%'};
  height: ${p => p.height || '20px'};
  margin: ${p => p.margin || '0'};
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const RefreshButton = styled(IconButton)`
  animation: ${p => p.spinning ? 'spin 1s linear infinite' : 'none'};
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
  const [refreshing, setRefreshing] = useState(false);

  // NEW: Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // API state
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [genres, setGenres] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [insights, setInsights] = useState({});

  // NEW: Fetch profile data function for reusability
  const fetchProfileData = async () => {
    try {
      const [profileRes, streakRes] = await Promise.all([
        axios.get("/api/profile"),
        axios.get("/api/streak")
      ]);

      const profileData = profileRes.data || {};
      const streakData = streakRes.data || {};

      const updatedProfile = {
        ...profileData.profile,
        streakDays: streakData.currentStreak,
      };

      setProfile(updatedProfile);
      setActivity(profileData.activity || []);
      setGenres(profileData.taste?.genres || []);
      setTopTracks(profileData.taste?.topTracks || []);
      setInsights(profileData.taste?.insights || {});
      setErr(null);
    } catch (error) {
      setErr(error.message || "Failed to load profile");
      throw error;
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfileData()
      .finally(() => setLoading(false));
  }, []);

  // NEW: Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProfileData();
      showSuccess("Profile refreshed!");
    } catch (error) {
      // Error already set by fetchProfileData
    } finally {
      setRefreshing(false);
    }
  };

  // NEW: Success toast helper
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // nav handlers

  const handleFollowersClick = () => navigate(`/app/followers/${encodeURIComponent(profile.username)}`);
  const handleFollowingClick = () => navigate(`/app/followers/${encodeURIComponent(profile.username)}`);

  // Navigate to music page from feed item
  const goToMusicFromFeed = (item) => {
    const musicType = item.musicType || "Song";
    navigate(`/app/music/${encodeURIComponent(musicType)}/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`);
  };

  // Navigate to music page from top track
  const goToTrack = (track) => {
    navigate(`/app/music/Song/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`);
  };

  // Render review with clickable album/song titles
  const renderReviewWithLinks = (item) => {
    const review = item.review || "";
    const title = item.title || "";
    
    if (!title || !review.includes(title)) {
      return <>Notes: {review}</>;
    }

    const parts = review.split(title);
    return (
      <>
        Notes: {parts[0]}
        <span
          style={{ 
            color: theme.colors.accent, 
            cursor: "pointer", 
            fontWeight: 600,
            textDecoration: "underline"
          }}
          onClick={(e) => {
            e.stopPropagation();
            goToMusicFromFeed(item);
          }}
        >
          {title}
        </span>
        {parts[1]}
      </>
    );
  };

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
        setProfile(r.data.profile);
        setShowInputModal(false);
        setShowEditModal(true);
        // NEW: Show success feedback
        showSuccess("Profile updated successfully!");
      })
      .catch(() => {
        // Keep modal open on error
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

  // NEW: Loading skeleton
  if (loading) {
    return (
      <Container>
        <Header>
          <LoadingSkeleton width="150px" height="24px" />
          <HeaderIcons>
            <LoadingSkeleton width="40px" height="40px" radius="50%" margin="0 4px" />
            <LoadingSkeleton width="40px" height="40px" radius="50%" margin="0 4px" />
          </HeaderIcons>
        </Header>
        <ProfileSection>
          <LoadingSkeleton width="120px" height="120px" radius="50%" margin="0 0 16px 0" />
          <LoadingSkeleton width="150px" height="20px" margin="0 0 8px 0" />
          <LoadingSkeleton width="200px" height="16px" margin="0 0 24px 0" />
        </ProfileSection>
        <LoadingSkeleton width="100%" height="200px" margin="24px 0" />
      </Container>
    );
  }

  // NEW: Enhanced error state with retry
  if (err || !profile) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon size={48} />
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorText>{err || "Unable to load profile data"}</ErrorText>
          <RetryButton onClick={handleRefresh}>
            <RefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

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
      {/* NEW: Success toast */}
      <SuccessToast show={showSuccessToast}>
        <Check size={16} />
        {successMessage}
      </SuccessToast>

      <Container>
        <Header>
          <UserName>{profile.name}</UserName>
          <HeaderIcons>
            {/* NEW: Refresh button */}
            <RefreshButton 
              onClick={handleRefresh} 
              spinning={refreshing}
              title="Refresh profile"
            >
              <RefreshCw size={20} />
            </RefreshButton>
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
            {/* NEW: Empty state for no activity */}
            {activity.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>📻</EmptyStateIcon>
                <EmptyStateTitle>No activity yet</EmptyStateTitle>
                <EmptyStateText>
                  Start rating songs and albums to see your activity here
                </EmptyStateText>
              </EmptyState>
            ) : (
              activity.map((item) => (
                <FeedItem key={item.id}>
                  <UserInfo>
                    <FeedAvatar />
                    <UserDetails>
                      <FeedUserName>{item.user}</FeedUserName>
                      <ActivityText>
                        {item.activity}{" "}
                        <span
                          style={{ 
                            color: theme.colors.accent, 
                            cursor: "pointer", 
                            fontWeight: 600 
                          }}
                          onClick={() => goToMusicFromFeed(item)}
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
                            <span className="score-number">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                    </FeedScoreContainer>
                  </UserInfo>

                  <AlbumGrid>
                    <AlbumCover />
                    <AlbumCover />
                    <AlbumCover />
                  </AlbumGrid>
                  <ReviewText>{renderReviewWithLinks(item)}</ReviewText>

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
              ))
            )}
          </TabContent>
        )}

        {activeTab === "taste" && (
          <TabContent>
            <SectionTitle>YOUR TOP GENRES</SectionTitle>
            {/* NEW: Handle empty genres */}
            {genres.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>🎵</EmptyStateIcon>
                <EmptyStateTitle>No genre data yet</EmptyStateTitle>
                <EmptyStateText>
                  Rate more music to see your top genres
                </EmptyStateText>
              </EmptyState>
            ) : (
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
            )}

            <SectionTitle>YOUR TOP TRACKS</SectionTitle>
            {/* NEW: Handle empty tracks */}
            {topTracks.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>🎤</EmptyStateIcon>
                <EmptyStateTitle>No top tracks yet</EmptyStateTitle>
                <EmptyStateText>
                  Rate more songs to see your favorites here
                </EmptyStateText>
              </EmptyState>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {topTracks.map((t, i) => (
                  <li 
                    key={t.id}
                    onClick={() => goToTrack(t)}
                    style={{ cursor: "pointer" }}
                  >
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
            )}

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