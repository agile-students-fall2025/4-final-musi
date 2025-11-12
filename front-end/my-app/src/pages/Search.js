import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import SongItem from "../components/SongItem";

function Search() {
  const [results, setResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);


    useEffect(() => {
    const fetchSongs = async () => {
      try {
        
        const response = await fetch('http://localhost:3001/api/search');
        
        const data = await response.json();
        setAllSongs(data);
        setResults(data);
        
      } 
      catch (e){}
    };

    fetchSongs();
  }, []);

  const handleSearch = (term) => {
    if (term.trim() === '') {
      setResults(allSongs);
      return;
    }
    
    const lowerCaseTerm = term.toLowerCase();
    const filteredData = allSongs.filter(item =>
      item.title.toLowerCase().includes(lowerCaseTerm) ||
      item.artist.toLowerCase().includes(lowerCaseTerm)
    );
    setResults(filteredData);
  };

  return (
    <div>
      <h2>Musi</h2>
      <SearchBar onSearch={handleSearch} placeholder="Search a song, album, or user" />
      <div>
        {results.map((song) => (
            <SongItem
              key={song.id}
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