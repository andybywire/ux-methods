import * as React from "react"
import { graphql } from "gatsby"

const MethodPage = ({ data }) => {
  return <div>{data.sanityMethod.title}</div>
}

export const query = graphql`
  query($id: String!) {
    sanityMethod(id: { eq: $id }) {
      title
    }
  }
`

export default MethodPage
// Example of setting up dynamic page creation with the File System Route API:
// https://dev.to/stu/gatsby-s-awesome-new-file-system-route-api-50k9
