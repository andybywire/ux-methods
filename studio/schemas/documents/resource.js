import { RiLinksLine, RiArticleLine } from 'react-icons/ri'

export default {
  name: 'resource',
  type: 'document',
  icon: RiLinksLine,
  title: 'Resources',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title'
    },
    {
      name: 'author',
      type: 'string',
      title: 'Author'
    },
    {
      name: 'publisher',
      type: 'publisher'
    },
    {
      name: 'pubDate',
      type: 'date',
      title: 'Date First Published'
    },
    {
      name: 'resourceUrl',
      type: 'url',
      title: 'Resource URL'
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Description',
      rows: 3
    },
    {
      name: 'resourceImage',
      type: 'image',
      title: 'Image'
    },
    {
      name: 'methodDescribed',
      type: 'array',
      title: 'Method(s) Described',
      description: 'What UX Methods does this resource provide information about?',
      of: [{ type: 'describedMethod'  }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      publisher: 'publisher.pubName',
      author: 'author',
      media: 'icon'
    },
    prepare(selection) {
      const {title, publisher, author, media} = selection
      return {
        title: title,
        subtitle: author ? `${publisher} • ${author}` : publisher,
        media: RiArticleLine
      }
    }
  }
}