import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import CompactCard from '../components/cards/compactCard';

const AllMethods = ({ data }) => {

  return (
      <Layout>
        <section className='resource-cards'>
          <h2>UX Methods A-Z</h2>
          <CompactCard content={data.methodCards.nodes} />
        </section>
      </Layout>
  );
}

export default AllMethods

export const query = graphql`
  query {
    methodCards: allSanityMethod(sort: {fields: title, order: ASC}) {
      nodes {
        title
        metaDescription
        uri {
          current
        }
        slug {
          current
        }
        _type
        heroImage {
          ...ImageWithPreview
          _rawAsset(resolveReferences: {maxDepth: 10})
        }
      }
    }
  }
`
