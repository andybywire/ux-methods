import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'source',
  title: 'Source',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'url',
    }),
  ],
})
