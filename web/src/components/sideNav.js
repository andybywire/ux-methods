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
              centrality
            }
          }
        }
      `}
      render={data => (
        <div id="globalNav" className={s.sideNav}>
          <button id="closeMenu" aria-label="Close site menu" className={s.closeBtn} type="button"><FiX /></button>

          <ul className={s.navint}>
            <li className={[s.primary, s.search].join(' ')}><Link to="/"><BiSearch />Search</Link></li>
            <li className={[s.primary, s.howTo].join(' ')}><Link to="/how-to-use"><AiOutlineBulb />How to Use This Site</Link></li>
            <li className={["dropdown-toggle", s.dropdown, s.primary].join(' ')}><a href="/">Top Methods<FiChevronDown /></a></li>
              <ul>
                {data.methods.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`/method/${link.label.replace(' ', '')}`}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            <li className={["dropdown-toggle", s.dropdown, s.primary].join(' ')}><a href="/">UX Disciplines<FiChevronDown /></a></li>
              <ul>
                {data.disciplines.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`/discipline/${link.slug.current}`}>{link.title}</Link>
                  </li>
                ))}
              </ul>
            <li><a href="/about">About</a></li>
            <li><a href="/about#contribute">Participate</a></li>
          </ul>
        </div>
      )}
    />
  )
}
