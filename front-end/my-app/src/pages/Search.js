import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import SongItem from "../components/SongItem";
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

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setResults([]);
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:3001/api/search', {
        params: { q: term }
      });
      setResults(response.data || []);
    } catch (e) {
      console.error('Error searching songs:', e);
      setResults([]);
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
        {results.map((item) => (
          <SongItem
            key={item.id}
            title={item.title}
            subtitle={`${item.musicType || 'Song'} • ${item.artist}`}
            meta={(item.tags || []).join(", ")}
            score={item.score}
          />
        ))}
      </ResultsContainer>
    </Container>
  );
}

export default Search;