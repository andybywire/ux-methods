import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import * as s from "./footer.module.scss"

export default function Footer() {
  return (
    <StaticQuery
      query={graphql`
        query FooterQuery {
          sanitySiteSettings {
            title
            description
          }
        }
      `}
      render={data => (
        <footer>
          <Link to='/' className={s.title}>{data.sanitySiteSettings.title}</Link>
        </footer>
      )}
    />
  )
}
