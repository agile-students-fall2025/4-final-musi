import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./AlbumSong.css";

function AlbumSong({ id, title, artist, isRated, score, onRatingClick, spotifyId, imageUrl, isBookmarked: initialBookmarked = false }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [rated, setRated] = useState(isRated);
  const songPath = `/app/music/Song/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

  // Update bookmark state when prop changes
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  // Update rated state when prop changes
  useEffect(() => {
    setRated(isRated);
  }, [isRated]);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isBookmarked) {
        await axios.post('http://localhost:3001/api/want/remove', {
          spotifyId: spotifyId || id,
        });
        setIsBookmarked(false);
      } else {
        await axios.post('http://localhost:3001/api/want', {
          spotifyId: spotifyId || id,
          title,
          artist,
          musicType: 'Song',
          imageUrl: imageUrl || '',
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to update bookmark');
    }
  };

  const handleRatingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRatingClick) {
      onRatingClick(title, artist, "Song", rated, spotifyId || id);
    }
  };

  return (
    <div className="album-song-item">
      <Link to={songPath} className="album-song-info" style={{ textDecoration: "none" }}>
        <span className="album-song-title">{title}</span>
        <span className="album-song-artist">{artist}</span>
      </Link>

      <div className="album-song-actions">
        {rated ? (
          <>
            <button
              className="album-song-btn"
              title="Edit Rating"
              onClick={handleRatingClick}
            >
              <img src="/edit.png" alt="Edit" className="icon" />
            </button>
            <div className="album-song-score-circle">{score}</div>
          </>
        ) : (
          <>
            <button
              className="album-song-btn"
              title="Rate"
              onClick={handleRatingClick}
            >
              <img src="/plus.png" alt="Rate" className="icon" />
            </button>
            <button
              className="album-song-btn"
              title="Bookmark"
              onClick={handleBookmarkClick}
            >
              <img
                src={isBookmarked ? "/filled-bookmark.png" : "/empty-bookmark.png"}
                alt="Bookmark"
                className="icon"
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AlbumSong;
