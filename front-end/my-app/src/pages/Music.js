import React, { useState, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar";
import FriendScore from "../components/FriendScore";
import ImageHeader from "../components/ImageHeader";
import Scores from "../components/Scores";
import AlbumList from "../components/AlbumList";
import RatingModal from "../components/RatingModal.js";
import SpotifySample from "../components/SpotifySample";
import "./Music.css";

function Music({ musicType, artist, title, isRated }) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [musicData, setMusicData] = useState(null);

  const handleRatingClick = (songTitle, songArtist, type, rated) => {
    setSelectedSong({
      title: songTitle,
      artist: songArtist,
      musicType: type,
      isRated: rated,
    });
    setShowRatingModal(true);
  };

  const handleCloseModal = () => {
    setShowRatingModal(false);
    setSelectedSong(null);
  };

  useEffect(() => {
    const mockData = {
      imageUrl: "/olivia-album.jpg",
      title: title || "SOUR",
      artist: artist || "Olivia Rodrigo",
      avgScore: 8.4,
      totalRatings: 1250,
      isRated: true,
      musicType: musicType || "Album",
      vibe: ["heartbreak", "pop", "emotional"],
      genre: ["pop", "indie pop"],
      year: 2021,
    };

    setTimeout(() => setMusicData(mockData), 500); // simulate network delay
  }, [artist, title]);
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
      <Scores title={title} artist={artist} isRated={isRated} />
      {musicType === "Album" && (
        <AlbumList title={title} artist={artist} onRatingClick={handleRatingClick} />
      )}
      <FriendScore artist={artist} title={title} />
      <BottomNavBar />

      {showRatingModal && (
        <RatingModal { ...selectedSong } onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Music;
