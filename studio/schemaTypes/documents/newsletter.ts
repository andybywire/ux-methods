import {defineType, defineField} from 'sanity'
import {RiArticleLine} from 'react-icons/ri'

/**
 * Newsletter Type
 * Newsletters communicate periodic updates concerning trends in 
 * the UX profession and relate those trends to UX Methods resources
 */
export default defineType({
  name: 'newsletter',
  type: 'document',
  title: 'Newsletters',
  icon: RiArticleLine,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
    }),
    defineField({
      name: 'resources',
      title: 'Related Resources',
      description:
        'External resources related to topics discussed in this newsletter.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'resource'}],
          options: {
            aiAssist:{
              embeddingsIndex: 'external-resources',
            },
            embeddingsIndex: {
              indexName: 'external-resources',
              maxResults: 10,
              searchMode: 'embeddings'
            }
          },
        },
      ],
    }),
  ]
})