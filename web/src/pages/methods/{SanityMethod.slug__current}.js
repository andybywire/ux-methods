import * as React from 'react'
import { graphql, Link } from 'gatsby'
import Method from '../../components/method'

const MethodPage = ({ data: { sanityMethod: data } }) => {
  return (
    <Method data={data} />
  )
}

export const query = graphql`
  query($id: String!) {
    sanityMethod(id: { eq: $id }) {
      title
      metaDescription
      overview: _rawOverview(resolveReferences: {maxDepth: 10})
      steps: _rawSteps(resolveReferences: {maxDepth: 10})
    }
  }
`

export default MethodPage
// Example of setting up dynamic page creation with the File System Route API:
// https://dev.to/stu/gatsby-s-awesome-new-file-system-route-api-50k9
