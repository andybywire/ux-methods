import React from 'react';
import { Link } from 'part:@sanity/base/router';

export default {
  name: 'method',
  type: 'document',
  title: 'Method',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title'
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      validation: Rule => Rule.required(),
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Short Description',
      rows: 3,
      validation: Rule => Rule.required()
    },
    {
      name: 'heroImage',
      type: 'heroImage',
      title: 'Hero Image'
    },
    {
      name: 'disciplines',
      type: 'array',
      title: 'Discipline(s)',
      description: 'List the disciplines in which this method is most commonly used.',
      of: [
        {
          name: 'referencedDiscipline',
          type: 'reference',
          title: 'Disciplines', // subtitle in reference modal
          description: (
            <span>
              Choose an existing discipline, or{' '}
              <Link href={'#'}>add a new discipline.</Link>
            </span>
          ),
          to: [{ type: 'discipline' }]
        }
      ]
    },
    {
      name: 'overview',
      type: 'bodyPortableText',
      title: 'Method Overview'
    },
    {
      name: 'steps',
      type: 'bodyPortableText',
      title: 'Method Steps'
    },
    {
      name: 'inputs',
      type: 'array',
      title: 'Inputs to this Method',
      description: 'What evidence, insight, or recommendations are needed in order to use this method?',
      of: [
        {
          name: 'input',
          type: 'reference',
          title: 'Method Input',
          description: (
            <span>
              Choose an existing I/O term, or{' '}
              <Link href={'#'}>add a new concept.</Link>
            </span>
          ),
          to: [{ type: 'concept'}]
        }
      ]
    },
    {
      name: 'outputs',
      type: 'array',
      title: 'Output of this Method',
      description: 'What evidence, insight, or recommendations does this method produce?',
      of: [
        {
          name: 'output',
          type: 'reference',
          title: 'Method Output',
          description: (
            <span>
              Choose an existing I/O term, or{' '}
              <Link href={'#'}>add a new concept.</Link>
            </span>
          ),
          to: [{ type: 'concept'}]
        }
      ]
    }
  ]
}
