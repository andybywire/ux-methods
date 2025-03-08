import React from 'react'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {RiSettings4Line} from 'react-icons/ri'
import type {StructureBuilder} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {taxonomyManager} from 'sanity-plugin-taxonomy-manager'
import {schemaTypes} from './schemaTypes'
// import parse from 'html-react-parser' // Import html-react-parser
// npm install html-react-parser

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
  // below is how I would do this if I want to reuse templates from 11ty.
  // this would work better for simple, self-contained templates. For what I'm doing
  // with UX Methods, where there are several sections mixed in with other data, this 
  // may not be the best approach.

//   const templateString =   `<main>
//   <h1>${discipline.title}</h1>
//   <p>${discipline.metaDescription}</p>
//   <p>
//     <a href="/">back to index</a>
//   </p>
// </main>`

  // return templateString

// return templateString
// return <div>{parse(templateString)}</div> // Use html-react-parser to safely parse and render the HTML string

  // return <div dangerouslySetInnerHTML={{__html: templateString}} />

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
  ],

  schema: {
    types: schemaTypes,
  },
  document: {
    comments: {
      enabled: false,
    },
  },
  tasks: {enabled: false},
  scheduledPublishing: {enabled: false},
})
