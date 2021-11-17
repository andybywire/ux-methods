import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import { FiX } from "react-icons/fi"
import * as s from "./sideNav.module.scss"

export default function SideNav() {
  return (
    <StaticQuery
      query={graphql`
        query SideNavQuery {
          sanitySiteSettings {
            title
            description
          }
        }
      `}
      render={data => (
        <div id="globalNav" className={s.sideNav}>
          <p>UX Methods Side Nav</p>
          <Link to='/'>{data.sanitySiteSettings.title}</Link>
          <button id="closeMenu" aria-label="Close site menu" className={s.closeBtn} type="button"><FiX /></button>
        </div>
      )}
    />
  )
}
