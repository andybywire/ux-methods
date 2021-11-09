import React from 'react'
import { Link } from "gatsby"
import PortableText from "./portableText"
import SanityImage from "gatsby-plugin-sanity-image"
import HeroPlaceholder from "../images/svg/heroPlaceholder.svg"

const Method = ({ data }) => {

{/*
Need to:
– define base URI, define URI scheme, integrate into content scheme ✅
  – cf. https://afs.github.io/rdf-iri-syntax.html
  – Uschold: property assertions use lowerCamelCase
- define deistinct vovabularies (method, discipline, taxonomy/transput) in schema or site metadata
– reduce the shared transput list to only those cards where Method A is the current method. Consider using .filter()
  – right now can use sanityMethod.slug.current; in the future I should add an IRI key (could be computed in Sanity)
– sort by shared transput value, then by alphabet(?). Limit to ... 4?
  – Eventually I'll use other data to refine this to a more closely delineated ranked list.
– create an array of cards with only the resulting values, in the same order
  --> see: https://stackoverflow.com/a/44063445/5087128; cf. compare function: https://www.w3schools.com/js/js_array_sort.asp

*/}




  let filteredCards = data.cards.edges.filter(card =>
       card.node.title === "Category Design"
    );
  return (
    <div>
      <h2>{data.sanityMethod.title}</h2>
      {/*<p>{data.sanityMethod.metaDescription}</p>*/}
      {data.sanityMethod.heroImage &&
        <SanityImage {...data.sanityMethod.heroImage} width={500} alt=""
          style={{
          width: "100%",
          objectFit: "cover",
        }}/>
      }
      {data.sanityMethod.heroImage &&
        <p>Photo by <a href={data.sanityMethod.heroImage._rawAsset.source.url}>{data.sanityMethod.heroImage._rawAsset.creditLine.replace(" by "," via ")}</a></p>
      }
      {!data.sanityMethod.heroImage &&
        <HeroPlaceholder
          style={{
          width: "100%",
          height: "auto",
        }}/>
      }
      <PortableText blocks={data.sanityMethod.overview} />
      <PortableText blocks={data.sanityMethod.steps} />

      <div>
      {filteredCards.map(({ node }) => (
        <div>
          <h2>{node.title}</h2>
          <p>{node.metaDescription}</p>
        </div>
      ))};
      <pre>{JSON.stringify(data.cards, null, 2)}</pre>
      </div>
      <Link to='/'>Back to Index</Link>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
      {/*<pre>{JSON.stringify(data.sanityMethod.heroImage, null, 2)}</pre>*/}
    </div>
  );
}

export default Method
