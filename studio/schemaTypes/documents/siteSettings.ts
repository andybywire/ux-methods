import {defineType, defineField} from 'sanity'
import {RiSettings4Line} from 'react-icons/ri'

/**
 * Site Settings
 * The Settings type organizes site-wide metadata.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Settings',
  icon: RiSettings4Line,
  type: 'document',
  // __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      description: 'A one line encapsulation of the site.',
      rows: 2,
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      description: 'A short, user friendly description of the site.',
      rows: 3,
    }),
    defineField({
      name: 'metaDescription',
      title: 'Site Meta Description',
      type: 'text',
      description: 'A description of the site for search engines and for users on SERPs.',
      rows: 3,
    }),
    defineField({
      name: 'overview',
      title: 'Site Overview',
      description: 'A summary description of the site purpose and goals. One to two sentences.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            // Only allow these decorators
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'colophon',
      title: 'Colophon',
      description:
        'A brief statement about the tools and processes used to create, publish, and maintain the site.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            // Only allow these decorators
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'socialMediaLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [{type: 'socialMedia'}],
    }),
    defineField({
      name: 'credits',
      title: 'Site Credits',
      type: 'array',
      of: [{type: 'credit'}],
    }),
  ],
})
