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
!['concept', 'siteSettings', 'skosConcept', 'skosConceptScheme'].includes(
  listItem.getId()
)

export default () =>
  S.list()
    .title('UX Methods')
    .items([
      ...S.documentTypeListItems().filter(hiddenDocTypes),
      S.listItem()
        .title('I/O Taxonomy')
        .icon(RiNodeTree)
        .child(
          S.list()
            .title('Concepts')
            .items([
              S.listItem()
                .title('All Concepts')
                .icon(AiOutlineTags)
                .child(
                  S.documentList()
                    .title('All Concepts')
                    .filter('_type == "concept"')
                ),
              S.listItem()
                .title('Top Concepts')
                .icon(AiOutlineTags)
                .child(
                  S.documentList()
                    .title('Top Concepts')
                    .filter('_type == "concept" && topConcept == true')
                ),
              S.listItem()
                .title('Finding Concepts')
                .icon(AiFillTags)
                .child(
                  S.documentList()
                    .title('Finding Concepts')
                    .filter('_type == "concept" && "transputTaxonomy_Finding" in broaderConcept[]._ref')
                ),
              S.listItem()
                .title('Definition Concepts')
                .icon(AiFillTags)
                .child(
                  S.documentList()
                    .title('Definition Concepts')
                    .filter('_type == "concept" && "transputTaxonomy_Definition" in broaderConcept[]._ref')
                ),
              S.listItem()
                .title('Recommendation Concepts')
                .icon(AiFillTags)
                .child(
                  S.documentList()
                    .title('Recommendation Concepts')
                    .filter('_type == "concept" && "transputTaxonomy_Recommendation" in broaderConcept[]._ref')
                ),
              S.listItem()
                .title('Evaluation Concepts')
                .icon(AiFillTags)
                .child(
                  S.documentList()
                    .title('Evaluation Concepts')
                    .filter('_type == "concept" && "transputTaxonomy_Evaluation" in broaderConcept[]._ref')
                )
              // S.listItem()
              //   .title('Concepts by Top Concept')
              //   .child(
              //     S.documentTypeList('concept')
              //       .title('Concepts by Top Concept')
              //       .filter('_type == "concept" && topConcept == true')
              //       .child(topConceptId =>
              //         S.documentList()
              //           .title('Concepts')
              //           .filter('_type == "concept" && $topConceptId in broaderConcept[]._ref')
              //           .params({ topConceptId })
              //       )
              //   )
            ])
        ),
      // S.divider(),
      // S.documentTypeListItem("skosConcept").title("Concepts"),
      // S.documentTypeListItem("skosConceptScheme").title("Taxonomy Schemes"),
      // S.divider(),
      S.listItem()
        .title('Settings')
        .icon(RiSettings4Line)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        )
    ])
