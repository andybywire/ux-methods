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
      name: 'steps',
      type: 'bodyPortableText',
      title: 'Method Steps'
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
      media: 'icon'
    },
    prepare(selection) {
      const {title, media} = selection
      return {
        title: title,
        media: RiGitCommitLine
      }
    }
  }
}
