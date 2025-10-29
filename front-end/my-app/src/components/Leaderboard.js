import React from 'react';
import './Leaderboard.css';
import BottomNavBar from './BottomNavBar';

const leaderboardData = [
    { rank: 1, username: '@dvd', score: 1640 },
    { rank: 2, username: '@andycabindol', score: 1569 },
    { rank: 3, username: '@julz', score: 1467 },
    { rank: 4, username: '@ian', score: 1428 },
    { rank: 5, username: '@zuhair', score: 1304 },
    { rank: 6, username: '@dvd', score: 1237 },
    { rank: 7, username: '@dvd', score: 1220 },
    { rank: 8, username: '@dvd', score: 1096 },
    { rank: 9, username: '@dvd', score: 1029 },
    { rank: 10, username: '@dvd', score: 814 },
    { rank: 11, username: '@dvd', score: 451 },
];

function Leaderboard({ rank, username, score }) {
    return (
        <li className="leaderboard-item">
            <span className="rank">{rank}</span>
            <div className="avatar-placeholder"></div>
            <span className="username">{username}</span>
            <span className="score">{score}</span>
        </li>
    );
}


export default Leaderboard;