import React from "react"
import { Link } from "gatsby"
import SanityImage from "gatsby-plugin-sanity-image"
import Grid from "./grid"
import * as s from "./compactCard.module.scss"

const CompactCard = ({ content, style }) => {

  const cardStyle =
    (style === "dark") ? [s.card, s.dark].join(' ') : s.card;

  return (
    <Grid style={style}>
    {content.map(resource => (
      <li className={cardStyle} key={resource.id}>
        {/* replace with proper local URI */}
        <Link to={`/${resource._type}/${resource.title.replaceAll(" ","")}`}>
          <SanityImage {...resource.heroImage} width={500} alt=""/>
          <div>
            <h3>{resource.title}</h3>
            <p>{resource.metaDescription}</p>
          </div>
        </Link>
      </li>
    ))}
    </Grid>
  )
}

export default CompactCard
