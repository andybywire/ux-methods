import React from "react"
import { Router } from "@reach/router"

import Layout from "../../components/layout"
import Method from "../../components/method"
import Default from "../../components/default"

const Preview = () => {
  return (
    <Layout>
      <Router basepath="preview">
        <Method path="method/*" />
        <Default path="/" />
      </Router>
    </Layout>
  )
}

export default Preview
