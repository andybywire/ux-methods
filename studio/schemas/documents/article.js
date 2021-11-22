import { RiArticleLine } from 'react-icons/ri'

export default {
  name: 'article',
  type: 'document',
  icon: RiArticleLine,
  title: 'Articles',
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
        source: 'title'
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
      name: 'body',
      type: 'bodyPortableText',
      title: 'Article Body'
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
