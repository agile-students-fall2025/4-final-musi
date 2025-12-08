import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import LeaderboardItem from "../components/LeaderboardItem";
import "./Leaderboard.css";

function Leaderboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // "all" or "following"
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/leaderboard', {
          params: { filter }
        });
        setLeaderboardData(response.data.users || []); 
      } 
      catch (e) {
        console.error('Error fetching leaderboard data:', e);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.filter-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]); 

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setShowDropdown(false);
  };

  return (
    <div className="leaderboard-page-container">
      <div className="leaderboard-content">
        <header className="header">
          <h1>Leaderboard</h1>
        </header>

        <section className="filter-section">
          <span className="filter-label-left">Ranking</span>
          <div className="filter-dropdown-container">
            <div 
              className="filter-dropdown"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {filter === "all" ? "All users" : "Following"} 
              <span className="dropdown-arrow">▼</span>
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                <div
                  className={`dropdown-item ${filter === "all" ? "active" : ""}`}
                  onClick={() => handleFilterChange("all")}
                >
                  All users
                </div>
                <div
                  className={`dropdown-item ${filter === "following" ? "active" : ""}`}
                  onClick={() => handleFilterChange("following")}
                >
                  Following
                </div>
              </div>
            )}
          </div>
          <span className="filter-label-right">Number of reviews written</span>
        </section>

        <main>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
          ) : leaderboardData.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No users found
            </div>
          ) : (
            <ol className="leaderboard-list">
              {leaderboardData.map((user) => (
                <LeaderboardItem
                  key={user.rank}
                  rank={user.rank}
                  username={user.username}
                  score={user.score}
                  profilePictureUrl={user.profilePictureUrl}
                  avatarColor={user.avatarColor}
                  isCurrentUser={user.isCurrentUser}
                  onClick={() => navigate(`/app/user/${encodeURIComponent(user.username.replace(/^@/, ""))}`)}
                />
              ))}
            </ol>
          )}
        </main>
      </div>
    </div>
  );
}
export default Leaderboard;