import React from "react"
import { graphql } from "gatsby"
import * as s from "./method.module.scss"
import Layout from '../components/layout'
import SanityImage from "gatsby-plugin-sanity-image"
import PortableText from "../components/portableText"
import Card from "../components/cards/card"
import CompactCard from "../components/cards/compactCard"
import ResourceCard from "../components/cards/resourceCard"

export default function MethodPage({data, data: { method }}) {

  // Consider moving these transformation methods into gatsby-node.js

  // Get methods which provide input for the current method
  const inputMethods = data.input.nodes.map(item => item.methodA);

  // Filter method cards to only those on the inputMethods list
  // -> "define what you want to keep and then return true for those values"
  const inputCards = data.cards.nodes.filter(card => inputMethods.includes(card.uri.current));

  // Get related methods for which the current method's outputs provide inputs
  // -> future need: sort by sharedTransput count
  const relatedMethods = data.allSharedTransputCsv.nodes.map(item => item.methodB);

  // Filter method cards to only those on the relatedMethods list
  const sharedCards = data.cards.nodes.filter(card => relatedMethods.includes(card.uri.current));

  return (
    <Layout>
      <article>
        <section className={s.overview}>
          <div className={s.hero}>
            <SanityImage {...method.heroImage} width={500} alt=""/>
            <p>Photo by <a href={method.heroImage._rawAsset.source.url}>{method.heroImage._rawAsset.creditLine.replace(" by "," via ")}</a></p>
          </div>
          <div className={s.header}>
            <h1>
              <span>{method.title}</span>
              <span>Method</span>
            </h1>
          </div>
          <div className={s.description}>
            <PortableText blocks={method.overview} />
          </div>
        </section>
        {inputCards.length !== 0 &&
        <section>
          <h2>Preparation</h2>
          <p>Card Sorting is often more effective when it is informed by these complementary methods.</p>
          <CompactCard content={inputCards} />
        </section>
        }
        <section className={s.details}>
          <div className={s.steps}>
            <h2>Steps</h2>
            <PortableText blocks={method.steps} />
          </div>
          <div className={s.outcomes}>
            <h2>Outcomes</h2>
            <p>Card Sorting typically produces insight and solutions focused on these areas:</p>
            <ul>
            {data.method.transputReference.outputReference.map(output => (
              <li>
                <h3>{output.prefLabel}</h3>
                <p>{output.definition}</p>
              </li>
            ))}
            </ul>
          </div>
        </section>
        {data.resources.nodes.length !== 0 &&
        <section>
          <h2>{method.title} Resources</h2>
          <ResourceCard content={data.resources.nodes} />
        </section>
      }
      </article>
      {relatedMethods.length !== 0 &&
      <section className="resource-cards">
        <h2>Next Steps</h2>
        <Card content={sharedCards} />
      </section>
      }
    </Layout>
  )
}

export const query = graphql`
query($slug: String!, $uri: String!) {
  method: sanityMethod (slug: {current: { eq: $slug }}) {
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
    transputReference {
      outputReference {
        id
        prefLabel
        definition
      }
    }
  }
  allSharedTransputCsv (filter: {methodA: {eq: $uri}}) {
    nodes {
      methodA
      id
      sharedTransput
      methodB
    }
  }
  input: allSharedTransputCsv (filter: {methodB: {eq: $uri}}) {
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
  resources: allSanityResource(filter: {methodDescribed: {elemMatch: {slug: {current: {eq: $slug}}}}}) {
    nodes {
      title
      resourceUrl
      publisher {
        pubName
      }
      author
      resourceImage {
        ...ImageWithPreview
        _rawAsset(resolveReferences: {maxDepth: 10})
      }
    }
  }
}
`;
