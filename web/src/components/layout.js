import * as React from 'react'
import SideNav from './sideNav'
import Header from './header'
import Footer from './footer'
import * as s from './layout.module.scss'

const Layout = ({ children }) => {
  return (
    <>
      <SideNav />
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout
