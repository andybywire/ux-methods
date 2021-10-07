import React from 'react'
import { Router } from '@reach/router'
import PreviewTemplate from './previewTemplate'

const Preview = () => {
  return (
    <Router basepath='preview'>
      <PreviewTemplate path='/*' />
    </Router>
  )
}

export default Preview
