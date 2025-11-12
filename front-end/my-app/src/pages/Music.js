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
  const handleRatingClick = (songTitle, songArtist, type, rated) => {
    setSelectedSong({
      title: songTitle,
      artist: songArtist,
      musicType: type,
      isRated: rated,
      imageUrl: musicData.imageUrl, 
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (ratingInfo) => {
    console.log("Rating submitted!", ratingInfo);

    axios.post('http://localhost:3000/api/rate', ratingInfo)
      .then(response => {
        console.log('Rating saved to DB:', response.data);

        setMusicData(prevData => ({
          ...prevData,
          isRated: true,
          avgScore: response.data.newAvgScore, 
          totalRatings: response.data.newTotalRatings 
        }));
      })
      .catch(err => {
        console.error('Failed to save rating:', err);
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
  
  const API_URL = `http://localhost:3000/api/music/${musicType}/${encodedArtist}/${encodedTitle}`;

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
      <ImageHeader {...musicData} onRatingClick={handleRatingClick}/>
      <div className="description">
        <div className="vibe">
          {musicData?.vibe?.join(" • ")}
        </div>
        <div className="genre-year">
          {musicData?.musicType} | {musicData?.year} | {musicData?.genre?.join(" , ")}
        </div>
      </div>
      {musicType === "Song" && <SpotifySample title={title} artist={artist} />}
      
      <Scores title={title} artist={artist} isRated={musicData?.isRated} />

      {musicType === "Album" && (
        <AlbumList musicType={musicType} title={title} artist={artist} onRatingClick={handleRatingClick} />
      )}
      <FriendScore artist={artist} title={title} />
      <BottomNavBar />

      {showRatingModal && (
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