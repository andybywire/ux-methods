import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import { FiMenu } from "react-icons/fi"
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
          <button id="openMenu" className={s.openMenu} aria-label="Open site menu" type="button" ><FiMenu /></button>


        </nav>
      )}
    />
  )
}
