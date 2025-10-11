import {defineType, defineField} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'

/**
 * Documentation Type
 * On UX Methods, documentation is a generic type that capture information
 * about the UX Methods site, its purpose, and its intended use.
 */
export default defineType({
  name: 'documentation',
  type: 'document',
  icon: BlockContentIcon,
  title: 'Documentation',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Short Description',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      type: 'heroImage',
      title: 'Hero Image',
    }),
    defineField({
      name: 'body',
      type: 'bodyPortableText',
      title: 'Article Body',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      thumb: 'heroImage',
    },
    prepare(selection) {
      const {title, icon, thumb} = selection
      return {
        title: title,
        media: thumb ? thumb : icon,
      }
    },
  },
})
