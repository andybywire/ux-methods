import React, { useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { useFlexSearch } from 'react-use-flexsearch';
import { MdClose } from 'react-icons/md';
import * as s from './search.module.scss';

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
    <section id="site-search" className={[s.search, "search"].join(' ')}>
      <form action="/" method="get" autoComplete="off">
        <input
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.target.value)}
            type="text"
            id="search-box"
            placeholder="E.g. Card Sorting"
            name="search"
        />
        <label htmlFor="search-box">Search for a method by name, goal, or outcome.</label>
        <button type="submit">Search</button>
      </form>
      {results.length > 0 &&
        <section className={s.searchResults}>
          <h2 className={s.resultsCount}>{results.length} results found for "{searchQuery}"</h2>
          <ul>
            {results.map(result =>
              <li>
                <h3>{result.title} | {result.type}</h3>
                <span>{result.excerpt}</span>
              </li>
            )}
          </ul>
          <button type="reset" onClick={() => {
            setSearchQuery('');
            query && (window.location.href = '/');
          }}><MdClose /></button>
        </section>
      }
      {results.length === 0 && window.location.search &&
        <p>Sorry, "{searchQuery}" returned no results.</p>
      }


      {/*{JSON.stringify(results, null, 2)}*/}

    </section>
  );
}

// https://www.emgoto.com/react-search-bar/
//  --> revisit to integrate A11y unit tests.
// https://www.emgoto.com/gatsby-search/
// https://github.com/angeloashmore/gatsby-plugin-local-search
// https://github.com/angeloashmore/react-use-flexsearch
