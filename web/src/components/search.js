import React from 'react';

export default function Search({ searchQuery, setSearchQuery }) {
  return (
    <form action="/" method="get" autoComplete="off">
      <label htmlFor="search-box">Search for a method by name, goal, or outcome.</label>
      <input
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.target.value)}
          type="text"
          id="search-box"
          placeholder="E.g. Card Sorting"
          name="s"
      />
      <button type="submit">Search</button>
    </form>
  );
}

// https://www.emgoto.com/react-search-bar/
// https://www.emgoto.com/gatsby-search/
