import React, { useState, useEffect } from 'react';
import './Followers.css';
import TabButton from '../components/TabButton';
import UserRow from '../components/UserRow';

function FollowersPage({ profile }) {
  const [activeTab, setActiveTab] = useState('followers');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [followers, setFollowers] = useState([]); 
  const [following, setFollowing] = useState([]); 

  useEffect(() => {
    const mockFollowersData = [
      { id: 'user1', name: 'David', username: '@dvd', mutual: true },
      { id: 'user2', name: 'Zuhair', username: '@zuhair', mutual: false },
      { id: 'user3', name: 'Julz', username: '@julz', mutual: true },
    ];
    
    const mockFollowingData = [
      { id: 'user4', name: 'Ian', username: '@ian' },
      { id: 'user5', name: 'Lana', username: '@lana' },
      { id: 'user6', name: 'Patrick', username: '@patrick' },
      { id: 'user7', name: 'Tobey', username: '@tobey' },
      { id: 'user8', name: 'Liam', username: '@liam' },
      { id: 'user1', name: 'David', username: '@david' },
    ];

    setTimeout(() => {
      setFollowers(mockFollowersData);
      setFollowing(mockFollowingData);
    }, 500); 
  }, []); 

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

  const filteredFollowers = followers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowing = following.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const listToDisplay = activeTab === 'followers' ? filteredFollowers : filteredFollowing;
  
  return (
    <div className="followers-page">
      <header className="followers-header">
        <a href="/app/profile" className="back-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
          </svg>
        </a>
        <h1 className="header-title">
          {profile?.username ? profile.username.replace('@', '') : 'Profile'}
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
          />
        ))}
      </main>
    </div>
  );
}

export default FollowersPage;