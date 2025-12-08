import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { RotateCcw, HelpCircle, SkipForward } from "lucide-react";
import { theme } from "../theme";
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
  
  // Binary Search State
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [mid, setMid] = useState(0);
  
  // History for Undo
  const [history, setHistory] = useState([]);

  // Track how many items are in "better" tiers
  const [betterCount, setBetterCount] = useState(0);

  const ratingOptions = [
    { label: "I liked it!", color: theme.colors.green }, 
    { label: "It was fine", color: theme.colors.yellow },
    { label: "I didn't like it", color: theme.colors.red }
  ];

  const filterOutCurrentSong = (list) => {
    return list.filter(item => {
      const itemId = item.targetId?.spotifyId || item.targetId;
      return itemId !== spotifyId;
    });
  };

  // 1. Start Ranking
  const handleStartRanking = async () => {
    setMode('loading');
    try {
      const res = await axios.get(`/api/reviews/my-list?type=${targetType}`);
      
      const allItems = filterOutCurrentSong(res.data || []);
      
      const betterTierItems = allItems.filter(item => (item.ratingIndex ?? 0) < selectedRating);
      setBetterCount(betterTierItems.length);

      const sameTierItems = allItems.filter(item => (item.ratingIndex ?? 0) === selectedRating);

      if (sameTierItems.length === 0) {
        submitFinalRank(betterTierItems.length);
      } else {
        setExistingList(sameTierItems);
        setMin(0);
        setMax(sameTierItems.length - 1);
        setMid(Math.floor((0 + (sameTierItems.length - 1)) / 2));
        setMode('ranking');
        setHistory([]); // Reset history
      }
    } catch (err) {
      console.error("Error fetching list:", err);
      submitFinalRank(0);
    }
  };

  // 2. Handle Choice
  const handleChoice = (preferred) => {
    // Save current state to history before moving
    setHistory(prev => [...prev, { min, max, mid }]);

    let newMin = min;
    let newMax = max;

    if (preferred === 'new') {
      newMax = mid - 1;
    } else {
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

  // 3. New Functionality Handlers
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    
    // Restore state
    setMin(previous.min);
    setMax(previous.max);
    setMid(previous.mid);
    
    // Remove last history entry
    setHistory(prev => prev.slice(0, -1));
  };

  const handleTooTough = () => {
    // Treat as "Same Rank" -> Insert at current mid position
    calculateGlobalAndSubmit(mid);
  };

  const handleSkip = () => {
    // Move onto the music one rank above (index - 1)
    if (mid > 0) {
      setHistory(prev => [...prev, { min, max, mid }]);
      setMid(mid - 1);
    }
  };

  // 4. Calculate Global Rank
  const calculateGlobalAndSubmit = async (localRankIndex) => {
    try {
      // Global Rank = (Count of Better Items) + (My Position in Current Tier)
      submitFinalRank(betterCount + localRankIndex);
    } catch (e) {
      console.error("Error calculating global rank", e);
      submitFinalRank(localRankIndex);
    }
  }

  // 5. Submit
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
  const opponentImg = opponent?.targetId?.coverUrl || "https://placehold.co/60";

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
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
                    <div className={`rating-circle ${selectedRating === i ? "selected" : ""}`} style={{ backgroundColor: option.color }}>
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

        {/* VERSUS PHASE */}
        {mode === 'ranking' && opponent && (
          <div className="versus-container">
            <div className="versus-question">Which {targetType} do you prefer?</div>
            
            <div className="versus-wrapper">
              {/* CARD 1: New Song */}
              <div className="versus-card" onClick={() => handleChoice('new')}>
                <img src={imageUrl} alt={title} className="versus-card-image" />
                <div className="versus-card-title">{title}</div>
                <div className="versus-card-artist">{artist}</div>
                
                {/* Updated: Added 'new' class for red color */}
                <div className="versus-card-rank new">New</div>
              </div>

              {/* CENTER BADGE */}
              <div className="versus-or">OR</div>

              {/* CARD 2: Opponent */}
              <div className="versus-card" onClick={() => handleChoice('old')}>
                <img 
                  src={opponentImg} 
                  alt={opponent.targetId?.title} 
                  className="versus-card-image"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/60'; }}
                />
                <div className="versus-card-title">{opponent.targetId?.title || opponent.title}</div>
                <div className="versus-card-artist">{opponent.targetId?.artist || opponent.artist}</div>
                
                <div className="versus-card-rank">Rank #{betterCount + mid + 1}</div>
                <div className="versus-card-score">{opponent.rating?.toFixed(1)}</div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="versus-controls" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
               <button 
                 className="versus-action-btn" 
                 onClick={handleUndo}
                 style={{ visibility: history.length > 0 ? 'visible' : 'hidden' }}
               >
                 <RotateCcw size={18} /> Undo
               </button>

               <button 
                 className="versus-action-btn" 
                 onClick={handleTooTough}
               >
                 <HelpCircle size={18} /> Too tough
               </button>

               <button 
                 className="versus-action-btn" 
                 onClick={handleSkip}
                 style={{ visibility: mid > 0 ? 'visible' : 'hidden' }}
               >
                 Skip <SkipForward size={18} />
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