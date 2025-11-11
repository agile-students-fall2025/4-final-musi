import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SongItem from "../components/SongItem";

function Search() {
  const [results, setResults] = useState([]);

  const handleSearch = (term) => {
    const filteredData = MOCK_SONGS.filter(item =>
      item.title.toLowerCase().includes(term.toLowerCase())
    );
    setResults(filteredData);
  };

  return (
    <div>
      <h2>Musi</h2>
      <SearchBar onSearch={handleSearch} placeholder="Search a song, album, or user" />
      <div>
        {results.map((song, index) => (
            <SongItem
              title={song.title}
              subtitle={`Song • ${song.artist}`}
              meta={song.tags.join(", ")}
              score={song.score}
            />
        ))}
      </div>
    </div>
  );
}

export default Search;