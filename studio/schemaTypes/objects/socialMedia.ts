import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'socialMedia',
  title: 'Social Media Links',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Platform Name',
      type: 'string',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
    }),
  ],
})
