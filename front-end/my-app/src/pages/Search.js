import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import SongItem from "../components/SongItem";
import UserRow from "../components/UserRow";
import { theme } from '../theme';
import { useNavigate } from 'react-router-dom';
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

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setResults([]);
      setUserResults([]);
      return;
    }
    
    try {
      const [musicRes, userRes] = await Promise.all([
        axios.get('http://localhost:3001/api/search', {
          params: { q: term }
        }),
        axios.get('http://localhost:3001/api/search/users', {
        params: { q: term }
        })
      ]);
      setResults(musicRes.data || []);
      setUserResults(userRes.data || []);
    } catch (e) {
      console.error('Error searching:', e);
      setResults([]);
      setUserResults([]);
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
        {userResults.length > 0 && (
          <>
            <SectionTitle>Users</SectionTitle>
            {userResults.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                activeTab="followers"
                onUnfollow={() => {}}
                onFollowBack={() => {}}
                onClickUser={(u) =>
                  navigate(`/app/user/${encodeURIComponent(u.username)}`)
                }
              />
            ))}
          </>
        )}

        {results.length > 0 && (
          <SectionTitle>Music</SectionTitle>
        )}
        {results.map((item) => (
          <SongItem
            key={item.id}
            title={item.title}
            subtitle={`${item.musicType || 'Song'} • ${item.artist}`}
            meta={(item.tags || []).join(", ")}
            score={item.score}
            onClick={() =>
              navigate(
                `/app/music/${encodeURIComponent(item.musicType || 'Song')}/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`
              )
            }
          />
        ))}
      </ResultsContainer>
    </Container>
  );
}

export default Search;