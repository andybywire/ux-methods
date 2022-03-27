import { RiGitCommitLine, RiBubbleChartFill } from 'react-icons/ri'
import MetaDescription from '../../components/MetaDescription'

export default {
  name: 'method',
  type: 'document',
  icon: RiBubbleChartFill,
  title: 'Methods',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title'
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Local Name',
      description: 'The unique identifier for this resource that will be used in the URI.',
      validation: Rule => Rule.required(),
      options: {
        source: 'title',
        slugify: input => input.replace(/\s+/g, '')
      }
    },
    {
      name: 'uri',
      type: 'slug',
      title: 'URI',
      description: 'Full Uniform Resource Identifier (URI) for this resource.',
      value: Rule => Rule.required(),
      options: {
        source: doc => `https://uxmethods.org/method/${doc.slug.current}`,
        slugify: input => input.replace(/\s+/g, '')
      }
    },
    {
      name: 'dateStamps',
      type: 'dateStamps',
      title: 'Creation & Revision Dates'
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Short Description',
      rows: 3,
      validation: Rule => [
        Rule.max(100),
        Rule.required()
      ],
      inputComponent: MetaDescription
    },
    {
      name: 'heroImage',
      type: 'heroImage',
      title: 'Hero Image'
    },
    {
      name: 'disciplinesReference',
      type: 'array',
      title: 'Discipline(s)',
      description: 'List the disciplines in which this method is most commonly used.',
      of: [{ type: 'referencedDiscipline'}]
    },
    {
      name: 'overview',
      type: 'bodyPortableText',
      title: 'Method Overview'
    },
    {
      name: 'overviewSources',
      type: 'array',
      title: 'Overview Sources',
      of: [{ type: 'source'}]
    },
    {
      name: 'steps',
      type: 'bodyPortableText',
      title: 'Method Steps'
    },
    {
      name: 'stepSources',
      type: 'array',
      title: 'Step Sources',
      of: [{ type: 'source'}]
    },
    {
      name: 'input',
      title: 'Inputs to this Method',
      description: 'What evidence, insight, or recommendations are needed in order to use this method?',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'skosConcept'}],
          options: {
            filter: '_type == $type && (scheme->title == $scheme)',
            filterParams: {
              type: 'skosConcept',
              scheme: 'Outcomes'
            }
          }
        }
      ]
    },
    {
      name: 'output',
      title: 'Outputs of this Method',
      description: 'What evidence, insight, or recommendations does this method produce?',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'skosConcept'}],
          options: {
            filter: '_type == $type && (scheme->title == $scheme)',
            filterParams: {
              type: 'skosConcept',
              scheme: 'Outcomes'
            }
          }
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      thumb: 'heroImage',
      discipline0: 'disciplinesReference.0.title',
      discipline1: 'disciplinesReference.1.title',
      discipline2: 'disciplinesReference.2.title',
      discipline3: 'disciplinesReference.3.title',
    },
    prepare(selection) {
      const {title, discipline0, discipline1, discipline2, discipline3, thumb} = selection
      const disciplines = [discipline0, discipline1, discipline2, discipline3].filter(Boolean)
      const subtitle = disciplines.length > 0 ? `${disciplines.join(', ')}` : ''
      return {
        title: title,
        subtitle: subtitle,
        media: thumb ? thumb : RiGitCommitLine
      }
    }
  }
}
