import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import { FiMenu, FiChevronDown } from "react-icons/fi"
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
        <nav>
          <ul>
            <li className={s.title}><Link to="/">{data.site.title}</Link></li>
            <li><Link to="/">How To Use This Site</Link></li>
            <li className={["dropdown-toggle", s.hasSubmenu].join(' ')}><a href="javascript:;">Top Methods<FiChevronDown /></a>
              <ul>
                {data.methods.nodes.map(link => (
                  <li key={link.id}>
                  <Link to={`/method/${link.label.replace(' ', '')}`}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className={["dropdown-toggle", s.hasSubmenu].join(' ')}><a href="javascript:;">UX Disciplines<FiChevronDown /></a>
            <ul>
              {data.disciplines.nodes.map(link => (
                <li key={link.id}>
                <Link to={`/discipline/${link.slug.current}`}>{link.title}</Link>
                </li>
              ))}
            </ul>
            </li>
            <li><Link to="/">About</Link></li>
            <li><Link to="/">Participate</Link></li>
          </ul>

          <button id="openMenu" className={s.openMenu} aria-label="Open site menu" type="button" ><FiMenu /></button>
        </nav>
      )}
    />
  )
}
