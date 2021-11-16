import * as React from 'react'
import Header from './header'
import Footer from './footer'
import { yourClassName, anotherClassName } from './layout.module.scss'

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout
