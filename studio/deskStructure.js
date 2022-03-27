import React from 'react'
import S from '@sanity/desk-tool/structure-builder'
import { RiSettings4Line, RiNodeTree } from 'react-icons/ri'
import { AiOutlineTags, AiFillTags } from 'react-icons/ai'

import StudioPreview from './src/components/preview'
import MobilePreview from './src/components/mobilePreview'

// Give all documents of type procedure a web preview, as well as the default form view
export const getDefaultDocumentNode = ({schemaType}) => {
  if(schemaType === 'method') {
    return S.document().views([
      S.view.form(),
      S.view.component(StudioPreview).title('Preview'),
      S.view.component(MobilePreview).title('Mobile Preview')
    ])
  }
}

const hiddenDocTypes = (listItem) =>
!['siteSettings', 'skosConcept', 'skosConceptScheme'].includes(
  listItem.getId()
)

export default () =>
  S.list()
    .title('UX Methods')
    .items([
      ...S.documentTypeListItems().filter(hiddenDocTypes),
      S.divider(),
      S.documentTypeListItem("skosConcept").title("Concepts"),
      S.documentTypeListItem("skosConceptScheme").title("Taxonomy Schemes"),
      S.divider(),
      S.listItem()
        .title('Settings')
        .icon(RiSettings4Line)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        )
    ])
