import React, {useState, useEffect} from 'react'
import './ImageHeader.css'

function ImageHeader({imageUrl, title, artist, avgScore, totalRatings, isRated, onRatingClick, musicType, isBookmarked: initialBookmarked = false, spotifyId}) {

    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

    useEffect(() => {
      setIsBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    const toggleBookmark = async () => {
      try {
        if (isBookmarked) {
          await fetch("http://localhost:3001/api/want/remove", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": localStorage.getItem("token") || "",
            },
            body: JSON.stringify({ spotifyId }),
          });
          setIsBookmarked(false);
        } else {
          await fetch("http://localhost:3001/api/want", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": localStorage.getItem("token") || "",
            },
            body: JSON.stringify({
              spotifyId,
              title,
              artist,
              musicType,
              imageUrl,
            }),
          });
          setIsBookmarked(true);
        }
      } catch (e) {
        console.error("Bookmark toggle failed:", e);
      }
    };

    return (
    <div className="image-header-container">

      <img
        src={imageUrl}
        alt={`${title} cover art`}
        className="image-header-img"
      />
      
      <div className="image-header-gradient" />

      <button 
        className="image-header-share-btn"
        title="Share"
      >
        <img 
          src="/share.png" 
          alt="Share" 
          className="icon"
        />
      </button>

      <div className="image-header-content">
        
        <h1 className="image-header-title">
          {title}
        </h1>
        
        <h2 className="image-header-artist">
          {artist}
        </h2>
        
        <div className="image-header-row">
          
          <div className="image-header-ratings">
            <span className="image-header-score">
              {avgScore}
            </span>
            <span className="image-header-total">
              ({totalRatings} ratings)
            </span>
          </div>
          
          <div className="image-header-actions">
            <button className="image-header-action-btn" title="Rate" onClick={()=>onRatingClick(title, artist, musicType, isRated)}>
              <img 
                src={isRated ? "/edit.png" : "/plus.png"}
                alt="Rate" 
                className="icon" 
              />
            </button>
            <button className="image-header-action-btn" title="Bookmark" onClick={toggleBookmark}>
              <img 
                src={isBookmarked ? '/filled-bookmark.png' : '/empty-bookmark.png'} 
                alt="Bookmark" 
                className="icon" 
              />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ImageHeader;