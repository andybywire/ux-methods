import * as React from 'react'
import { graphql, Link } from 'gatsby'
import Method from '../../components/method'

const MethodPage = ({data}) => {
  return (
    <Method data={data} />
  )
}

export const query = graphql`
  query($id: String!) {
    sanityMethod(id: { eq: $id }) {
      title
      slug {
        current
      }
      metaDescription
      overview: _rawOverview(resolveReferences: {maxDepth: 10})
      steps: _rawSteps(resolveReferences: {maxDepth: 10})
      heroImage {
        ...ImageWithPreview
        _rawAsset(resolveReferences: {maxDepth: 10})
      }
    }
    allSharedTransputCsv {
      nodes {
        methodA
        id
        sharedTransput
        methodB
      }
    }
    cards: allSanityMethod {
      edges {
        node {
          title
          metaDescription
        }
      }
    }
  }
`

export default MethodPage
// Example of setting up dynamic page creation with the File System Route API:
// https://dev.to/stu/gatsby-s-awesome-new-file-system-route-api-50k9

// To get "related" cards from data.world data, consider using $id:, which is
// the slug for the current method, and structuring the data from d.w such that
// the slug can be used to select the correct elements. This might be challenging
// given that this will come back as tabular, not nexted data (i.e. there won't
// be an array for me to grab).
// see: https://stackoverflow.com/questions/65310879/how-to-create-dynamic-components
// Can I do this with a fragment?
// Otherwise, I could alias all methods to relatedMethodCard:, then use a loop to sort
// and filter to only those that apply for a given method resource.
// cf. https://graphql.org/learn/queries/
