import React, { useState } from "react";
import "./RatingModal.css";

function RatingModal({ title, artist, imageUrl, musicType, onClose, onSubmit }) {
  const [selectedRating, setSelectedRating] = useState(0); 
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    const ratingLabel = ratingOptions.find((_, i) => i === selectedRating)?.label || "N/A";
    
    const ratingData = {
      title,
      artist,
      ratingIndex: selectedRating,
      ratingLabel: ratingLabel,
      comment,
    };

    onSubmit(ratingData);
  };

  const ratingOptions = [
    { label: "I liked it!", color: "#000000" }, 
    { label: "It was fine", color: "#6b6b6b" },
    { label: "I didn't like it", color: "#d3d3d3" }
  ];

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="rating-modal-header">
          <img
            src={imageUrl}
            alt={title}
            className="rating-modal-image"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/f0f0f0/ccc?text=...'; e.currentTarget.onerror = null; }}
          />
          <div className="rating-modal-info">
            <h3>{title}</h3>
            <p>{musicType} • {artist}</p>
          </div>
          <button className="rating-modal-cancel" onClick={onClose}>Cancel</button>
        </div>

        <div className="rating-modal-section">
          <div className="rating-modal-question">How was it?</div>
          
          <div className="rating-modal-choices">
            {ratingOptions.map((option, i) => (
              <div
                key={option.label}
                className="rating-choice"
                onClick={() => setSelectedRating(i)}
              >
                <div
                  className={`rating-circle ${selectedRating === i ? "selected" : ""}`}
                  style={{ 
                    backgroundColor: selectedRating === i ? '#000' : option.color 
                  }}
                >
                  {selectedRating === i && <span className="checkmark">✓</span>}
                </div>
                <span className={`reaction-label ${selectedRating === i ? "selected" : ""}`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rating-modal-notes">
          <button className="rating-notes-btn" onClick={() => setShowCommentPopup(true)}>
            <span className="icon">📝</span>
            <span>Add notes</span>
            <span className="chevron">›</span>
          </button>
        </div>

        <button
          className="rating-submit-btn"
          onClick={handleSubmit} 
        >
          Submit rating
        </button>
      </div>

      {showCommentPopup && (
        <div className="comment-popup-overlay" onClick={() => setShowCommentPopup(false)}>
          <div className="comment-box" onClick={(e) => e.stopPropagation()}>
            <h4>Add Notes</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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