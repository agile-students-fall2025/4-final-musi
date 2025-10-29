import React, { useState } from "react";
import Leaderboard from "../components/Leaderboard";

function LeaderboardPage() {
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

            <BottomNavBar />
        </div>
    );
}

export default LeaderboardPage;