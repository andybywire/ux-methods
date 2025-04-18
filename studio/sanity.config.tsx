import React from 'react'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {RiSettings4Line} from 'react-icons/ri'
import type {StructureBuilder} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {taxonomyManager} from 'sanity-plugin-taxonomy-manager'
import {schemaTypes} from './schemaTypes'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'
import { assist } from '@sanity/assist'

// import {disciplineTemplate} from '../web/_src/discipline_js.11ty.js'

const hiddenDocTypes = (listItem: any) =>
  !['siteSettings', 'skosConcept', 'skosConceptScheme'].includes(listItem.getId())

export function defaultDocumentNode(S: StructureBuilder, {schemaType}: {schemaType: string}) {
  // Conditionally return a different configuration based on the schema type
  if (schemaType === 'discipline') {
    return S.document().views([S.view.form(), S.view.component(WebPreview).title('Preview')])
  }
}

// Simple example of web preview
const WebPreview = ({document}: any) => {
  const {displayed: discipline} = document
  // return disciplineTemplate(discipline) // once I sort out how to transform the export
  return (
    <main>
      <h1>{discipline.title}</h1>
      <p>{discipline.metaDescription}</p>
      <p>
        <a href="/">back to index</a>
      </p>
    </main>
  )
}

export default defineConfig({
  name: 'default',
  title: 'UX Methods',

  projectId: '4g5tw1k0',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) => {
        return S.list()
          .title('UX Methods')
          .items([
            ...S.documentTypeListItems().filter(hiddenDocTypes),
            S.divider(),
            S.listItem()
              .title('Settings')
              .icon(RiSettings4Line)
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ])
      },
      defaultDocumentNode,
    }),
    visionTool(),
    taxonomyManager({
      baseUri: 'https://uxmethods.org/',
    }),
    embeddingsIndexDashboard(),
    assist(),
  ],

  schema: {
    types: schemaTypes,
  },
})
