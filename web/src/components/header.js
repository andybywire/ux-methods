import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import * as s from "./header.module.scss"

export default function Header() {
  return (
    <StaticQuery
      query={graphql`
        query HeaderQuery {
          sanitySiteSettings {
            title
            description
          }
        }
      `}
      render={data => (
        <nav>
          <Link to='/' className={s.title}>{data.sanitySiteSettings.title}</Link>
        </nav>
      )}
    />
  )
}
