import { RiLinksLine, RiArticleLine } from 'react-icons/ri'
import LDHyperlink from '../../components/LDHyperlink'

export default {
  name: 'resource',
  type: 'document',
  icon: RiLinksLine,
  title: 'Resources',
  fields: [
    {
      name: 'ldHyperlink',
      type: 'url',
      title: 'Resource URL (Linked Data)',
      inputComponent: LDHyperlink
    },
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
      title: 'Image',
      options: {
        hotspot: true
      }
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
