import React, { useState } from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../components/layout';
import Search from '../components/search';
import { useFlexSearch } from 'react-use-flexsearch';


const IndexPage = ({ data, data: {localSearchPages: {index, store}} }) => {

  const { search } = window.location;
  const query = new URLSearchParams(search).get('search');
  const [searchQuery, setSearchQuery] = useState(query || '');

  const results = useFlexSearch(searchQuery, index, store);

  return (
      <Layout>
        <Search
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        {JSON.stringify(results, null, 2)}

        <h2>Methods</h2>
        <p>Published methods: {data.methods.totalCount}</p>
        <ul>
          {data.methods.nodes.map(method => (
          <li key={method.id}>
          <Link to={`method/${method.slug.current}`}>{method.title}</Link>
          </li>
          ))}
        </ul>
        <h2>Disciplines</h2>
        <ul>
          {data.discipline.nodes.map(discipline => (
          <li key={discipline.id}>
          <Link to={`discipline/${discipline.slug.current}`}>{discipline.title}</Link>
          </li>
          ))}
        </ul>
      </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query {
    localSearchPages {
      index
      store
    }
    methods: allSanityMethod (sort: {fields: title}) {
      nodes {
        title
        slug {
          current
        }
        id
        metaDescription
      }
      totalCount
    }
    discipline: allSanityDiscipline (sort: {fields: title}) {
      nodes {
        title
        slug {
          current
        }
        id
      }
    }
  }
`
