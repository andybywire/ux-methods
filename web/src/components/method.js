import React from 'react'
import { Link } from "gatsby"
import PortableText from "./portableText"
import SanityImage from "gatsby-plugin-sanity-image"
import HeroPlaceholder from "../images/svg/heroPlaceholder.svg"

const Method = ({ method, transput, cards }) => {

  // Get related methods for which the current method's outputs provide inputs
  // -> future need: sort by sharedTransput count
  const relatedMethods = transput.nodes.map(item => item.methodB);

  // Filter method cards to only those on the relatedMethods list
  // -> "define what you want to keep and then return true for those values"
  const sharedCards = cards.nodes.filter(card => relatedMethods.includes(card.uri.current));

  return (
    <div>
      <h2>{method.title}</h2>
      {method.heroImage &&
        <SanityImage {...method.heroImage} width={500} alt=""
          style={{
          width: "50%",
          objectFit: "cover",
        }}/>
      }
      {method.heroImage &&
        <p>Photo by <a href={method.heroImage._rawAsset.source.url}>{method.heroImage._rawAsset.creditLine.replace(" by "," via ")}</a></p>
      }
      {!method.heroImage &&
        <HeroPlaceholder
          style={{
          width: "100%",
          height: "auto",
        }}/>
      }
      <PortableText blocks={method.overview} />
      <PortableText blocks={method.steps} />

      <h2>Related Methods</h2>
      {sharedCards.map(method => (
        <div>
          <h3>{method.title}</h3>
          <p>{method.metaDescription}</p>
          <pre>{method.uri.current}</pre>
        </div>
      ))}

      {/*<pre>{JSON.stringify(relatedMethods, null, 2)}</pre>
      <pre>Shared Cards: {JSON.stringify(sharedCards, null, 2)}</pre>*/}
      <Link to='/'>Back to Index</Link>
    </div>
  );
}

export default Method
