import React from 'react'

import { Link } from "gatsby"

const Method = ({data}) => {
  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.metaDescription}</p>
      <Link to='/'>Back to Index</Link>
    </div>
  );
}

export default Method
