import React from "react"
import { Link } from "gatsby"
import SanityImage from "gatsby-plugin-sanity-image"
import Grid from "./grid"
import * as s from "./card.module.scss"

const Card = ({ content, style }) => {

  const cardStyle =
    (style === "dark") ? [s.card, s.dark].join(' ') : s.card;

  return (
    <Grid>
    {content.map(method => (
      <li className={cardStyle}>
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

export default Card
