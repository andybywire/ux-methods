import {defineType, defineField} from 'sanity'
import {RiCompasses2Fill} from 'react-icons/ri'

/**
 * Discipline Type
 * An area of practice under the broader "UX Umbrella" of user centered
 * experience design that groups similar activities, areas of expertise,
 * and areas of design focus.
 */
export default defineType({
  name: 'discipline',
  type: 'document',
  icon: RiCompasses2Fill,
  title: 'Disciplines',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Local Name',
      description: 'The unique identifier for this resource that will be used in the URI.',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
        slugify: (input) => input.replace(/\s+/g, ''),
      },
    }),
    defineField({
      name: 'uri',
      type: 'slug',
      title: 'URI',
      description: 'Full Uniform Resource Identifier (URI) for this resource.',
      validation: (Rule) => Rule.required(),
      options: {
        source: (doc: any) => `https://uxmethods.org/discipline/${doc.slug.current}`,
        slugify: (input) => input.replace(/\s+/g, ''),
      },
    }),
    defineField({
      name: 'dateStamps',
      type: 'dateStamps',
      title: 'Creation & Revision Dates',
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
      name: 'overview',
      type: 'bodyPortableText',
      title: 'Discipline Overview',
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
