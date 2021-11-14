import React from "react"
import { graphql, Link } from "gatsby"
import * as s from "./method.module.scss"
import Layout from '../components/layout'
import SanityImage from "gatsby-plugin-sanity-image"
import PortableText from "../components/portableText"
import Card from "../components/cards/card"
import CompactCard from "../components/cards/compactCard"

export default function MethodPage({data, data: { method }}) {

  // Get related methods for which the current method's outputs provide inputs
  // -> future need: sort by sharedTransput count
  const relatedMethods = data.allSharedTransputCsv.nodes.map(item => item.methodB);

  // Filter method cards to only those on the relatedMethods list
  // -> "define what you want to keep and then return true for those values"
  const sharedCards = data.cards.nodes.filter(card => relatedMethods.includes(card.uri.current));

  return (
    <Layout>
      <article>
        <section>
          <div className={s.hero}>
            <SanityImage {...method.heroImage} width={500} alt=""/>
            <p>Photo by <a href={method.heroImage._rawAsset.source.url}>{method.heroImage._rawAsset.creditLine.replace(" by "," via ")}</a></p>
          </div>
          <div>
            <h1>
              <span>{method.title}</span>
              <span>Method</span>
            </h1>
            <PortableText blocks={method.overview} />
          </div>
        </section>
        <section>
          {/*preparation - title + copy*/}
          <h2>Steps</h2>
          <PortableText blocks={method.steps} />
        </section>
        {/*
            section
              preparation - title + copy
              card grid
            section
              steps
              outcomes
            section
              resources - title
              card grid
              see more (can be added later)
            section
          */}
      </article>
      {relatedMethods.length !== 0 &&
      <section>
        <h2>Next Steps</h2>
        <Card content={sharedCards} />
      </section>
      }
    </Layout>
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
