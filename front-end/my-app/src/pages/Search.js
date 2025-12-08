import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { X } from 'lucide-react';
import SongItem from "../components/SongItem";
import UserRow from "../components/UserRow";
import { theme } from '../theme';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Container = styled.div`
  background: ${theme.colors.background};
  min-height: 100vh;
  padding: 32px 16px 100px 16px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
`;

const Logo = styled.img`
  height: 50px;
  padding-left: 10px;
  width: auto;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.background_secondary};
  border-radius: 16px;
  padding: 16px;
`;

const SearchIcon = styled.div`
  color: ${theme.colors.text_secondary};
  margin-right: 12px;
  font-size: 1.2rem;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${theme.colors.text};
  font-size: 1.1rem;
  font-weight: 500;
  
  &::placeholder {
    color: ${theme.colors.text_secondary};
  }
`;

const ResultsContainer = styled.div`
  margin-top: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${theme.colors.text_secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 16px 0 8px;
  text-align: left;
`;

const RecentSearchesContainer = styled.div`
  margin-top: 16px;
`;

const RecentSearchItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${theme.colors.outline};
  }
`;

const RecentSearchImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e9e9ec;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const RecentSearchContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
`;

const RecentSearchText = styled.div`
  font-size: 1rem;
  color: ${theme.colors.text};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
`;

const RecentSearchTitle = styled.span`
  font-weight: 600;
  text-align: left;
`;

const RecentSearchSubtitle = styled.span`
  font-size: 0.85rem;
  color: ${theme.colors.text_secondary};
  text-align: left;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text_secondary};
  transition: color 0.2s;

  &:hover {
    color: ${theme.colors.text};
  }
`;

const SkeletonItem = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  padding: 24px 0;
  border-bottom: 1px solid ${theme.colors.outline};
  align-items: center;
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const SkeletonImage = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkeletonLine = styled.div`
  height: 16px;
  border-radius: 4px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
  
  &:first-child {
    width: 60%;
  }
  
  &:last-child {
    width: 40%;
  }
`;

const SkeletonUserRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${theme.colors.outline};
  gap: 12px;
