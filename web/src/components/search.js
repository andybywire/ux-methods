import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import { useFlexSearch } from 'react-use-flexsearch';
import { MdClose } from 'react-icons/md';
import * as s from './search.module.scss';

export default function Search() {

  useEffect(() => {
    const { search } = window.location;
    query = new URLSearchParams(search).get('search');
  });

  const data = useStaticQuery(graphql`
    query {
      localSearchPages {
        index
        store
      }
    }
  `);
  
  let query = '';

  if (window.location !== "undefined") { 
    const { search } = window.location;
    query = new URLSearchParams(search).get('search');
  } 

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
          <h2 className={s.resultsCount}>{results.length} {results.length === 1 ? `result` : `results`} found for <em>{searchQuery}</em></h2>
          <ul>
            {results.map(result =>
              <li>
                <h3><Link to={`/${result.type}/${result.slug}`}>{result.title}</ Link><span><em>{result.type}</em></span></h3>
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
        <section className={s.searchResults}>
          <p>Sorry, "{searchQuery}" returned no results.</p>
          <button type="reset" onClick={() => {
            setSearchQuery('');
            query && (window.location.href = '/');
          }}><MdClose /></button>
        </section>
      }
    </section>
  );
}
