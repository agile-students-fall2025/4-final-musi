import React, { useState } from "react";
import LeaderboardItem from "../components/LeaderboardItem";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("reviews");
  const [leaderboardData, setLeaderboardData] = useState(null);

  const fetchSongs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/leaderboard');
      const data = await response.json();
      setLeaderboardData(data); 
    } 
    catch (e) {
      console.error('Error fetching leaderboard data:', e);
    }
  };

  fetchSongs();

  const currentData = leaderboardData ? (leaderboardData[activeTab] || []) : [];

  return (
    <div className="leaderboard-page-container">
      <div className="leaderboard-content">
        <header className="header">
          <h1>Leaderboard</h1>
        </header>

        <div className="leaderboard-tabs">
          <button
            className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`tab-button ${activeTab === "songs" ? "active" : ""}`}
            onClick={() => setActiveTab("songs")}
          >
            Songs
          </button>
          <button
            className={`tab-button ${activeTab === "albums" ? "active" : ""}`}
            onClick={() => setActiveTab("albums")}
          >
            Albums
          </button>
        </div>

        <section className="filter-section">
          <p>
            {activeTab === "albums" && "Number of albums rated"}
            {activeTab === "reviews" && "Number of reviews written"}
            {activeTab === "songs" && "Number of songs rated"}
          </p>
          <div className="filter-dropdown">
            All Members <span className="dropdown-arrow">▼</span>
          </div>
        </section>

        <main>
          <ol className="leaderboard-list">
            {currentData.map((user) => (
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