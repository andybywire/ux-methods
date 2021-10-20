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
      name: 'testImage',
      type: 'image',
      options: {
        hotspot: true
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
