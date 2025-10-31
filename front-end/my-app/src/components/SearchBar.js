import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { theme } from '../theme';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form 
      className="search-bar-container" 
      onSubmit={handleSubmit}
      style={{
        backgroundColor: theme.colors.background_secondary
      }}
    >
      <div className="search-input-wrapper">
        <Search 
          className="search-icon" 
          size={20} 
          style={{
            color: theme.colors.text_secondary
          }}
        />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          style={{
            color: theme.colors.text_secondary
          }}
        />
      </div>
      {searchTerm && (
        <button 
          type="button" 
          className="clear-button" 
          onClick={handleClear}
          style={{
            color: theme.colors.text_secondary
          }}
        >
          <X size={18} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;