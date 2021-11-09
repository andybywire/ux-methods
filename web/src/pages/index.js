import * as React from 'react'
import { graphql, Link } from 'gatsby'

const IndexPage = ({ data }) => {
  return (
      <div>
      <h2>Methods</h2>
      <p>Published methods: {data.allSanityMethod.totalCount}</p>
      <ul>
        {data.allSanityMethod.edges.map(({ node }) => (
        <li key={node.id}>
        {/* replace() only for Gatsby File System Route api slug creation. Remove this link formatting once CamelCase file names are in place. */}
        <Link to={`method/${node.title.replace(/ /g, '-').toLowerCase()}`}>{node.title}</Link>
        </li>
        ))}
        <li key="ttl"><Link to="/turtlefunction">Turtle Function Test Page</Link></li>
      </ul>
      </div>
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
