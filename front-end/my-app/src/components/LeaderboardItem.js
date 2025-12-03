import React from 'react';
import './LeaderboardItem.css';

const LeaderboardItem = ({ rank, username, score, profilePictureUrl, avatarColor, isCurrentUser, onClick }) => {
  const displayName = username.replace(/^@/, "") || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <li className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`} onClick={onClick}>
      <span className="item-rank">{rank}</span>
      <div
        className="item-avatar"
        style={
          profilePictureUrl
            ? {
                backgroundImage: `url(${profilePictureUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                backgroundColor: avatarColor || "#666",
              }
        }
      >
        {!profilePictureUrl && initial}
      </div>
      <span className="item-username">
        {username}
        {isCurrentUser && <span className="you-label"> (You)</span>}
      </span>
      <span className="item-score">{score}</span>
    </li>
  );
};

export default LeaderboardItem;