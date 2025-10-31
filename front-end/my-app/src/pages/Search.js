import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

const tempData = [
  { name: "Paint it, Black"},
  { name: "Espresso"},
  { name: "I am"},
  { name: "Jane Doe"},
  { name: "Kick Back"},
  { name: "Don't Fear the Reaper"},
  { name: "After Like"},
  { name: "Roundabout"},
  { name: "Dice"},
  { name: "Tora Moyo"},
  { name: "Cry for Me"},
  { name: "Famous"},
  { name: "Bachelor Girl"},
  { name: "The Chain"},
];

function Search() {
  const [results, setResults] = useState([]);

  const handleSearch = (term) => {
    console.log('Searching for:', term);

    const filteredData = tempData.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    setResults(filteredData);
  };

  return (
    <div>
      <h2>My Content</h2>
      <SearchBar onSearch={handleSearch} placeholder="Search a song, album, or user" />
      <ul>
        {results.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Search;