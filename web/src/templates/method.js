import React, { useEffect } from 'react';
import { graphql } from 'gatsby';
import * as s from './method.module.scss';
import Layout from '../components/layout';
import {Helmet} from "react-helmet";
import SanityImage from 'gatsby-plugin-sanity-image';
import PortableText from '../components/portableText';
import Card from '../components/cards/card';
import CompactCard from '../components/cards/compactCard';
import ResourceCard from '../components/cards/resourceCard';
import { FiExternalLink } from 'react-icons/fi';

export default function MethodPage({data, data: { method }}) {

  // Get methods which provide input for the current method
  const inputMethods = data.input.nodes.map(item => item.methodA);

  // Filter method cards to only those on the inputMethods list
  // -> "define what you want to keep and then return true for those values"
  const inputCards = data.cards.nodes.filter(card => inputMethods.includes(card.uri.current));

  // Get related methods for which the current method's outputs provide inputs
  const relatedMethods = data.allSharedTransputCsv.nodes.map(item => item.methodB);

  // Filter method cards to only those on the relatedMethods list
  const sharedCards = data.cards.nodes.filter(card => relatedMethods.includes(card.uri.current));

  const overviewCite = method.overviewSources;
  const stepCite = method.stepSources;
  const citations = overviewCite.concat(stepCite);

  const overviewCiteList = overviewCite.map((citation) => {
      const citationIndex = overviewCite.findIndex(i => i.name === citation.name);
      const citeNumber = citationIndex + 1;
      return (`<a href="#source${citeNumber}">[${citeNumber}]</a>`)
    });

  const stepCiteList = stepCite.map((citation) => {
    const citationIndex = stepCite.findIndex(i => i.name === citation.name);
    const citeNumber = citationIndex + 1 + overviewCite.length;
    return (`<a href="#source${citeNumber}">[${citeNumber}]</a>`)
  });

  // Get last update date, convert to date, and specify options
  const latestUpdate = new Date(method.dateStamps.revisedAt || method.dateStamps.createdAt);
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  // Add citation footnote references to description  
  useEffect(() => {
    const description = document.getElementById("description").childNodes[0].lastChild;
    const insertedText = `<span class="citation">${overviewCiteList.join(' ')}</span>`;
    description.insertAdjacentHTML('beforeend', insertedText);
  }, []);

  // Add citation footnote references to steps
  useEffect(() => {
    const steps = document.getElementById("steps").getElementsByTagName("OL")[0].lastChild;
    const insertedText = `<span class="citation">${stepCiteList.join(' ')}</span>`;
    steps.insertAdjacentHTML('beforeend', insertedText);
  }, []); 

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": method.uri.current,
    "headline": method.title,
    "datePublished": method.dateStamps.createdAt,
    "dateModified": method.dateStamps.reviseAt,
    "image": {
      "@type": "ImageObject",
      "inLanguage": "en-US",
      "url": method.heroImage.asset.url
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
      <article className={s.method}>
        <section className={s.overview}>
          <div className={s.hero}>
            <SanityImage {...method.heroImage} width={500} alt=''/>
            {method.heroImage._rawAsset.creditLine && 
            <p>Photo by <a href={method.heroImage._rawAsset.source.url} tabIndex='-1'>{method.heroImage._rawAsset.creditLine.replace(' by ',' via ')}</a></p>}
          </div>
          <div className={s.header}>
            <h1>
              <span>{method.title}</span>
              <span>Method</span>
            </h1>
          </div>
          <div id="description" className={s.description}>
            <PortableText blocks={method.overview} />                  
          </div>
        </section>
        {inputCards.length !== 0 &&
        <section>
          <h2>Preparation</h2>
          <p>{method.title} is often more effective when it is informed by these complementary methods.</p>
          <CompactCard content={inputCards} />
        </section>}
        <section className={s.details}>
          <div id="steps" className={s.steps}>
            <h2>Steps</h2>
            <PortableText blocks={method.steps} />
          </div>
          <div className={s.outcomes}>
            <h2>Outcomes</h2>
            <p>{method.title} typically produces insight and solutions focused on these areas:</p>
            <ul>
            {data.method.transputReference.outputReference.map(output => (
              <li key={output.id}>
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
        </section>}
      </article>
      {relatedMethods.length !== 0 &&
      <section className={[s.resourceCards, 'resource-cards'].join(' ')}>
        <h2>Next Steps</h2>
        <Card content={sharedCards} />
      </section>}
      <section className="admin-metadata">
        <h1>References</h1>
        {citations.length > 0 && 
          <ol>
            {citations.map((item, index) => 
              <li id={"source" + (index + 1)}><a href={item.source}>{item.name} <FiExternalLink /></a></li>
            )}
          </ol>}
          <p class="datestamp">{method.title} Method details last edited on {latestUpdate.toLocaleDateString('en-US', dateOptions)}</p>
      </section>
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
    id
    metaDescription
    overview: _rawOverview(resolveReferences: {maxDepth: 10})
    overviewSources {
      name
      source
    }
    steps: _rawSteps(resolveReferences: {maxDepth: 10})
    stepSources {
      name
      source
    }
    heroImage {
      ...ImageWithPreview
      _rawAsset(resolveReferences: {maxDepth: 10})
      asset {
        url
      }
    }
    transputReference {
      outputReference {
        id
        prefLabel
        definition
      }
    }
    dateStamps {
      createdAt
      revisedAt
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
      slug: slug {
        current
      }
      _type
      id
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
      id
      resourceImage {
        ...ImageWithPreview
        _rawAsset(resolveReferences: {maxDepth: 10})
      }
    }
  }
}
`;
