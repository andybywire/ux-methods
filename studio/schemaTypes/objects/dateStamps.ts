import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'dateStamps',
  type: 'object',
  title: 'Publication & Revision Dates',
  options: {
    columns: 2,
  },
  fields: [
    defineField({
      name: 'createdAt',
      type: 'date',
      title: 'Date Created',
      initialValue: new Date().toLocaleDateString('en-CA'),
    }),
    defineField({
      name: 'revisedAt',
      type: 'date',
      title: 'Date Revised',
    }),
  ],
})
