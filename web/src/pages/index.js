import * as React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'

const IndexPage = ({ data }) => {
  return (
      <Layout>
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
