import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNavBar from "./components/BottomNavBar";
import Feed from "./pages/Feed";
import Lists from "./pages/Lists";  // Changed from YourLists
import Search from "./pages/Search";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import User from "./pages/User";
import Music from "./pages/Music";
import { useState } from 'react';
import Followers from "./pages/Followers";

function App() {
  const [selectedMusic, setSelectedMusic] = useState(null);

  return (
    <div className="App">
      <div style={{ paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/app/feed" replace />} />
          <Route path="/feed" element={<Feed setSelectedMusic={setSelectedMusic} />} />
          <Route path="/lists" element={<Lists setSelectedMusic={setSelectedMusic} />} />  {/* Changed route */}
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user" element={<User />} />
          <Route path="/music" element={
            <Music {...selectedMusic} isRated={false} />
          } />
        </Routes>
      </div>
      <BottomNavBar />
    </div>
  );
}

export default App;
