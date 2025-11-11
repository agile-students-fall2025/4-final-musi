import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SongItem from "../components/SongItem";
import { data } from 'react-router-dom';

function Search() {
  const [results, setResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


    useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:3001/api/search');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAllSongs(data);
        setResults(data);
        
      } catch (e) {
        console.error("Failed to fetch songs:", e);
        setError("Failed to load songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleSearch = (term) => {
    const filteredData = data.filter(item =>
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