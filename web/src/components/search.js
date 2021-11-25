import React, { useState } from 'react';
import { useStaticQuery, graphql } from "gatsby";
import { useFlexSearch } from 'react-use-flexsearch';

export default function Search() {
  const data = useStaticQuery(graphql`
    query {
      localSearchPages {
        index
        store
      }
    }
  `);
  const { search } = window.location;
  const query = new URLSearchParams(search).get('search');
  const [searchQuery, setSearchQuery] = useState(query || '');
  const results = useFlexSearch(searchQuery, data.localSearchPages.index, data.localSearchPages.store);

  return (
    <section className="search">
      <form action="/" method="get" autoComplete="off">
        <label htmlFor="search-box">Search for a method by name, goal, or outcome.</label>
        <input
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.target.value)}
            type="text"
            id="search-box"
            placeholder="E.g. Card Sorting"
            name="search"
        />
        <button type="submit">Search</button>
      </form>
      {JSON.stringify(results, null, 2)}
    </section>
  );
}

// https://www.emgoto.com/react-search-bar/
//  --> revisit to integrate A11y unit tests.
// https://www.emgoto.com/gatsby-search/
// https://github.com/angeloashmore/gatsby-plugin-local-search
// https://github.com/angeloashmore/react-use-flexsearch
