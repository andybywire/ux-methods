import { RiGitCommitLine, RiBubbleChartFill } from 'react-icons/ri'

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
      type: 'sources',
      title: 'Overview Sources'
    },
    {
      name: 'steps',
      type: 'bodyPortableText',
      title: 'Method Steps'
    },
    {
      name: 'stepSources',
      type: 'sources',
      title: 'Step Sources'
    },
    {
      name: 'transputReference',
      type: 'transputReference',
      title: 'Input/Output'
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
