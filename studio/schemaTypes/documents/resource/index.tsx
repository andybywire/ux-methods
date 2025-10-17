import {defineType, defineField} from 'sanity'
import {RiLinksLine, RiArticleLine} from 'react-icons/ri'
import GetLinkedData from './linkedDataInput'

export default defineType({
  name: 'resource',
  type: 'document',
  icon: RiLinksLine,
  title: 'Resources',
  fields: [
    defineField({
      name: 'resourceUrl',
      type: 'url',
      title: 'Resource URL',
    }),
    defineField({
      name: 'resourceUrlLd',
      title: 'URL and Linked Data',
      type: 'resourceUrlLd',
      components: {
        input: GetLinkedData,
      },
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'author',
      type: 'string',
      title: 'Author',
    }),
    defineField({
      name: 'publisher',
      type: 'publisher',
    }),
    defineField({
      name: 'pubDate',
      type: 'date',
      title: 'Date First Published',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Description',
      rows: 3,
    }),
    defineField({
      name: 'resourceImage',
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'methodDescribed',
      type: 'array',
      title: 'Method(s) Described',
      description: 'What UX Methods does this resource provide information about?',
      of: [{type: 'describedMethod'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      publisher: 'publisher.pubName',
      author: 'author',
      media: 'resourceImage',
    },
    prepare(selection) {
      const {title, publisher, author, media} = selection
      return {
        title: title,
        subtitle: author ? `${publisher} • ${author}` : publisher,
        media: media ?? RiArticleLine,
      }
    },
  },
})
