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
        source: doc => `https://uxmethods.org/discipline/${doc.slug.current}`,
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
      icon: 'icon',
      thumb: 'heroImage'
    },
    prepare(selection) {
      const {title, icon, thumb} = selection
      return {
        title: title,
        media: thumb ? thumb : icon
      }
    }
  }
}
