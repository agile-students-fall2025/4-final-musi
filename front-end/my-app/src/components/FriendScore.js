import "./FriendScore.css";
import React, {useEffect, useState} from 'react';
import axios from "axios";

function FriendScore({ musicType, artist, title }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!musicType || !artist || !title) {
      return;
    }

    const API_URL = `/api/friendscores/${encodeURIComponent(musicType)}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

    axios.get(API_URL)
      .then(response => {
        setData(response.data); 
      })
      .catch(error => {
        console.error("Error fetching friend scores:", error);
      });
  }, [musicType, artist, title]);

  function getScoreColorClass(rating) {
    if (rating === 0) return 'score-green';
    if (rating === 1) return 'score-yellow';
    if (rating === 2) return 'score-red';
    return '';
  }

  return (
    <div className="friend-score-container">
      <h3 className="friend-score-title">
        What your friends think
      </h3>
      
      {data.length === 0 ? (
        <div className="friend-score-empty">
          Add friends to see what they rated this {musicType}
        </div>
      ) : (
        <ul className="friend-score-list">
          {data.map((item) => (
            <li key={item.id} className="friend-score-item">
              
              <div className="friend-score-item-left">
                <div className="friend-score-avatar">
                  <img 
                    src={item.imgUrl || "https://placehold.co/40"} 
                    alt={`${item.name}'s avatar`} 
                    onError={(e) => {e.target.src = "https://placehold.co/40"}}
                  />
                </div>
                
                <div className="friend-score-user-info">
                  <div className="friend-score-user-name">{item.name}</div>
                  <div className="friend-score-user-handle">{item.handle}</div>
                </div>
              </div>
              
              <div className="friend-score-circle">
                <span className={`friend-score-number ${getScoreColorClass(item.rating)}`}>
                  {item.score}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FriendScore;