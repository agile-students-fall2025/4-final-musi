import React from "react";
import styled from "styled-components";

const StyledLeaderboardItem = styled.li`
  display: flex; /* Use flexbox to arrange children */
  justify-content: space-between; /* This is the key! Pushes items apart */
  align-items: center; /* Keeps them aligned vertically */
  padding: 12px 8px; /* Add some nice spacing */
  border-bottom: 1px solid #f0f0f0; /* Separator line */

  /* Change background on hover for a nice effect */
  &:hover {
    background-color: #fafafa;
  }
`;

const ItemRank = styled.span`
  flex-basis: 40px; /* Give it a fixed width */
  font-size: 1rem;
  font-weight: bold;
  color: #888;
`;

const ItemUsername = styled.span`
  flex-grow: 1; /* Allows it to take up the remaining space */
  margin-left: 16px; /* Adds space between rank and username */
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
`;

const ItemScore = styled.span`
  flex-basis: 80px; /* Give it a fixed width */
  text-align: right; /* Align the number to the right */
  font-size: 1.1rem;
  font-weight: bold;
  color: #000;
`;

function LeaderboardItem({ rank, username, score }) {
  return (
    <StyledLeaderboardItem>
      <ItemRank>{rank}</ItemRank>
      <ItemUsername>{username}</ItemUsername>
      <ItemScore>{score}</ItemScore>
    </StyledLeaderboardItem>
  );
}

const leaderboardData = [
  { rank: 1, username: "@dvd", score: 1640 },
  { rank: 2, username: "@andycabindol", score: 1569 },
  { rank: 3, username: "@julz", score: 1467 },
  { rank: 4, username: "@ian", score: 1428 },
  { rank: 5, username: "@zuhair", score: 1304 },
  { rank: 6, username: "@dvd", score: 1237 },
  { rank: 7, username: "@dvd", score: 1220 },
  { rank: 8, username: "@dvd", score: 1096 },
  { rank: 9, username: "@dvd", score: 1029 },
  { rank: 10, username: "@dvd", score: 814 },
  { rank: 11, username: "@dvd", score: 451 },
];

function Leaderboard() {
  return (
    <div className="leaderboard-page-container">
      <div className="leaderboard-content">
        <header className="header">
          <h1>Leaderboard</h1>
        </header>

        <div className="leaderboard-tabs">
          <button className="tab-button">Reviews</button>
          <button className="tab-button">Songs</button>
          <button className="tab-button active">Albums</button>
        </div>

        <section className="filter-section">
          <p>Number of albums on your listened list</p>
          <div className="filter-dropdown">
            All Members <span className="dropdown-arrow">▼</span>
          </div>
        </section>

        <main>
          <ol className="leaderboard-list">
            {leaderboardData.map((user) => (
              <LeaderboardItem
                key={user.rank}
                rank={user.rank}
                username={user.username}
                score={user.score}
              />
            ))}
          </ol>
        </main>
      </div>
    </div>
  );
}

export default Leaderboard;