`;

const SkeletonAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonUserContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SkeletonUserLine = styled.div`
  height: 14px;
  border-radius: 4px;
  background: ${theme.colors.background_secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
  
  &:first-child {
    width: 50%;
  }
  
  &:last-child {
    width: 30%;
  }
`;

const RECENT_SEARCHES_KEY = 'musi_recent_searches';
const MAX_RECENT_SEARCHES = 10;

function Search() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [results, setResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [toast, setToast] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out old string format and ensure valid objects
        const validSearches = parsed.filter((item) => 
          typeof item === 'object' && 
          item !== null && 
          item.type && 
          (item.type === 'user' ? item.username : (item.title && item.artist))
        );
        if (validSearches.length > 0) {
          setRecentSearches(validSearches);
        } else if (parsed.length > 0) {
          // Clear invalid data
          localStorage.removeItem(RECENT_SEARCHES_KEY);
        }
      } catch (e) {
        console.error('Error parsing recent searches:', e);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      }
    }
  }, []);

  // Perform search on mount if search term exists in state
  useEffect(() => {
    const searchTermFromState = location.state?.searchTerm;
    if (searchTermFromState && searchTermFromState.trim() !== '') {
      // Perform search immediately
      handleSearch(searchTermFromState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore search term and perform search if coming from back navigation (state changes)
  useEffect(() => {
    const searchTermFromState = location.state?.searchTerm;
    if (searchTermFromState && searchTermFromState !== searchTerm && searchTermFromState.trim() !== '') {
      // Set search term and trigger search
      setSearchTerm(searchTermFromState);
      handleSearch(searchTermFromState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.searchTerm]);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } else {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, [recentSearches]);

  const addToRecentSearches = (item) => {
    if (!item) return;

    setRecentSearches((prev) => {
      // Create a unique key for the item
      const itemKey = item.type === 'user' 
        ? `user-${item.username}` 
        : `${item.type}-${item.artist}-${item.title}`;
      
      // Remove if already exists (using key)
      const filtered = prev.filter((s) => {
        const sKey = s.type === 'user' 
          ? `user-${s.username}` 
          : `${s.type}-${s.artist}-${s.title}`;
        return sKey !== itemKey;
      });
      
      // Add to beginning with timestamp
      const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      return updated;
    });
  };

  const removeFromRecentSearches = (item, e) => {
    e?.stopPropagation();
    setRecentSearches((prev) => {
      const itemKey = item.type === 'user' 
        ? `user-${item.username}` 
        : `${item.type}-${item.artist}-${item.title}`;
      return prev.filter((s) => {
        const sKey = s.type === 'user' 
          ? `user-${s.username}` 
          : `${s.type}-${s.artist}-${s.title}`;
        return sKey !== itemKey;
      });
    });
  };

  const handleRecentSearchClick = (item) => {
    if (item.type === 'user') {
      navigate(`/app/user/${encodeURIComponent(item.username)}`);
    } else {
      navigate(
        `/app/music/${encodeURIComponent(item.type)}/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`
      );
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setResults([]);
      setUserResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setResults([]);
    setUserResults([]);
    
    try {
      const [musicRes, userRes] = await Promise.all([
        axios.get('http://localhost:3001/api/search', {
          params: { q: term }
        }),
        axios.get('http://localhost:3001/api/search/users', {
        params: { q: term }
        })
      ]);
      const musicItems = musicRes.data || [];
      setResults(musicItems);
      setBookmarkedIds(
        musicItems.filter((m) => m.bookmarked).map((m) => m.id)
      );
      setUserResults(userRes.data || []);
    } catch (e) {
      console.error('Error searching:', e);
      setResults([]);
      setUserResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserFollowToggle = async (targetUser) => {
    try {
      if (targetUser.isFollowing) {
        await axios.post(`http://localhost:3001/api/users/${targetUser.id}/unfollow`);
        setUserResults((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, isFollowing: false } : u
          )
        );
      } else {
        await axios.post(`http://localhost:3001/api/users/${targetUser.id}/follow`);
        setUserResults((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, isFollowing: true } : u
          )
        );
      }
    } catch (e) {
      console.error('Error updating follow status:', e);
    }
  };

  return (
    <Container>
      <Header>
        <LogoContainer>
          <Logo src="/assets/images/logo.png" alt="musi logo" />
        </LogoContainer>
        
        <SearchContainer>
          <SearchWrapper>
            <SearchIcon>
              <FiSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search a song, album or user..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </SearchWrapper>
        </SearchContainer>
      </Header>

      <ResultsContainer>
        {searchTerm.trim() === '' && !loading && results.length === 0 && userResults.length === 0 && recentSearches.length > 0 && (
          <RecentSearchesContainer>
            <SectionTitle>Recent Searches</SectionTitle>
            {recentSearches.map((item, index) => (
              <RecentSearchItem
                key={index}
                onClick={() => handleRecentSearchClick(item)}
              >
                <RecentSearchImage
                  style={{
                    backgroundImage: item.imageUrl || item.profilePictureUrl 
                      ? `url(${item.imageUrl || item.profilePictureUrl})` 
                      : undefined
                  }}
                />
                <RecentSearchContent>
                  <RecentSearchText>
                    <RecentSearchTitle>
                      {item.type === 'user' ? item.name || item.username : item.title}
                    </RecentSearchTitle>
                    {item.type !== 'user' && (
                      <RecentSearchSubtitle>
                        {item.type} • {item.artist}
                      </RecentSearchSubtitle>
                    )}
                  </RecentSearchText>
                  <RemoveButton
                    onClick={(e) => removeFromRecentSearches(item, e)}
                    aria-label="Remove search"
                  >
                    <X size={18} />
                  </RemoveButton>
                </RecentSearchContent>
              </RecentSearchItem>
            ))}
          </RecentSearchesContainer>
        )}

        {loading && (
          <>
            <SectionTitle>Users</SectionTitle>
            {[...Array(3)].map((_, index) => (
              <SkeletonUserRow key={`user-skeleton-${index}`}>
                <SkeletonAvatar />
                <SkeletonUserContent>
                  <SkeletonUserLine />
                  <SkeletonUserLine />
                </SkeletonUserContent>
              </SkeletonUserRow>
            ))}
            <SectionTitle>Music</SectionTitle>
            {[...Array(5)].map((_, index) => (
              <SkeletonItem key={`music-skeleton-${index}`}>
                <SkeletonImage />
                <SkeletonContent>
                  <SkeletonLine />
                  <SkeletonLine />
                </SkeletonContent>
              </SkeletonItem>
            ))}
          </>
        )}

        {!loading && userResults.length > 0 && (
          <>
            <SectionTitle>Users</SectionTitle>
            {userResults.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                context="search"
                onUnfollow={() => handleUserFollowToggle(user)}
                onFollowBack={() => handleUserFollowToggle(user)}
                onClickUser={(u) => {
                  // Add to recent searches when clicked
                  addToRecentSearches({
                    type: 'user',
                    username: u.username,
                    name: u.name || u.username,
                    profilePictureUrl: u.profilePictureUrl || '',
                  });
                  navigate(`/app/user/${encodeURIComponent(u.username)}`);
                }}
              />
            ))}
          </>
        )}

        {!loading && results.length > 0 && (
          <SectionTitle>Music</SectionTitle>
        )}
        {!loading && results.map((item) => {
          // Format subtitle: "Song • Artist" or "Album • Artist"
          const musicType = item.musicType === 'Album' ? 'Album' : 'Song';
          const subtitle = `${musicType} • ${item.artist}`;
          
          return (
          <SongItem
            key={item.id}
            title={item.title}
            subtitle={subtitle}
            meta={null}
            score={item.score}
            showScore={false}
            showBookmark={true}
            bookmarked={bookmarkedIds.includes(item.id)}
            imageUrl={item.imageUrl}
            onClick={() => {
              // Add to recent searches when clicked
              addToRecentSearches({
                type: item.musicType || 'Song',
                title: item.title,
                artist: item.artist,
                imageUrl: item.imageUrl,
              });
              navigate(
                `/app/music/${encodeURIComponent(item.musicType || 'Song')}/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`,
                {
                  state: {
                    fromSearch: true,
                    searchTerm: searchTerm,
                  }
                }
              );
            }}
            onBookmarkClick={async () => {
              try {
                await axios.post('http://localhost:3001/api/want', {
                  spotifyId: item.id,
                  title: item.title,
                  artist: item.artist,
                  musicType: item.musicType || 'Song',
                  imageUrl: item.imageUrl,
                });
                setBookmarkedIds((prev) =>
                  prev.includes(item.id) ? prev : [...prev, item.id]
                );
                setToast(`${item.title} added to Want to listen`);
                setTimeout(() => setToast(''), 2500);
              } catch (e) {
                console.error('Failed to add to want list:', e);
                alert('Failed to add to Want to listen');
              }
            }}
          />
          );
        })}
      </ResultsContainer>
      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "80px",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "999px",
            fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 2000,
          }}
        >
          {toast}
        </div>
      )}
    </Container>
  );
}

export default Search;