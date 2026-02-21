import { defineType, defineField } from 'sanity';
import type { ArrayFieldProps, ObjectFieldProps, Reference } from 'sanity';
import { NodeTree } from '../../static/NodeTree';
import { ArrayHierarchyInput, ReferenceHierarchyInput } from 'sanity-plugin-taxonomy-manager';
import { branchFilter, schemeFilter } from 'sanity-plugin-taxonomy-manager';

const schemeIdWithTop = 'Mm-1Ra';
const branchIdWithTop = 'ZtFi7X';
const schemeIdNoTop = 'IkOv3B';
const branchIdNoTop = '9J4JH2';

/**
 * Taxonomy Input Tests
 * A selection of inputs to test the functionality and usability of taxonomy manager custom input components.
 */
export default defineType({
  name: 'taxonomyTest',
  title: 'Taxonomy Input Test',
  icon: NodeTree,
  type: 'document',
  // __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'This document is used to test the functionality and usability of taxonomy manager custom input components.',
      type: 'string',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Short Description',
      rows: 2,
    }),
    defineField({
      name: 'singleTermFromScheme',
      title: 'Single Term Reference from Scheme with Top Concept',
      type: 'reference',
      to: [{ type: 'skosConcept' }],
      options: {
        filter: schemeFilter({ schemeId: schemeIdWithTop, expanded: false }),
        disableNew: true,
        // aiAssist:{
        //   embeddingsIndex: 'io-taxonomy',
        // },
        // embeddingsIndex: {
        //   indexName: 'io-taxonomy',
        //   maxResults: 10,
        //   searchMode: 'embeddings'
        // }
      },
      components: {
        // field: ReferenceHierarchyInput
        field: (props: ObjectFieldProps<Reference>) => <ReferenceHierarchyInput
          {...props}
          embeddingsIndex={{
            "indexName": "io-taxonomy",
            "fieldReferences": ["title", "metaDescription"],
            "maxResults": 4,
          }} />
      },
    }),
    defineField({
      name: 'testField',
      type: 'text',
      title: 'Test Field',
      rows: 1,
    }),
    defineField({
      name: 'singleTermFromSchemeNoTop',
      title: 'Single Term Reference from Scheme, No Top Concept',
      type: 'reference',
      to: [{ type: 'skosConcept' }],
      options: {
        filter: schemeFilter({ schemeId: schemeIdNoTop }),
        disableNew: true,
      },
      components: { field: ReferenceHierarchyInput },
    }),
    defineField({
      name: 'singleTermFromBranchNoTop',
      title: 'Single Term Reference from Branch, No Top Concept',
      type: 'reference',
      to: [{ type: 'skosConcept' }],
      options: {
        filter: branchFilter({ schemeId: schemeIdNoTop, branchId: branchIdNoTop }),
        disableNew: true,
      },
      components: { field: ReferenceHierarchyInput },
    }),
    defineField({
      name: 'singleTermFromBranch',
      title: 'Single Term Reference from Branch with Top Concept',
      type: 'reference',
      to: [{ type: 'skosConcept' }],
      options: {
        filter: branchFilter({ schemeId: schemeIdWithTop, branchId: branchIdWithTop }),
        disableNew: true,
      },
      components: { field: ReferenceHierarchyInput },
    }),
    defineField({
      name: 'arrayFromScheme',
      title: 'Array of Terms from Scheme',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'skosConcept' },
          options: {
            filter: schemeFilter({ schemeId: schemeIdWithTop, expanded: true, browseOnly: true }),
            disableNew: true,
          },
        },
      ],
      components: {
        // field: ArrayHierarchyInput
        field: (props: ArrayFieldProps) => <ArrayHierarchyInput
          {...props}
          embeddingsIndex={{
            "indexName": "io-taxonomy",
            "fieldReferences": ["title", "metaDescription"],
            "maxResults": 4,
          }} />
      },
    }),
    defineField({
      name: 'arrayFromBranch',
      title: 'Array of Terms from Branch',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'skosConcept' },
          options: {
            filter: branchFilter({ schemeId: schemeIdWithTop, branchId: branchIdWithTop }),
            disableNew: true,
          },
        },
      ],
      components: {
        // field: ArrayHierarchyInput 
        field: (props: ArrayFieldProps) => <ArrayHierarchyInput
          {...props}
          embeddingsIndex={{
            "indexName": "io-taxonomy",
            "fieldReferences": ["title", "metaDescription"],
            "maxResults": 4,
          }} />
      },
    }),
  ],
});
