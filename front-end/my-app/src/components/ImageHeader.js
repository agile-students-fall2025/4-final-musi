import React, {useState} from 'react'
import './ImageHeader.css'

function ImageHeader({imageUrl, title, artist, avgScore, totalRatings, isRated, onRatingClick}) {

    const [isBookmarked, SetIsBookmarked] = useState(false)

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
            <button className="image-header-action-btn" title="Rate" onClick={()=>onRatingClick(isRated)}>
              <img 
                src={isRated ? "/edit.png" : "/plus.png"}
                alt="Rate" 
                className="icon" 
              />
            </button>
            <button className="image-header-action-btn" title="Bookmark" onClick={()=>SetIsBookmarked(!isBookmarked)}>
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