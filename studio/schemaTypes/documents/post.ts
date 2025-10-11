import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'post',
  type: 'document',
  title: 'Post',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Post Content',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'resources',
      title: 'Related Resources',
      description:
        'External resources related to topics discussed in this post.',
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