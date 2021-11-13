import React from "react"
import { Link } from "gatsby"
import SanityImage from "gatsby-plugin-sanity-image"
import Grid from "./grid"
import * as s from "./compactCard.module.scss"

const CompactCard = ({ content }) => {
  return(
    <Grid>
    {content.map(method => (
      <li className={s.card}>
        {/* replace with proper local URI */}
        <Link to={`/method/${method.title.replaceAll(" ","")}`}>
          <SanityImage {...method.heroImage} width={500} alt=""/>
          <div>
            <h3>{method.title}</h3>
            <p>{method.metaDescription}</p>
          </div>
        </Link>
      </li>
    ))}
    </Grid>
  )
}

export default CompactCard
