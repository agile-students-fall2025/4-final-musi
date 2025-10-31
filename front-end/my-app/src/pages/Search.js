import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SongItem from "../components/SongItem";

const MOCK_SONGS = [
  {
    id: 1,
    title: "As It Was",
    artist: "Harry Styles",
    tags: ["Pop", "Indie Pop", "UK"],
    score: 8.2,
  },
  {
    id: 2,
    title: "Flowers",
    artist: "Miley Cyrus",
    tags: ["Pop", "Dance", "Contemporary"],
    score: 7.9,
  },
  {
    id: 3,
    title: "Kill Bill",
    artist: "SZA",
    tags: ["R&B", "Soul", "Alt R&B"],
    score: 8.7,
  },
  {
    id: 4,
    title: "About Damn Time",
    artist: "Lizzo",
    tags: ["Funk Pop", "Disco", "Soul"],
    score: 8.0,
  },
  {
    id: 5,
    title: "Blinding Lights",
    artist: "The Weeknd",
    tags: ["Synthpop", "Pop", "R&B"],
    score: 9.1,
  },
  {
    id: 6,
    title: "Levitating",
    artist: "Dua Lipa",
    tags: ["Disco Pop", "Dance", "Funk"],
    score: 8.4,
  },
  {
    id: 7,
    title: "Got to Be Real",
    artist: "Cheryl Lynn",
    tags: ["Disco", "R&B / Soul", "Funk"],
    score: 9.0,
  },
  {
    id: 8,
    title: "Superstition",
    artist: "Stevie Wonder",
    tags: ["Funk", "Soul", "Classic"],
    score: 9.5,
  },
  {
    id: 9,
    title: "Dreams",
    artist: "Fleetwood Mac",
    tags: ["Soft Rock", "Pop Rock", "Classic"],
    score: 9.2,
  },
  {
    id: 10,
    title: "Good as Hell",
    artist: "Lizzo",
    tags: ["Pop Soul", "Empowerment", "Funk"],
    score: 8.3,
  },
];

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