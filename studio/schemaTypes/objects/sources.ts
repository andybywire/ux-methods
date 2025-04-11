import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sources',
  title: 'Sources',
  type: 'array',
  of: [
    defineField({
      name: 'source',
      title: 'Source',
      type: 'url',
    }),
  ],
})
