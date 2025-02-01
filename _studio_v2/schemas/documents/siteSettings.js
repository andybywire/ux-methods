import { RiSettings4Line } from 'react-icons/ri'

export default {
  name: 'siteSettings',
  title: 'Settings',
  icon: RiSettings4Line,
  type: 'document',
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string'
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      description: 'A one line encapsulation of the site.',
      rows: 2
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      description: 'A short, user friendly description of the site.',
      rows: 3
    },
    {
      name: 'metaDescription',
      title: 'Site Meta Description',
      type: 'text',
      description: 'A description of the site for search engines and for users on SERPs.',
      rows: 3
    },
    {
      name: 'overview',
      title: 'Site Overview',
      description: 'A summary description of the site purpose and goals. One to two sentences.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'}
          ],
          lists: [],
          marks: {
            // Only allow these decorators
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'}
            ]
          }
        }
      ]
    },
    {
      name: 'colophon',
      title: 'Colophon',
      description: 'A brief statement about the tools and processes used to create, publish, and maintain the site.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'}
          ],
          lists: [],
          marks: {
            // Only allow these decorators
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'}
            ]
          }
        }
      ]
    },
    {
      name: 'socialMediaLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [{ type: 'socialMedia'}]
    },
    {
      name: 'credits',
      title: 'Site Credits',
      type: 'array',
      of: [{ type: 'credit'}]
    }
  ]
}
