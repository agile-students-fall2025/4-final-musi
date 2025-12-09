import React, { useState, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar";
import FriendScore from "../components/FriendScore";
import ImageHeader from "../components/ImageHeader";
import Scores from "../components/Scores";
import AlbumList from "../components/AlbumList";
import RatingModal from "../components/RatingModal.js";
import axios from "axios";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../theme';
import "./Music.css";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const SkeletonContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SkeletonImageHeader = styled.div`
  width: 100%;
  height: 400px;
  background: ${theme.colors.background_secondary};
  position: relative;
  overflow: hidden;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonContent = styled.div`
  width: 480px;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SkeletonLine = styled.div`
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
  border-radius: 4px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonVibe = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 1rem;
`;

const SkeletonTag = styled.div`
  height: 24px;
  width: 80px;
  border-radius: 12px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonScoresContainer = styled.div`
  width: 480px;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SkeletonScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid ${theme.colors.outline};
`;

const SkeletonScoreCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
  flex-shrink: 0;
`;

const SkeletonScoreText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SkeletonSpotifyPlayer = styled.div`
  width: 480px;
  height: 80px;
  border-radius: 12px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
  margin-top: 1rem;
`;

const BackButtonContainer = styled.div`
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1000;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 1);
  }
`;

const DescriptionText = styled.div`
  text-align: left;
  color: ${theme.colors.accent};
  font-size: 1.4rem; 
  line-height: 1rem;
  font-weight: 600;
`;

function Music() {
  const { musicType, artist, title } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [musicData, setMusicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');

  const handleRatingClick = (songTitle, songArtist, type, rated, id) => {
    const testId = `${type}-${songArtist}-${songTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const finalId = id || musicData.spotifyId || musicData._id || musicData.id || testId;

    setSelectedSong({
      title: songTitle,
      artist: songArtist,
      musicType: type,
      isRated: rated,
      imageUrl: musicData.imageUrl,
      spotifyId: finalId,
      initialRating: rated ? musicData.userRating : undefined, 
      initialComment: rated ? musicData.userReview : undefined 
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (ratingInfo) => {
    const payload = {
      ...ratingInfo,
      reviewText: ratingInfo.comment,
      targetId: ratingInfo.targetId || ratingInfo.spotifyId 
    };

    if (!payload.targetId) {
      setToast("Error: Missing Target ID");
      setTimeout(() => setToast(''), 3000);
      return;
    }

    axios.post('/api/reviews/rate-ranked', payload)
      .then(response => {
        setMusicData(prevData => ({
          ...prevData,
          isRated: true,
          avgScore: response.data.score || prevData.avgScore, 
        }));
        
        window.dispatchEvent(new CustomEvent('reviewSubmitted'));
        
        setToast(`You gave ${ratingInfo.title} by ${ratingInfo.artist} a ${response.data.score}!`);
        setTimeout(() => setToast(''), 5000);

        setRefreshKey(prevKey => prevKey + 1);
      })
      .catch(err => {
        console.error('Failed to save rating:', err);
        setToast("Failed to save rating");
        setTimeout(() => setToast(''), 3000);
      })
      .finally(() => {
        setShowRatingModal(false);
        setSelectedSong(null);
      });
  };

  const handleRemoveRating = async () => {
    if (!selectedSong) return;

    // 1. Construct the target ID string (slug) exactly as the backend expects
    const type = selectedSong.musicType || 'Song';
    const artistName = selectedSong.artist || '';
    const songTitle = selectedSong.title || '';
    
    const targetSlug = `${type}-${artistName}-${songTitle}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    try {
      // 2. Fetch the user's review list for this type
      const listRes = await axios.get(`/api/reviews/my-list`, { 
        params: { type: type.toLowerCase() } 
      });
      
      const reviews = Array.isArray(listRes.data) ? listRes.data : [];
      
      // 3. Find the review where targetId matches the constructed slug
      const reviewToDelete = reviews.find(r => {
        // targetId might be a populated object OR a raw string depending on backend
        const rId = typeof r.targetId === 'object' ? (r.targetId.spotifyId || r.targetId._id) : r.targetId;
        
        // Check match against the constructed slug
        // Also check against spotifyId if available, just in case
        return rId === targetSlug || r.targetId === targetSlug || (selectedSong.spotifyId && rId === selectedSong.spotifyId);
      });

      if (!reviewToDelete || !reviewToDelete._id) {
        setToast("Review not found.");
        setTimeout(() => setToast(''), 3000);
        return;
      }

      // 4. Delete using the actual Review ID (_id)
      await axios.delete(`/api/reviews/${reviewToDelete._id}`);

      // 5. Update UI
      setMusicData(prev => ({
        ...prev,
        isRated: false
      }));
      
      setToast("Rating removed");
      setTimeout(() => setToast(''), 3000);
      
      setRefreshKey(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('reviewSubmitted'));
      setShowRatingModal(false);
      setSelectedSong(null);

    } catch (err) {
      console.error("Error deleting rating:", err);
      setToast("Failed to remove rating");
      setTimeout(() => setToast(''), 3000);
    }
  };
  
  const handleCancelModal = () => {
    setShowRatingModal(false);
    setSelectedSong(null);
  };

  const handleBack = () => {
    if (location.state?.fromSearch && location.state?.searchTerm) {
      navigate('/app/search', {
        state: { searchTerm: location.state.searchTerm }
      });
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (!musicType || !artist || !title) {
      setLoading(false);
      return; 
    }
    setLoading(true);
    setError(null);

    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    
    const API_URL = `/api/music/${musicType}/${encodedArtist}/${encodedTitle}`;

    axios.get(API_URL)
        .then(response => {
          setMusicData(response.data);
        })
        .catch(err => {
          console.error("Error fetching music data:", err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });

  }, [musicType, artist, title, refreshKey]);

  const formatGenre = (g) => {
    if (!g) return "";
    return g.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <SkeletonContainer>
        <BackButtonContainer>
          <BackButton onClick={handleBack} aria-label="Go back">
            <ChevronLeft size={24} color={theme.colors.text} />
          </BackButton>
        </BackButtonContainer>
        <SkeletonImageHeader />
        <SkeletonContent>
          <SkeletonVibe>
            <SkeletonTag />
            <SkeletonTag />
            <SkeletonTag />
          </SkeletonVibe>
        </SkeletonContent>
        {musicType === "Song" && <SkeletonSpotifyPlayer />}
        <SkeletonScoresContainer>
          {[...Array(3)].map((_, index) => (
            <SkeletonScoreRow key={`score-skeleton-${index}`}>
              <SkeletonScoreCircle />
              <SkeletonScoreText>
                <SkeletonLine height="16px" width="60%" />
                <SkeletonLine height="14px" width="40%" />
              </SkeletonScoreText>
            </SkeletonScoreRow>
          ))}
        </SkeletonScoresContainer>
        {musicType === "Album" && (
          <SkeletonScoresContainer>
            <SkeletonLine height="20px" width="200px" />
            {[...Array(5)].map((_, index) => (
              <SkeletonScoreRow key={`album-song-skeleton-${index}`}>
                <SkeletonScoreCircle />
                <SkeletonScoreText>
                  <SkeletonLine height="16px" width="70%" />
                  <SkeletonLine height="14px" width="50%" />
                </SkeletonScoreText>
              </SkeletonScoreRow>
            ))}
          </SkeletonScoresContainer>
        )}
        <BottomNavBar />
      </SkeletonContainer>
    );
  }

  if (error) {
    return <div className="Music-error">Error: {error}</div>;
  }

  if (!musicData) {
    return <div className="Music-error">No data found.</div>;
  }

  const typeDisplay = musicData.musicType;
  const yearDisplay = musicData.year;
  const genreDisplay = (musicData.genre && musicData.genre.length > 0)
    ? musicData.genre.map(formatGenre).join(", ")
    : null;

  const descriptionString = [typeDisplay, yearDisplay, genreDisplay]
    .filter(Boolean) // Remove null or undefined values
    .join(" • ");

  return (
    <div className="Music">
      <BackButtonContainer>
        <BackButton onClick={handleBack} aria-label="Go back">
          <ChevronLeft size={24} color={theme.colors.text} />
        </BackButton>
      </BackButtonContainer>
      
      <ImageHeader 
        {...musicData} 
        onRatingClick={(t, a, type, rated) => handleRatingClick(t, a, type, rated, musicData.spotifyId || musicData._id || musicData.id)}
      />
      <div className="description">
      <DescriptionText>
        {descriptionString}
      </DescriptionText>
      </div>
      <Scores title={title} artist={artist} musicType={musicType} refreshTrigger={refreshKey} />

      {musicType === "Album" && (
        <AlbumList 
          musicType={musicType} 
          title={title} 
          artist={artist} 
          onRatingClick={handleRatingClick} 
        />
      )}
      <FriendScore musicType={musicType} artist={artist} title={title} />
      <BottomNavBar />

      {showRatingModal && selectedSong && (
        <RatingModal 
          { ...selectedSong } 
          onClose={handleCancelModal}  
          onSubmit={handleRatingSubmit} 
          onRemove={handleRemoveRating}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "80px",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "999px",
            fontSize: "0.95rem",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 2000,
            whiteSpace: "nowrap"
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default Music;