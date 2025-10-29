import React, { useState } from "react";
import "./RatingModal.css";

function RatingModal({ title, artist, imageUrl, musicType, onClose }) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    console.log({
      title,
      artist,
      rating: selectedRating,
      comment,
    });
    setShowCommentPopup(false);
    onClose();
  };

  const ratingLabels = ["I liked it!", "It was fine", "I didn’t like it"];

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <div className="rating-modal-header">
          <img 
            src={imageUrl} 
            alt={title} 
            className="rating-modal-image" 
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/ccc/FFFFFF?text=...'; e.currentTarget.onerror = null; }}
          />
          <div className="rating-modal-info">
            <h3>{title}</h3>
            <p>{musicType} • {artist}</p>
          </div>
          <button className="rating-modal-cancel" onClick={onClose}>Cancel</button>
        </div>

        <div className="rating-modal-section">
          <div className="rating-modal-question">How was it?</div>
          
          <div className="rating-modal-reactions">
            {ratingLabels.map((label, i) => (
              <div
                key={i}
                className={`rating-circle ${selectedRating === i ? "selected" : ""}`}
                onClick={() => setSelectedRating(i)}
                data-rating={i} 
              >
                {selectedRating === i && <span className="checkmark">✓</span>}
              </div>
            ))}
          </div>
          
          <div className="rating-modal-labels">
            {ratingLabels.map((label, i) => (
              <span 
                key={i}
                className={`reaction-label ${selectedRating === i ? "selected" : ""}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="rating-modal-options">
          <button className="rating-option-btn" onClick={() => setShowCommentPopup(true)}>
            <span className="icon">📝</span>
            <span>Add notes</span>
          </button>
          <button className="rating-option-btn">
            <span className="icon">🖼️</span>
            <span>Add photos</span>
          </button>
        </div>

        <button 
          className="rating-submit-btn" 
          onClick={handleSubmit}
          disabled={selectedRating === null} 
        >
          Submit rating
        </button>
      </div>

      {showCommentPopup && (
        <div className="comment-popup">
          <div className="comment-box">
            <h4>Add Notes</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.T.value)}
              placeholder="Write your thoughts here..."
            />
            <div className="comment-actions">
              <button onClick={() => setShowCommentPopup(false)}>Cancel</button>
              <button onClick={() => setShowCommentPopup(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RatingModal;