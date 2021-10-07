import React from 'react'
import S from '@sanity/desk-tool/structure-builder'
// import { MdSettings } from 'react-icons/md'

import StudioPreview from './src/components/preview'

// Give all documents of type procedure a web preview, as well as the default form view
export const getDefaultDocumentNode = ({schemaType}) => {
  if(schemaType === 'method') {
    return S.document().views([
      S.view.form(),
      S.view.component(StudioPreview).title('Preview')
    ])
  }
}

export default () =>
  S.list()
    .title('UX Methods')
    .items([
    ...S.documentTypeListItems()
    ])
