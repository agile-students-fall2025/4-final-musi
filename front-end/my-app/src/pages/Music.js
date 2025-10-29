import React, { useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import FriendScore from "../components/FriendScore";
import ImageHeader from "../components/ImageHeader";
import Scores from "../components/Scores";
import AlbumList from "../components/AlbumList";
import RatingModal from "../components/RatingModal.js"; // Import your modal

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
    };

    setTimeout(() => setMusicData(mockData), 500); // simulate network delay
  }, [artist, title]);
  return (
    <div className="Music">
      <ImageHeader {...musicData} />
      {musicType === "Song" && <SpotifySample title={title} artist={artist} />}
      <Scores title={title} artist={artist} isRated={isRated} />
      {musicType === "Album" && (
        <AlbumList title={title} artist={artist} onRatingClick={handleRatingClick} />
      )}
      <FriendScore artist={artist} title={title} />
      <BottomNavBar />

      {showRatingModal && (
        <RatingModal song={selectedSong} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Music;
