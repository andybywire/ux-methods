export default {
  name: 'heroImage',
  type: 'image',
  title: 'Image',
  options: {
    hotspot: true
  },
  fields: [
    {
      name: 'caption',
      type: 'string',
      title: 'Caption'
    },
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative text',
      description: 'Alternative (Alt) Text communicates the meaningo of a non-decorative image relative to its document context. Leave blank for decorative images.'
    }
  ],
  preview: {
    select: {
      imageUrl: 'asset.url',
      title: 'caption'
    }
  }
}
