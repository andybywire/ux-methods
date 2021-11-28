import React from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../components/layout';
import Search from '../components/search';
import Card from "../components/cards/card";
import CompactCard from "../components/cards/compactCard";

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
          <h2>Top UX Methods</h2>
          <div className="full-card">
            <Card content={topMethodsCards} style="dark"/>
          </div>
          <div className="compact-card">
            <CompactCard content={topMethodsCards} style="dark"/>
          </div>
          <h2>UX Disciplines</h2>
          <CompactCard content={data.disciplines.nodes} style="dark"/>
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
        _type
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
    disciplines: allSanityDiscipline (sort: {fields: title}) {
      nodes {
        title
        slug {
          current
        }
        _type
        metaDescription
        id
        heroImage {
          ...ImageWithPreview
          _rawAsset(resolveReferences: {maxDepth: 10})
        }
      }
    }
    site: sanitySiteSettings {
      tagline
      description
    }
  }
`
