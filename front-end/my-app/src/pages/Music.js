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
      alert("Error: Missing Target ID. Cannot save rating.");
      return;
    }

    axios.post('http://localhost:3001/api/reviews/rate-ranked', payload)
      .then(response => {
        setMusicData(prevData => ({
          ...prevData,
          isRated: true,
          avgScore: response.data.score || prevData.avgScore, 
        }));

        // Remove from "Want to listen" if present
        const type = ratingInfo.targetType || selectedSong?.musicType || musicType;
        const slugId = `${type}-${selectedSong?.artist || artist}-${selectedSong?.title || title}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-');

        const removals = [];
        if (ratingInfo.spotifyId) {
          removals.push(
            axios.post('http://localhost:3001/api/want/remove', {
              spotifyId: ratingInfo.spotifyId,
            })
          );
        }
        removals.push(
          axios.post('http://localhost:3001/api/want/remove', {
            spotifyId: slugId,
          })
        );

        Promise.allSettled(removals).catch(() => {});

        // Dispatch event to notify other pages (like Profile) that profile data should refresh
        window.dispatchEvent(new CustomEvent('reviewSubmitted'));

        alert(`Successfully ranked #${response.data.rank} on your list!`);
      })
      .catch(err => {
        console.error('Failed to save rating:', err);
        const serverMsg = err.response ? err.response.data : err.message;
        alert(`Failed to save rating: ${JSON.stringify(serverMsg)}`);
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

  }, [musicType, artist, title]);

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
        spotifyId={musicData.spotifyId}
        spotifyUrl={musicData.spotifyUrl}
        onRatingClick={(t, a, type, rated) => handleRatingClick(t, a, type, rated, musicData.spotifyId || musicData._id || musicData.id)}
      />
      <div className="description">
        <div className="vibe">
          {musicData?.vibe?.join(" • ")}
        </div>
      </div>
      {musicType === "Song" && <SpotifySample title={title} artist={artist} />}
      
      <Scores title={title} artist={artist} musicType={musicType} />

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
    </div>
  );
}

export default Music;