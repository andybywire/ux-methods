import React from 'react'
import { Link } from "gatsby"
import PortableText from "./portableText"

const Method = ({ data }) => {
  return (
    <div>
      <h2>{data.title}</h2>
      {/*<p>{data.metaDescription}</p>*/}
      <PortableText blocks={data.overview} />
      <PortableText blocks={data.steps} />
      <Link to='/'>Back to Index</Link>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </div>
  );
}

export default Method
