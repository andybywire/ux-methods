import React from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../components/layout';
import Search from '../components/search';
import Card from "../components/cards/card"

const IndexPage = ({ data }) => {

  const topMethods = data.topMethods.nodes.map(method => method.label);
  const topMethodsCards = topMethods.map(topMethodLabel => {
    const card = data.methodCards.nodes.find(card =>
      card.title === topMethodLabel);
      return card});

  return (
      <Layout layoutClass='index'>
        <section className="headline">
          <h1>{data.site.tagline}</h1>
          <p className="display">{data.site.description}</p>
        </section>
        <Search />
        <section className="resource-cards">
          <h2>Top Methods</h2>
          <Card content={topMethodsCards} style="dark"/>

          <h2>Disciplines</h2>
          <ul>
            {data.discipline.nodes.map(discipline => (
            <li key={discipline.id}>
            <Link to={`discipline/${discipline.slug.current}`}>{discipline.title}</Link>
            </li>
            ))}
          </ul>
        </section>
      </Layout>
  );
}

export default IndexPage

export const query = graphql`
  query {
    topMethods: allMethodCentralityCsv(limit: 6) {
      nodes {
        label
        method
      }
    }
    methodCards: allSanityMethod {
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
    site: sanitySiteSettings {
      tagline
      description
    }
  }
`
