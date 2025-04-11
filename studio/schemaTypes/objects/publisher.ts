import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'publisher',
  title: 'Publisher',
  type: 'object',
  fields: [
    defineField({
      name: 'pubName',
      type: 'string',
      title: 'Name',
    }),
    defineField({
      name: 'pubUrl',
      type: 'url',
      title: 'Publisher Address',
    }),
  ],
})
