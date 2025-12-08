import React, { useState, useEffect } from "react";
import AlbumSong from "./AlbumSong";
import axios from "axios";
import "./AlbumList.css";

function AlbumList({ artist, title, onRatingClick, refreshTrigger }) {
  const [album, setAlbum] = useState([]);

  const fetchAlbumSongs = () => {
    if (!artist || !title) {
      return; 
    }
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);

    const API_URL = `/api/albumlist/${encodedArtist}/${encodedTitle}`;

    axios.get(API_URL)
      .then(response => {
        setAlbum(response.data);
      })
      .catch(error => {
        console.error("Error fetching album songs:", error);
        setAlbum([]);
      });
  };

  useEffect(() => {
    fetchAlbumSongs();
  }, [artist, title, refreshTrigger]);

  // Listen for review submission events to refresh the list
  useEffect(() => {
    const handleReviewSubmitted = () => {
      fetchAlbumSongs();
    };
    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
    };
  }, [artist, title]);

  return (
    <div className="album-list-container">
      <h3 className="album-list-header">Songs</h3>
      <div className="album-song-list">
        {album.map((song) => (
          <AlbumSong
            key={song.id}
            id={song.id}
            spotifyId={song.spotifyId}
            title={song.title}
            artist={song.artist}
            isRated={song.isRated}
            score={song.score}
            isBookmarked={song.isBookmarked}
            imageUrl={song.imageUrl}
            onRatingClick={onRatingClick}
          />
        ))}
      </div>
    </div>
  );
}

export default AlbumList;
