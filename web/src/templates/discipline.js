import React from 'react';
import { graphql } from 'gatsby';
import * as s from './method.module.scss';
import SanityImage from 'gatsby-plugin-sanity-image';
import PortableText from '../components/portableText';
import Layout from '../components/layout';
import Card from '../components/cards/card';

export default function DisciplinePage({data: { discipline }, data: { methods }}) {

  return (
    <Layout>
      <article className={s.discipline}>
        <section className={[s.overview, s.discipline].join(' ')}>
          <div className={s.hero}>
            <SanityImage {...discipline.heroImage} width={500} alt=''/>
          </div>
          <div className={s.disciplineSummary}>
            <div className={s.header}>
              <h1>
                <span>{discipline.title}</span>
                <span>Discipline</span>
              </h1>
            </div>
            <div className={s.description}>
              <PortableText blocks={discipline.overview} />
            </div>
          </div>
        </section>
        {methods.length !== 0 &&
        <section>
          <h2>{discipline.title} Methods</h2>
          <Card content={methods.nodes} />
        </section>}
      </article>
    </Layout>
  )
}

export const query = graphql`
query($slug: String!) {
  discipline: sanityDiscipline (slug: {current: { eq: $slug }}) {
    title
    slug {
      current
    }
    uri {
      current
    }
    slug {
      current
    }
    metaDescription
    overview: _rawOverview(resolveReferences: {maxDepth: 10})
    heroImage {
      ...ImageWithPreview
      _rawAsset(resolveReferences: {maxDepth: 10})
    }
  }
  methods: allSanityMethod (filter: {disciplinesReference: {elemMatch: {slug: {current: {eq: $slug}}}}}
                            sort: {fields: title}) {
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
`;
