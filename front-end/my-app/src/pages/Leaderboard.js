import React, { useState } from "react";
import LeaderboardItem from "../components/LeaderboardItem";

const reviewData = [
  { rank: 1, username: "@dvd", score: 640 },
  { rank: 2, username: "@andycabindol", score: 569 },
  { rank: 3, username: "@julz", score: 467 },
  { rank: 4, username: "@ian", score: 428 },
  { rank: 5, username: "@zuhair", score: 304 },
  { rank: 6, username: "@beef", score: 237 },
  { rank: 7, username: "@fish", score: 220 },
  { rank: 8, username: "@tofu", score: 96 },
  { rank: 9, username: "@salmon", score: 90 },
  { rank: 10, username: "@trash", score: 9 },
  { rank: 11, username: "@slop", score: 1 },
];

const albumData = [
  { rank: 1, username: "@tea", score: 190 },
  { rank: 2, username: "@egg", score: 179 },
  { rank: 3, username: "@julz", score: 167 },
  { rank: 4, username: "@ian", score: 128 },
  { rank: 5, username: "@zuhair", score: 104 },
  { rank: 6, username: "@beef", score: 100 },
  { rank: 7, username: "@fish", score: 99 },
  { rank: 8, username: "@andycabindol", score: 96 },
  { rank: 9, username: "@salmon", score: 29 },
  { rank: 10, username: "@trash", score: 14 },
  { rank: 11, username: "@slop", score: 1 },
];

const songData = [
  { rank: 1, username: "@ian", score: 1640 },
  { rank: 2, username: "@andycabindol", score: 1569 },
  { rank: 3, username: "@julz", score: 1467 },
  { rank: 4, username: "@andy", score: 1428 },
  { rank: 5, username: "@zuhair", score: 1304 },
  { rank: 6, username: "@beef", score: 1237 },
  { rank: 7, username: "@fish", score: 1220 },
  { rank: 8, username: "@jules", score: 1096 },
  { rank: 9, username: "@salmon", score: 1029 },
  { rank: 10, username: "@trash", score: 814 },
  { rank: 11, username: "@slop", score: 451 },
];

const dataMap = {
  reviews: reviewData,
  songs: songData,
  albums: albumData,
};

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("reviews");

  const currentData = dataMap[activeTab];

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