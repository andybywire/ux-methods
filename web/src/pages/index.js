import * as React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'

const IndexPage = ({ data }) => {
  return (
      <Layout>
        <p>Published methods: {data.allSanityMethod.totalCount}</p>
        <ul>
          {data.allSanityMethod.edges.map(({ node }) => (
          <li key={node.id}>
          <Link to={`method/${node.slug.current}`}>{node.title}</Link>
          </li>
          ))}
        </ul>
      </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query {
    allSanityMethod (sort: {fields: title}) {
      edges {
        node {
          title
          slug {
            current
          }
          id
          metaDescription
        }
      }
      totalCount
    }
  }
`
