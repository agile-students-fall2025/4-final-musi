import React from 'react';
import './LeaderboardItem.css';

const LeaderboardItem = ({ rank, username, score }) => {
  return (
    <li className="leaderboard-item">
      <span className="item-rank">{rank}</span>
      <span className="item-username">{username}</span>
      <span className="item-score">{score}</span>
    </li>
  );
};

export default LeaderboardItem;