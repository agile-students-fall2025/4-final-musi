import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNavBar from "./components/BottomNavBar";
import Feed from "./pages/Feed";
import Lists from "./pages/Lists";  // Changed from YourLists
import Search from "./pages/Search";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import User from "./pages/User";
import Music from "./pages/Music";
import FeaturedList from './pages/FeaturedList';
import Followers from "./pages/Followers";
import Settings from "./pages/Settings";
import UpdateEmail from "./pages/UpdateEmail";
import UpdatePassword from "./pages/UpdatePassword";

function App() {
  const location = useLocation();

  const hideNavPaths = [
    "/app/settings",         // Settings page
    "/app/settings/email",   // Update email page
    "/app/music",
  ];

  const shouldHideNav = hideNavPaths.some((path) =>
    location.pathname.startsWith(path)
  );


  return (
    <div className="App">
      <div style={{ paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/app/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/lists" element={<Lists />} /> 
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/featuredlist/:title" element={<FeaturedList />} />
          <Route path="/user/:username" element={<User />} />
          <Route path="/music/:musicType/:artist/:title" 
            element={<Music />} 
          />
          <Route path="/followers/:username" element={<Followers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/email" element={<UpdateEmail />} />
          <Route path="/settings/password" element={<UpdatePassword />} />
        </Routes>
      </div>
      {!shouldHideNav && <BottomNavBar />}
    </div>
  );
}

export default App;
