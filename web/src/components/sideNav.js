import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import { FiX, FiChevronDown } from "react-icons/fi"
import { BiSearch} from "react-icons/bi"
import { AiOutlineBulb } from "react-icons/ai"
import * as s from "./sideNav.module.scss"

export default function SideNav() {
  return (
    <StaticQuery
      query={graphql`
        query SideNavQuery {
          disciplines: allSanityDiscipline(sort: {order: ASC, fields: title}) {
            nodes {
              title
              slug {
                current
              }
            }
          }
          methods: allMethodCentralityCsv(limit: 6) {
            nodes {
              method
              label
            }
          }
        }
      `}
      render={data => (
        <div id="globalNav" className={s.sideNav}>
          <button id="closeMenu" aria-label="Close site menu" className={s.closeBtn} type="button"><FiX /></button>

          <ul className={s.navint}>
            <li className={[s.primary, s.search].join(' ')}><a href="/#site-search"><BiSearch />Search</a></li>
            <li className={[s.primary, s.howTo].join(' ')}><Link to="/how-to-use"><AiOutlineBulb />How to Use This Site</Link></li>
            <li className={[s.dropdown, s.primary].join(' ')}>
              <button type="button" class="dropdown-toggle">Top Methods<FiChevronDown /></button>
              <ul>
                {data.methods.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`${link.method.replace('https://uxmethods.org', '')}`}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className={[s.dropdown, s.primary].join(' ')}>
              <button type="button" class="dropdown-toggle">UX Disciplines<FiChevronDown /></button>
              <ul>
                {data.disciplines.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`/discipline/${link.slug.current}`}>{link.title}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li><a href="/about">About</a></li>
            {/*<li><a href="/about#contribute">Participate</a></li>*/}
          </ul>
        </div>
      )}
    />
  )
}
