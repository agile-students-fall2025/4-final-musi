import React, { useState, useEffect } from "react";
import AlbumSong from "./AlbumSong";
import axios from "axios";
import "./AlbumList.css";

function AlbumList({ artist, title, onRatingClick }) {
  const [album, setAlbum] = useState([]);

  useEffect(() => {
    if (!artist || !title) {
      return; 
    }
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);

    const API_URL = `http://localhost:3000/api/albumlist/${encodedArtist}/${encodedTitle}`;

    axios.get(API_URL)
      .then(response => {
        setAlbum(response.data);
      })
      .catch(error => {
        console.error("Error fetching album songs:", error);
        setAlbum([]);
      });

  }, [artist, title]);

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
