import React, { useState, useEffect } from 'react';
import './Followers.css';
import TabButton from '../components/TabButton';
import UserRow from '../components/UserRow';
import axios from 'axios';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';

function Followers() {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab =
    (location.state && location.state.initialTab) || 'followers';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [followers, setFollowers] = useState([]); 
  const [following, setFollowing] = useState([]); 

  useEffect(() => {
    if (!username) {
      return; 
    }
    const encodedUsername = encodeURIComponent(username);

    const API_URL = `http://localhost:3001/api/followers/${encodedUsername}`;

    axios.get(API_URL)
      .then(response => {
        setFollowers(response.data.followers);
        setFollowing(response.data.following);
      })
      .catch(error => {
        console.error("Error fetching followers and following:", error);
        setFollowers([]);
        setFollowing([]);
      });
  }, [username]);


  const handleUnfollow = (userId) => {
    setFollowing(currentFollowing => 
      currentFollowing.filter(user => user.id !== userId)
    );
  };

  const handleFollowBack = (userId) => {
    setFollowers(currentFollowers =>
      currentFollowers.map(user => 
        user.id === userId ? { ...user, mutual: true } : user
      )
    );
    
    const userToFollow = followers.find(user => user.id === userId);
    if (userToFollow && !following.some(f => f.id === userId)) {
      setFollowing(currentFollowing => [
        { id: userToFollow.id, name: userToFollow.name, username: userToFollow.username },
        ...currentFollowing
      ]);
    }
  };

  const filteredFollowers = followers.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(term) ||
      (user.username || '').toLowerCase().includes(term)
    );
  });

  const filteredFollowing = following.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(term) ||
      (user.username || '').toLowerCase().includes(term)
    );
  });

  const listToDisplay = activeTab === 'followers' ? filteredFollowers : filteredFollowing;
  
  return (
    <div className="followers-page">
      <header className="followers-header">
        <Link to="/app/profile" className="back-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
          </svg>
        </Link>
        <h1 className="header-title">
          {username ? username.replace('@', '') : 'Profile'}
        </h1>
      </header>

      <nav className="followers-nav">
        <TabButton
          title="Followers"
          count={followers.length}
          isActive={activeTab === 'followers'}
          onClick={() => setActiveTab('followers')}
        />
        <TabButton
          title="Following"
          count={following.length}
          isActive={activeTab === 'following'}
          onClick={() => setActiveTab('following')}
        />
      </nav>

      <div className="search-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder={`Search ${activeTab}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <main className="user-list-container">
        {listToDisplay.map(user => (
          <UserRow
            key={user.id}
            user={user}
            activeTab={activeTab}
            onUnfollow={() => handleUnfollow(user.id)}
            onFollowBack={() => handleFollowBack(user.id)}
            onClickUser={(u) =>
              navigate(`/app/user/${encodeURIComponent(u.username.replace('@', ''))}`)
            }
          />
        ))}
      </main>
    </div>
  );
}

export default Followers;