import { RiCompasses2Fill, RiCompassesLine } from 'react-icons/ri'

export default {
  name: 'discipline',
  type: 'document',
  icon: RiCompasses2Fill,
  title: 'Disciplines',
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
      name: 'overview',
      type: 'bodyPortableText',
      title: 'Discipline Overview'
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
        media: RiCompassesLine
      }
    }
  }
}
