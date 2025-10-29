import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNavBar from "./components/BottomNavBar";
import Feed from "./pages/Feed";
import Lists from "./pages/Lists";  // Changed from YourLists
import Search from "./pages/Search";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

function App() {
  return (
    <div className="App">
      <div style={{ paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/app/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/lists" element={<Lists />} />  {/* Changed route */}
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <BottomNavBar />
    </div>
  );
}

export default App;
