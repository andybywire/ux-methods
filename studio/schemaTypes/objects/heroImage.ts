import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'heroImage',
  type: 'image',
  title: 'Image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Caption',
    }),
    defineField({
      name: 'alt',
      type: 'string',
      title: 'Alternative text',
      description:
        'Alternative (Alt) Text communicates the meaning of a non-decorative image relative to its document context. Leave blank for decorative images.',
    }),
  ],
  preview: {
    select: {
      imageUrl: 'asset.url',
      title: 'caption',
    },
  },
})
