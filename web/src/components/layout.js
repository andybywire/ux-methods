import * as React from 'react'
import Helmet from 'react-helmet'
import SideNav from './sideNav'
import Header from './header'
import Footer from './footer'
import { yourClassName, anotherClassName } from './layout.module.scss'

const Layout = ({ children }) => {
  return (
    <>
      <Helmet>
        <script src='/app.js' type="text/javascript" />
      </Helmet>
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
