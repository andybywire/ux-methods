import * as React from "react"
import { graphql, Link } from "gatsby"

const MethodPage = ({ data }) => {
  return (
    <div>
    <h2>{data.sanityMethod.title}</h2>
    <p>{data.sanityMethod.metaDescription}</p>
    <Link to='/'>Home</Link>
    </div>
  )
}

export const query = graphql`
  query($id: String!) {
    sanityMethod(id: { eq: $id }) {
      title
      metaDescription
    }
  }
`

export default MethodPage
// Example of setting up dynamic page creation with the File System Route API:
// https://dev.to/stu/gatsby-s-awesome-new-file-system-route-api-50k9
