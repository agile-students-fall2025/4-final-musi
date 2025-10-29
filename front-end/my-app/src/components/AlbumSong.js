import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AlbumSong.css";

function AlbumSong({ id, title, artist, isRated, score, onRatingClick }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const songPath = `/music/song/${encodeURIComponent(artist)}/${encodeURIComponent(title)}}`;

  return (
    <div className="album-song-item">
      <Link to={songPath} className="album-song-info" style={{ textDecoration: "none" }}>
        <span className="album-song-title">{title}</span>
        <span className="album-song-artist">{artist}</span>
      </Link>

      <div className="album-song-actions">
        {isRated ? (
          <>
            <button
              className="album-song-btn"
              title="Edit Rating"
              onClick={() => onRatingClick(title, artist, "Song", true)}
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
              onClick={() => onRatingClick(title, artist, "Song", false)}
            >
              <img src="/plus.png" alt="Rate" className="icon" />
            </button>
            <button
              className="album-song-btn"
              title="Bookmark"
              onClick={() => setIsBookmarked(!isBookmarked)}
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
