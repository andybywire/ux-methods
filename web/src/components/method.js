import React from 'react'
import { Link } from "gatsby"
import PortableText from "./portableText"
import SanityImage from "gatsby-plugin-sanity-image"

const Method = ({ data }) => {
  return (
    <div>
      <h2>{data.title}</h2>
      {/*<p>{data.metaDescription}</p>*/}
      {data.heroImage &&
        <SanityImage {...data.heroImage} width={500} alt=""
          style={{
          width: "100%",
          objectFit: "cover",
        }}/>
      }
      <PortableText blocks={data.overview} />
      <PortableText blocks={data.steps} />
      <Link to='/'>Back to Index</Link>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/*<pre>{JSON.stringify(data.heroImage, null, 2)}</pre>*/}
    </div>
  );
}

export default Method
