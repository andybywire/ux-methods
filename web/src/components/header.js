import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import { FiMenu, FiChevronDown } from "react-icons/fi"
import { BiSearch} from "react-icons/bi"
import * as s from "./header.module.scss"

export default function Header() {
  return (
    <StaticQuery
      query={graphql`
        query NavQuery {
          site: sanitySiteSettings {
            title
            description
          }
          disciplines: allSanityDiscipline(sort: {order: ASC, fields: title}) {
            nodes {
              title
              slug {
                current
              }
              id
            }
          }
          methods: allMethodCentralityCsv(limit: 6) {
            nodes {
              label
              method
              id
            }
          }
        }
      `}
      render={data => (
        <nav>
          <ul>
            <li className={s.title}><Link to="/">{data.site.title}</Link></li>
            <li><Link to="/how-to-use">How To Use This Site</Link></li>
            <li className={s.hasSubmenu}>
              <button type="button" className="dropdown-toggle">Top Methods<FiChevronDown /></button>
              <ul>
                {data.methods.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`${link.method.replace('https://uxmethods.org', '')}`}>{link.label}</Link>
                  </li>
                ))}
                <li key='allMethods'>
                <Link to="/all-methods">See All Methods A-Z</Link>
                </li>
              </ul>
            </li>
            <li className={s.hasSubmenu}>
              <button type="button" className="dropdown-toggle">UX Disciplines<FiChevronDown /></button>
              <ul>
                {data.disciplines.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`/discipline/${link.slug.current}`}>{link.title}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li><Link to="/about">About</Link></li>
            <li className={s.searchIcon}><a href="/#site-search" aria-label="Search this site"><BiSearch /></a></li>
            {/*<li><Link to="/">Participate</Link></li>*/}
          </ul>

          {/*<button className={s.searchIcon} type="button" aria-label="Search this site"><a href="/#site-search"><BiSearch /></a></button>*/}

          <button id="openMenu" className={s.openMenu} aria-label="Open site menu" type="button" ><FiMenu /></button>
        </nav>
      )}
    />
  )
}
