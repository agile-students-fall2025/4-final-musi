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

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <div className="rating-modal-header">
          <img src={imageUrl} alt={title} className="rating-modal-image" />
          <div>
            <h3>{title}</h3>
            <p>{musicType} • {artist}</p>
          </div>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>

        <div className="rating-options">
          {["I liked it!", "It was fine", "I didn’t like it"].map((label, i) => (
            <div
              key={i}
              className={`rating-option ${selectedRating === i ? "selected" : ""}`}
              onClick={() => setSelectedRating(i)}
            >
              <div className="circle">
                {selectedRating === i && <span className="checkmark">✓</span>}
              </div>
              <p>{label}</p>
            </div>
          ))}
        </div>

        <div className="extras">
          <div className="extra-option" onClick={() => setShowCommentPopup(true)}>
            📝 <span>Add notes</span>
          </div>
          <div className="extra-option">
            🖼️ <span>Add photos</span>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Submit rating
        </button>
      </div>

      {showCommentPopup && (
        <div className="comment-popup">
          <div className="comment-box">
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
