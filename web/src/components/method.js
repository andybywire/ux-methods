import React from 'react'
import { Link } from "gatsby"
import PortableText from "./portableText"
import SanityImage from "gatsby-plugin-sanity-image"
import HeroPlaceholder from "../images/svg/heroPlaceholder.svg"
import * as s from "./method.module.scss"
import Card from "./cards/card"
import CompactCard from "./cards/compactCard"

const Method = ({ method, transput, cards }) => {

  // Get related methods for which the current method's outputs provide inputs
  // -> future need: sort by sharedTransput count
  const relatedMethods = transput.nodes.map(item => item.methodB);

  // Filter method cards to only those on the relatedMethods list
  // -> "define what you want to keep and then return true for those values"
  const sharedCards = cards.nodes.filter(card => relatedMethods.includes(card.uri.current));

  return (
    <article>
      <section className={s.hero}>
        {method.heroImage &&
          <SanityImage {...method.heroImage} width={500} alt=""/>
        }
        {method.heroImage &&
          <p>Photo by <a href={method.heroImage._rawAsset.source.url}>{method.heroImage._rawAsset.creditLine.replace(" by "," via ")}</a></p>
        }
      </section>
      <section>
        <h1>
          <span>{method.title}</span>
          <span>Method</span>
        </h1>
        <PortableText blocks={method.overview} />
        <h2>Steps</h2>
        <PortableText blocks={method.steps} />
      </section>

      {relatedMethods.length !== 0 &&
        <section>
          <h2>Next Steps</h2>
          <Card content={sharedCards} />
        </section>
      }

      {/*<pre>{JSON.stringify(relatedMethods, null, 2)}</pre>*/}
      {/*<pre>Shared Cards: {JSON.stringify(sharedCards, null, 2)}</pre>*/}
    </article>
  );
}

export default Method
