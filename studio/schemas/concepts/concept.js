import { AiFillTag } from 'react-icons/ai'

export default {
  name: 'concept',
  type: 'document',
  icon: AiFillTag,
  title: 'Taxonomy Concept',
  fields: [
    {
      name: 'prefLabel',
      type: 'string',
      title: 'Preferred Label'
    },
    {
      name: 'altLabel',
      type: 'array',
      of: [
        {
          type: 'string'
        }
      ]
    },
    {
      name: 'hiddenLabel',
      type: 'array',
      of: [
        {
          type: 'string'
        }
      ]
    },
    {
      name: 'conceptId',
      type: 'slug',
      title: 'Concept URI',
      validation: Rule => Rule.required(),
      options: {
        source: 'prefLabel',
        slugify: input => input.replace(/\s+/g, '')
      }
    },
    {
      name: 'definition',
      type: 'text',
      title: 'Definition',
      rows: 3,
      validation: Rule => Rule.required()
    },
    {
      name: 'scopeNote',
      type: 'text',
      title: 'Scope Notes',
      rows: 3
    },
    {
      name: 'examples',
      type: 'text',
      title: 'Examples',
      rows: 3
    },
    {
      name: 'topConcept',
      type: 'boolean',
      title: 'Top Concept',
      description: 'Top Concepts are the highest categories in a concept scheme.',
      initialValue: false
    },
    {
      name: 'broaderConcept',
      title: 'Broader Concept',
      hidden: ({document}) => document?.topConcept,
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'concept' }],
          // Filtering will make more sense once individual concept schemes
          // (taxonomis) are correctly namespaced, per SKOS recs. This will
          // allow me to tet waay from the hack-y
          // "_ref": "transputTaxonomy_Finding", notation.
          //
          // options: {
          //   filter: ({document}) => {
          //     // Always make sure to check for document properties
          //     // before attempting to use them
          //     if (!document.broaderConcept) {
          //       return
          //     }
          //     return {
          //       filter: '$concept._ref in $broader[]._ref',
          //       params: {
          //         broader: document.broaderConcept,
          //         concept: 'broaderConcept'
          //       }
          //     }
          //   }
          // }
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'prefLabel',
      subtitle: 'broaderConcept.0.prefLabel'
    }
  }
}
