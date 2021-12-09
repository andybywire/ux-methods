import React from 'react';
import { graphql } from 'gatsby';
import * as s from './method.module.scss';
import SanityImage from 'gatsby-plugin-sanity-image';
import PortableText from '../components/portableText';
import Layout from '../components/layout';
import {Helmet} from "react-helmet";
import Card from '../components/cards/card';

export default function DisciplinePage({data: { discipline }, data: { methods }}) {

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": discipline.uri.current,
    "headline": discipline.title,
    "image": {
      "@type": "ImageObject",
      "inLanguage": "en-US",
      "url": discipline.heroImage.asset.url
    },
    "author": {
      "@id": "https://www.andyfitzgeraldconsulting.com/#person",
      "@type": "Person",
      "description": "Andy Fitzgerald is an independent user experience professional with applied expertise in design research, information architecture, interaction design, and usability testing.",
      "disambiguatingDescription": "User experience architecture and design consultant.",  
      "email": "mailto:andy@andyfitzgeraldconsulting.com",
      "image": "https://andyfitzgeraldconsulting.com/img/about/andyfitzgerald.jpg",
      "jobTitle": "Information Architect",
      "name": "Andy Fitzgerald",
      "givenName": "Andy",
      "familyName": "Fitzgerald",
      "alternateName": "andybywire",
      "url": "https://www.andyfitzgeraldconsulting.com",
      "sameAs": [
        "https://www.oreilly.com/pub/au/6128",
        "https://alistapart.com/author/andyfitzgerald/",
        "http://www.iasummit.org/person/andy-fitzgerald/",
        "https://www.worldiaday.org/people/andy-fitzgerald",
        "https://www.uxbooth.com/author/andyfitzgerald/",
        "https://aycl.uie.com/experts/andy_fitzgerald",
        "https://www.theiaconference.com/person/andy-fitzgerald/",
        "https://www.crunchbase.com/person/andy-fitzgerald"
      ]
    }
  };

  return (
    <Layout>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(ldJson)}
        </script>
      </Helmet>
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
      asset {
        url
      }
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
