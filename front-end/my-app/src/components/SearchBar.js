import React, { useState } from 'react';
import { HiOutlineSearch, HiArrowTrendingUp, HiUsers, HiOutlineClock } from 'react-icons/hi2';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-full max-w-md p-4 bg-white">
      
      {/* Search Input Field */}
      <div className="relative flex items-center w-full">
        <HiOutlineSearch className="absolute left-3.5 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search a song, album or playlist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center justify-between space-x-2 mt-4">
        <button className="flex flex-1 items-center justify-center bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
          <HiArrowTrendingUp className="w-5 h-5 mr-1.5" />
          Trending
        </button>
        <button className="flex flex-1 items-center justify-center bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
          <HiUsers className="w-5 h-5 mr-1.5" />
          Friend recs
        </button>
        <button className="flex flex-1 items-center justify-center bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
          <HiOutlineClock className="w-5 h-5 mr-1.5" />
          New releases
        </button>
      </div>
    </div>
  );
};

export default SearchBar;