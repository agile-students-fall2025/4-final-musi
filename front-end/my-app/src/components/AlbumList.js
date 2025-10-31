import React, { useState, useEffect } from "react";
import AlbumSong from "./AlbumSong";
import "./AlbumList.css";

function AlbumList({ artist, title, onRatingClick }) {
  const [album, setAlbum] = useState([]);

  useEffect(() => {
    const mockAlbumSongs = [
      { id: 1, title: "drivers license", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
      { id: 2, title: "deja vu", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
      { id: 3, title: "good 4 u", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
      { id: 4, title: "traitor", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
    ];
    setAlbum(mockAlbumSongs);
  }, []);

  return (
    <div className="album-list-container">
      <h3 className="album-list-header">Songs</h3>
      <div className="album-song-list">
        {album.map((song) => (
          <AlbumSong
            key={song.id}
            id={song.id}
            title={song.title}
            artist={song.artist}
            isRated={song.isRated}
            score={song.score}
            onRatingClick={onRatingClick}
          />
        ))}
      </div>
    </div>
  );
}

export default AlbumList;
