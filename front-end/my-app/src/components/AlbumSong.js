import React, { useState } from "react";

function AlbumSong({ id, title, artist, isRated, score, onRatingClick }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="album-song-item">
      <div className="album-song-info">
        <span className="album-song-title">{title}</span>
        <span className="album-song-artist">{artist}</span>
      </div>

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
