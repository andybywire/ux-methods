import React from "react"
import { Link } from "gatsby"
import SanityImage from "gatsby-plugin-sanity-image"
import * as s from "./card.module.scss"

const Card = ({ content }) => {
  return(
    <ul className={s.cardLg}>
    {content.map(method => (
      <li>
        <Link to={`/method/${method.title.replaceAll(" ","")}`}>
          <SanityImage {...method.heroImage} width={500} alt=""/>
          <div>
            <h3>{method.title}</h3>
            <p>{method.metaDescription}</p>
          </div>
        </Link>
      </li>
    ))}
    </ul>
  )
}

export default Card
