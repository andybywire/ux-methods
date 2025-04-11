import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'credit',
  title: 'Site Credit',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Credit',
      type: 'string',
    }),
    defineField({
      name: 'creditBody',
      title: 'Site Credit Details',
      description: 'Add a brief description of and link to licenses and permissions.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            // Only allow these decorators
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        }),
      ],
    }),
  ],
})
