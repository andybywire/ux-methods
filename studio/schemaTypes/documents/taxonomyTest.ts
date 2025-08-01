import {defineType, defineField} from 'sanity'
import {NodeTree} from '../../static/NodeTree'
import {ArrayHierarchyInput, ReferenceHierarchyInput} from 'sanity-plugin-taxonomy-manager'
import {branchFilter, schemeFilter} from 'sanity-plugin-taxonomy-manager'

const schemeIdWithTop = '1293cc'
const branchIdWithTop = 'fb5d42'
const schemeIdNoTop = 'aec22151-f3ad-4866-9ce1-cad7d98ab340'
const branchIdNoTop = 'N_WLDj'

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
      name: 'singleTermFromSchemeNoTop',
      title: 'Single Term Reference from Scheme, No Top Concept',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: schemeFilter({schemeId: schemeIdNoTop}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'singleTermFromScheme',
      title: 'Single Term Reference from Scheme with Top Concept',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: schemeFilter({schemeId: schemeIdWithTop}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'singleTermFromBranchNoTop',
      title: 'Single Term Reference from Branch, No Top Concept',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: branchFilter({schemeId: schemeIdNoTop, branchId: branchIdNoTop}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'singleTermFromBranch',
      title: 'Single Term Reference from Branch with Top Concept',
      type: 'reference',
      to: [{type: 'skosConcept'}],
      options: {
        filter: branchFilter({schemeId: schemeIdWithTop, branchId: branchIdWithTop}),
        disableNew: true,
      },
      components: {field: ReferenceHierarchyInput},
    }),
    defineField({
      name: 'arrayFromScheme',
      title: 'Array of Terms from Scheme',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: {type: 'skosConcept'},
          options: {
            filter: schemeFilter({schemeId: schemeIdWithTop}),
            disableNew: true,
          },
        },
      ],
      components: {field: ArrayHierarchyInput},
    }),
    defineField({
      name: 'arrayFromBranch',
      title: 'Array of Terms from Branch',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: {type: 'skosConcept'},
          options: {
            filter: branchFilter({schemeId: schemeIdWithTop, branchId: branchIdWithTop}),
            disableNew: true,
          },
        },
      ],
      components: {field: ArrayHierarchyInput},
    }),
  ],
})
