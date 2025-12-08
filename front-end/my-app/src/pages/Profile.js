import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import SongItem from "../components/SongItem";
import Sidebar from "../components/Sidebar";
import LikesModal from "../components/LikesModal";
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
  .score-circle{ width:2.5rem!important; height:2.5rem!important; border:1.5px solid #4b5563!important;}
  .score-number{ font-size:1rem!important; font-weight:600!important;}
`;
const Artwork = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background: #666;
  background-size: cover;
  background-position: center;
  margin: 12px 0;
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
const MoreButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: ${theme.colors.text_secondary};
`;
const ReviewMenu = styled.div`
  position: absolute;
  top: 8px;
  right: 0;
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

// ===== NEW: Loading Skeleton =====
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

  // API state
  const [profile, setProfile] = useState(null); // {name, username, bio, memberSince, followers, following, rank, streak, listenedCount, wantCount}
  const [activity, setActivity] = useState([]); // feed items
  const [genres, setGenres] = useState([]); // [{name,value,color}]
  const [topTracks, setTopTracks] = useState([]); // [{id,title,artist,tags,score}]
  const [insights, setInsights] = useState({}); // {artistsListened, songsRated}
  const fileInputRef = useRef(null);
  const [activeReviewMenuId, setActiveReviewMenuId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [likesModalReviewId, setLikesModalReviewId] = useState(null);

  const handleEditPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const originalDataUrl = reader.result;

        const img = new Image();
        img.onload = async () => {
          try {
            const maxSize = 256; // max width/height for avatar
            let { width, height } = img;

            if (width > maxSize || height > maxSize) {
              const scale = Math.min(maxSize / width, maxSize / height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

            const res = await axios.put("/api/profile/photo", {
              imageData: compressedDataUrl,
            });
            const url = res.data.profilePictureUrl || compressedDataUrl;
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    profilePictureUrl: url,
                  }
                : prev
            );
          } catch (e) {
            console.error("Failed to update profile photo:", e);
          }
        };
        img.onerror = () => {
          console.error("Failed to load image for compression");
        };
        img.src = originalDataUrl;
      } catch (e) {
        console.error("Failed to process profile photo:", e);
      }
    };
    reader.readAsDataURL(file);
  };

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

// Listen for review submission events to refresh profile data
useEffect(() => {
  const handleReviewSubmitted = () => {
    // Refresh profile data when a review is submitted
    fetchProfileData().catch((error) => {
      console.error('Failed to refresh profile after review:', error);
    });
  };

  window.addEventListener('reviewSubmitted', handleReviewSubmitted);
  return () => {
    window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
  };
}, []);

// NEW: Refresh handler
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await fetchProfileData();
  } catch (error) {
    // Error already set by fetchProfileData
  } finally {
    setRefreshing(false);
  }
};

  // nav handlers

  const handleFollowersClick = () =>
    navigate(`/app/followers/${encodeURIComponent(profile.username)}`, {
      state: { initialTab: 'followers' },
    });

  const handleFollowingClick = () =>
    navigate(`/app/followers/${encodeURIComponent(profile.username)}`, {
      state: { initialTab: 'following' },
    });

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
      // If title not in review, just return plain text
      return <>Notes: {review}</>;
    }

    // Split review by the title and make title clickable
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
            ? { ...it, isLiked: response.data.isLiked, likes: response.data.likesCount }
            : it
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setActivity((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, isLiked: wasLiked, likes: wasLiked ? it.likes + 1 : it.likes - 1 }
            : it
        )
      );
    }
  };

  const handleLikesClick = (id, e) => {
    e.stopPropagation();
    setLikesModalReviewId(id);
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
  if (err || !profile)
    return (
      <Container>
        <div style={{ color: "#e5534b" }}>Error: {err || "No profile"}</div>
      </Container>
    );

  const recordActivity = async (activity = "listened") => {
    try {
      const response = await axios.post(
        "/api/streak/activity",
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

  const openReviewMenu = (id) => {
    setActiveReviewMenuId((prev) => (prev === id ? null : id));
  };

  const startEditReview = (item) => {
    setEditingReview(item);
    setEditingReviewText(item.review || "");
    setActiveReviewMenuId(null);
  };

  const saveEditReview = async () => {
    if (!editingReview) return;
    try {
      await axios.patch(`/api/reviews/${editingReview.id}`, {
        text: editingReviewText,
      });
      setActivity((prev) =>
        prev.map((it) =>
          it.id === editingReview.id ? { ...it, review: editingReviewText } : it
        )
      );
      setEditingReview(null);
      setEditingReviewText("");
    } catch (e) {
      console.error("Failed to update review:", e);
      alert("Failed to update review. Please try again.");
    }
  };

  const cancelEditReview = () => {
    setEditingReview(null);
    setEditingReviewText("");
  };

  const deleteReview = async (item) => {
    if (!window.confirm("Delete this review?")) {
      setActiveReviewMenuId(null);
      return;
    }
    try {
      await axios.delete(`/api/reviews/${item.id}`);
      setActivity((prev) => prev.filter((it) => it.id !== item.id));
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              listenedCount: Math.max(0, (prev.listenedCount || 0) - 1),
            }
          : prev
      );
    } catch (e) {
      console.error("Failed to delete review:", e);
      alert("Failed to delete review. Please try again.");
    } finally {
      setActiveReviewMenuId(null);
    }
  };

  return (
    <>
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
          <StatItemClickable onClick={() => navigate("/app/leaderboard")}>
            <StatValue>#{profile.rank}</StatValue>
            <StatLabel>Rank on Musi</StatLabel>
          </StatItemClickable>
        </StatsRow>

        <ListItem onClick={() => navigate("/app/lists", { state: { tab: "listened" } })}>
          <ListItemLeft>
            <span>🎧</span>
            <ListItemText>Listened</ListItemText>
          </ListItemLeft>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ListItemCount>{profile.listenedCount}</ListItemCount>
            <ChevronRight size={20} color="#999" />
          </div>
        </ListItem>

        <ListItem onClick={() => navigate("/app/lists", { state: { tab: "want" } })}>
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
          <CardClickable onClick={() => navigate("/app/leaderboard")}>
            <Star size={20} />
            <CardLabel>Rank on Musi</CardLabel>
            <CardValue>#{profile.rank}</CardValue>
          </CardClickable>
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
                <p>Search a song and start reviewing</p>
                <button
                  onClick={() => navigate("/app/search")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#000",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Find a song to review
                </button>
              </div>
            ) : (
              activity.map((item) => (
                <FeedItem key={item.id} style={{ position: "relative" }}>
                  <UserInfo>
                    <FeedAvatar
                      style={{
                        backgroundImage: item.userAvatar ? `url(${item.userAvatar})` : 'none',
                        backgroundColor: item.userAvatar ? 'transparent' : (item.userAvatarColor || '#ddd'),
                      }}
                    >
                      {!item.userAvatar && item.username && item.username.charAt(0).toUpperCase()}
                    </FeedAvatar>
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
                    <MoreButton onClick={() => openReviewMenu(item.id)}>
                      ⋯
                    </MoreButton>
                  </UserInfo>

                  {item.imageUrl && (
                    <Artwork style={{ backgroundImage: `url(${item.imageUrl})` }} />
                  )}
                  <ReviewText>{renderReviewWithLinks(item)}</ReviewText>

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
                    <InteractionRight>
                      <span>{item.bookmarks} bookmarks</span>
                    </InteractionRight>
                  </InteractionBar>

                  {activeReviewMenuId === item.id && (
                    <ReviewMenu>
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
                </FeedItem>
              ))
            )}
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
                <li 
                  key={t.id}
                  onClick={() => goToTrack(t)}
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
            </Avatar>
            <EditPhotoButton onClick={handleEditPhotoClick}>
              Edit profile photo
            </EditPhotoButton>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
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

            <FormItem onClick={() => navigate("/app/settings")}>
              <FormLabel>Account settings</FormLabel>
              <ChevronRight size={20} color="#999" />
            </FormItem>
          </FormSection>
        </ModalContent>
      </ModalOverlay>

      {/* Input Edit Modal */}
      <InputModalOverlay show={showInputModal || !!editingReview}>
        <InputModalHeader>
          <CancelButton onClick={editingReview ? cancelEditReview : handleCancelEdit}>
            Cancel
          </CancelButton>
          <InputModalTitle>
            {editingReview ? "Edit review" : getFieldTitle(editingField)}
          </InputModalTitle>
          <div style={{ width: "60px" }} />
        </InputModalHeader>

        <InputModalBody>
          <InputWrapper>
            {editingReview ? (
              <textarea
                style={{
                  width: "100%",
                  minHeight: "120px",
                  border: "none",
                  outline: "none",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
                value={editingReviewText}
                onChange={(e) => setEditingReviewText(e.target.value)}
                placeholder="Update your notes..."
                autoFocus
              />
            ) : (
              <>
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
              </>
            )}
          </InputWrapper>
        </InputModalBody>

        <SaveButton
          onClick={editingReview ? saveEditReview : handleSaveField}
          disabled={
            editingReview
              ? false
              : !tempValue.trim() ||
                (profile && tempValue === profile[editingField])
          }
        >
          Save
        </SaveButton>
      </InputModalOverlay>
      {likesModalReviewId && (
        <LikesModal
          reviewId={likesModalReviewId}
          onClose={() => setLikesModalReviewId(null)}
        />
      )}
    </>
  );
}

export default Profile;