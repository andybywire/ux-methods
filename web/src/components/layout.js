import * as React from 'react'
import Header from './header'
import { yourClassName, anotherClassName } from './layout.module.scss'

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>        
        {children}
      </main>
    </>
  )
}

export default Layout
