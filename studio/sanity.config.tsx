import React from 'react'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {RiSettings4Line} from 'react-icons/ri'
import type {StructureBuilder} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {taxonomyManager} from './.yalc/sanity-plugin-taxonomy-manager' // for local development
import {schemaTypes} from './schemaTypes'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'
import {assist} from '@sanity/assist'
import {RobotIcon} from '@sanity/icons'
import {RiBubbleChartFill} from 'react-icons/ri'
import {BulkDelete} from '../plugins/sanity-plugin-bulk-delete/dist/index'
import {NodeTree} from './static/NodeTree'

const hiddenAiDocTypes = (listItem: any) =>
  !['siteSettings', 'skosConcept', 'skosConceptScheme', 'assist.instruction.context', 'taxonomyTest'].includes(
    listItem.getId(),
  )
const hiddenDocTypes = (listItem: any) =>
  !['siteSettings', 'skosConcept', 'skosConceptScheme', 'taxonomyTest'].includes(listItem.getId())

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

export default defineConfig([
  {
    name: 'production',
    title: 'UX Methods',
    icon: RiBubbleChartFill as React.ComponentType,

    projectId: '4g5tw1k0',
    dataset: 'production',
    basePath: '/production',

    plugins: [
      structureTool({
        structure: (S) => {
          return S.list()
            .title('UX Methods')
            .items([
              ...S.documentTypeListItems().filter(hiddenAiDocTypes),
              S.divider(),
              S.listItem()
              .title('Settings')
              .icon(RiSettings4Line)
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
              S.divider().title('Testing & Development'),
              S.listItem()
                .title('Taxonomy Inputs')
                .icon(NodeTree)
                .child(S.document().schemaType('taxonomyTest').documentId('taxonomyTest')),
            ])
        },
        defaultDocumentNode,
      }),
      visionTool(),
      taxonomyManager({
        baseUri: 'https://uxmethods.org/',
      }),
      embeddingsIndexDashboard(),
      BulkDelete({
        schemaTypes: schemaTypes, // Pass your schema types here
        // roles: ['administrator', 'editor'], // Optionally restrict to specific roles
      }),
      assist(),
    ],

    schema: {
      types: schemaTypes,
    },
  },
  {
    name: 'ai-settings',
    title: 'UX Methods | AI Settings',
    icon: RobotIcon as React.ComponentType,

    projectId: '4g5tw1k0',
    dataset: 'production',
    basePath: '/ai-settings',

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
  },
])
