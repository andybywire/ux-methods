import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {RiSettings4Line} from 'react-icons/ri'
import {visionTool} from '@sanity/vision'
import {taxonomyManager} from 'sanity-plugin-taxonomy-manager'
import {schemaTypes} from './schemaTypes'

const hiddenDocTypes = (listItem: any) =>
  !['siteSettings', 'skosConcept', 'skosConceptScheme'].includes(listItem.getId())

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
