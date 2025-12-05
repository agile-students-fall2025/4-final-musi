import React, { useState, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar";
import FriendScore from "../components/FriendScore";
import ImageHeader from "../components/ImageHeader";
import Scores from "../components/Scores";
import AlbumList from "../components/AlbumList";
import RatingModal from "../components/RatingModal.js";
import SpotifySample from "../components/SpotifySample";
import axios from "axios";
import { useParams } from 'react-router-dom'; 
import "./Music.css";

function Music() {
  const { musicType, artist, title } = useParams();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [musicData, setMusicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Toast State
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
      spotifyId: finalId
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

    axios.post('http://localhost:3001/api/reviews/rate-ranked', payload)
      .then(response => {
        setMusicData(prevData => ({
          ...prevData,
          isRated: true,
          avgScore: response.data.score || prevData.avgScore, 
        }));
        
        // Dispatch custom event to refresh album list if on album page
        window.dispatchEvent(new CustomEvent('reviewSubmitted'));
        
        // Updated Toast Message & Duration (5s)
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
  
  const handleCancelModal = () => {
    setShowRatingModal(false);
    setSelectedSong(null);
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
    
    const API_URL = `http://localhost:3001/api/music/${musicType}/${encodedArtist}/${encodedTitle}`;

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

  if (loading) {
    return <div className="Music-loading">Loading...</div>; 
  }

  if (error) {
    return <div className="Music-error">Error: {error}</div>;
  }

  if (!musicData) {
    return <div className="Music-error">No data found.</div>;
  }

  return (
    <div className="Music">
      <ImageHeader 
        {...musicData} 
        onRatingClick={(t, a, type, rated) => handleRatingClick(t, a, type, rated, musicData.spotifyId || musicData._id || musicData.id)}
      />
      <div className="description">
        <div className="vibe">
          {musicData?.vibe?.join(" • ")}
        </div>
      </div>
      {musicType === "Song" && <SpotifySample title={title} artist={artist} />}
      
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
        />
      )}

      {/* Toast Notification */}
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