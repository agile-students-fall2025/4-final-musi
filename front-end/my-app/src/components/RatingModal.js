import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./RatingModal.css";

function RatingModal({ title, artist, imageUrl, musicType, onClose, onSubmit, spotifyId }) {
  const { token } = useContext(AuthContext);
  const targetType = musicType ? musicType.toLowerCase() : "song";

  // State
  const [selectedRating, setSelectedRating] = useState(0); 
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [comment, setComment] = useState("");
  const [mode, setMode] = useState('initial'); 
  const [existingList, setExistingList] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [mid, setMid] = useState(0);

  const ratingOptions = [
    { label: "I liked it!", color: "#000000" }, 
    { label: "It was fine", color: "#6b6b6b" },
    { label: "I didn't like it", color: "#d3d3d3" }
  ];

  // Helper to remove the current song from the list (prevents self-comparison)
  const filterOutCurrentSong = (list) => {
    return list.filter(item => {
      // Backend returns targetId as an object (populated) or fallback
      const itemId = item.targetId?.spotifyId || item.targetId;
      return itemId !== spotifyId;
    });
  };

  // 1. Start Ranking
  const handleStartRanking = async () => {
    setMode('loading');
    try {
      const res = await axios.get(`http://localhost:3001/api/reviews/my-list?type=${targetType}`);
      
      // A. Remove current song from the list (fixes "Song A vs Song A" and "Always #1" bugs)
      const allItems = filterOutCurrentSong(res.data || []);
      
      // B. Filter by Tier (Only compare against same category)
      const sameTierItems = allItems.filter(item => (item.ratingIndex ?? 0) === selectedRating);

      if (sameTierItems.length === 0) {
        // If no items in this tier, place it after all "Better" items
        const betterTierItems = allItems.filter(item => (item.ratingIndex ?? 0) < selectedRating);
        submitFinalRank(betterTierItems.length);
      } else {
        setExistingList(sameTierItems);
        setMin(0);
        setMax(sameTierItems.length - 1);
        setMid(Math.floor((0 + (sameTierItems.length - 1)) / 2));
        setMode('ranking');
      }
    } catch (err) {
      console.error("Error fetching list:", err);
      submitFinalRank(0);
    }
  };

  // 2. Handle Choice
  const handleChoice = (preferred) => {
    let newMin = min;
    let newMax = max;

    if (preferred === 'new') {
      // User prefers NEW song (Higher in list = Lower Index)
      newMax = mid - 1;
    } else {
      // User prefers OLD song
      newMin = mid + 1;
    }

    if (newMin > newMax) {
      calculateGlobalAndSubmit(newMin);
    } else {
      setMin(newMin);
      setMax(newMax);
      setMid(Math.floor((newMin + newMax) / 2));
    }
  };

  // 3. Calculate Global Rank
  const calculateGlobalAndSubmit = async (localRankIndex) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/reviews/my-list?type=${targetType}`);
      
      // A. Again, filter out ourselves so we don't count our old rating
      const allItems = filterOutCurrentSong(res.data || []);

      // B. Count items in better tiers (e.g. if I am Tier 1, count all Tier 0 items)
      const betterTierCount = allItems.filter(item => (item.ratingIndex ?? 0) < selectedRating).length;
      
      // Global Rank = (Count of Better Items) + (My Position in Current Tier)
      submitFinalRank(betterTierCount + localRankIndex);
    } catch (e) {
      console.error("Error calculating global rank", e);
      submitFinalRank(localRankIndex);
    }
  }

  // 4. Submit
  const submitFinalRank = (finalRankIndex) => {
    const ratingLabel = ratingOptions.find((_, i) => i === selectedRating)?.label || "N/A";
    
    const finalData = {
      targetId: spotifyId, 
      targetType: targetType,
      title,
      artist,
      imageUrl,
      ratingIndex: selectedRating,
      ratingLabel: ratingLabel,
      comment,
      rankIndex: finalRankIndex
    };

    onSubmit(finalData);
  };

  const opponent = existingList[mid]; 

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER - Always visible */}
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

        {/* INITIAL PHASE */}
        {(mode === 'initial' || mode === 'loading') && (
          <>
            <div className="rating-modal-section">
              <div className="rating-modal-question">How was it?</div>
              <div className="rating-modal-choices">
                {ratingOptions.map((option, i) => (
                  <div key={option.label} className="rating-choice" onClick={() => setSelectedRating(i)}>
                    <div className={`rating-circle ${selectedRating === i ? "selected" : ""}`} style={{ backgroundColor: selectedRating === i ? '#000' : option.color }}>
                      {selectedRating === i && <span className="checkmark">✓</span>}
                    </div>
                    <span className={`reaction-label ${selectedRating === i ? "selected" : ""}`}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rating-modal-notes">
              <button className="rating-notes-btn" onClick={() => setShowCommentPopup(true)}>
                <span className="icon">📝</span><span>{comment ? "Edit notes" : "Add notes"}</span><span className="chevron">›</span>
              </button>
            </div>
            <button className="rating-submit-btn" onClick={handleStartRanking} disabled={mode === 'loading'}>
              {mode === 'loading' ? "Loading List..." : "Next: Rank it"}
            </button>
          </>
        )}

        {/* VERSUS PHASE (Horizontal Cards Style) */}
        {mode === 'ranking' && opponent && (
          <div className="versus-container">
            <div className="versus-question">Which {targetType} do you prefer?</div>
            
            <div className="versus-wrapper">
              {/* CARD 1: New Song */}
              <div className="versus-card" onClick={() => handleChoice('new')}>
                <div className="versus-card-title">{title}</div>
                <div className="versus-card-artist">{artist}</div>
                <div className="versus-card-rank">New</div>
              </div>

              {/* CENTER BADGE */}
              <div className="versus-or">OR</div>

              {/* CARD 2: Opponent */}
              <div className="versus-card" onClick={() => handleChoice('old')}>
                <div className="versus-card-title">{opponent.targetId?.title || opponent.title}</div>
                <div className="versus-card-artist">{opponent.targetId?.artist || opponent.artist}</div>
                <div className="versus-card-rank">Rank #{mid + 1}</div>
              </div>
            </div>

            {/* Controls (Hidden placeholder) */}
            <div className="versus-controls">
               <button className="versus-action-btn" style={{visibility: 'hidden'}}>
                 ↩ Undo
               </button>
            </div>
          </div>
        )}
      </div>

      {showCommentPopup && (
        <div className="comment-popup-overlay" onClick={() => setShowCommentPopup(false)}>
          <div className="comment-box" onClick={(e) => e.stopPropagation()}>
            <h4>Add Notes</h4>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your thoughts here..." />
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