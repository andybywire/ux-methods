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
          disciplines: allSanityDiscipline {
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
              centrality
            }
          }
        }
      `}
      render={data => (
        <div id="globalNav" className={s.sideNav}>
          <button id="closeMenu" aria-label="Close site menu" className={s.closeBtn} type="button"><FiX /></button>

          <ul className={s.navint}>
            <li className={[s.primary, s.search].join(' ')}><BiSearch />Search</li>
            <li className={[s.primary, s.howTo].join(' ')}><AiOutlineBulb />How to Use This Site</li>
            <li className={["dropdown-toggle", s.dropdown, s.primary].join(' ')}>Top Methods<FiChevronDown /></li>
            <ul>
              {data.methods.nodes.map(link => (
                <li key={link.id}>
                <Link to={`/`}>{link.method}</Link>
                </li>
              ))}
            </ul>
            <li className={["dropdown-toggle", s.dropdown, s.primary].join(' ')}>UX Disciplines<FiChevronDown /></li>
            <ul>
              <li>Menu Item</li>
              <li>Menu Item</li>
              <li>Menu Item</li>
              <li>Menu Item</li>
            </ul>
            <li><a href="/about">About</a></li>
            <li><a href="/about#contribute">Participate</a></li>
          </ul>
        </div>
      )}
    />
  )
}
