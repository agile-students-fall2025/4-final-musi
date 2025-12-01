import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { theme } from '../theme';

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
  const [query, setQuery] = useState('');
  const [type, setType] = useState('track');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const url = `/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`;
    console.log(url);    

    try {
      const response = await fetch(url);

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error('spotify API Call Error with url:', url);
    }
  };

  return (
    <Container>
      <Header>
        <LogoContainer>
          <Logo src="/assets/images/logo.png" alt="musi logo" />
        </LogoContainer>
        <form onSubmit={handleSearch}>
          <h2>Search Spotify</h2>
          
          <SearchContainer>
            <SearchWrapper>
              <SearchIcon>
                <FiSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Bohemian Rhapsody"
                required
              />
            </SearchWrapper>
          </SearchContainer>
          
          <SearchContainer>
            Search Type (type):
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="artist">Artist</option>
              <option value="track">Track</option>
              <option value="album">Album</option>
            </select>
          </SearchContainer>
          
          <button type="submit">Search</button>
        </form>
      </Header>    

      <ResultsContainer>
        {JSON.stringify(results, null, 2)}
      </ResultsContainer>

    </Container>
  );
}

export default Search;