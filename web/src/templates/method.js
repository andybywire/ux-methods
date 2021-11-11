import React from "react"
import { graphql } from "gatsby"
import Method from '../components/method'

export default function MethodPage({data, data: { method }}) {
  return (
    <div>
      <Method
        method={method}
        transput={data.allSharedTransputCsv}
        cards={data.cards}
      />
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </div>
  )
}

export const query = graphql`
query($slug: String!, $uri: String!) {
  method: sanityMethod (slug: {current: { eq: $slug }})
  {
    title
    slug {
      current
    }
    uri {
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
  allSharedTransputCsv (filter: {methodA: {eq: $uri}})
  {
    nodes {
      methodA
      id
      sharedTransput
      methodB
    }
  }
  cards: allSanityMethod {
    nodes {
      title
      metaDescription
      uri {
        current
      }
      heroImage {
        ...ImageWithPreview
        _rawAsset(resolveReferences: {maxDepth: 10})
      }
    }
  }
}
`;
